import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';
import { canyonDetailUrl } from './helpers/urlHelper';
import { CANYON_KEY_PREFIX, canyonKey, USERCANYON_KEY_PREFIX, userCanyonKey } from '../src/utils/canyonKey';

const goalsRouter: Router = express.Router();

const VALID_COUNT_MODES = ['records', 'days', 'distinct_canyons', 'distinct_regions', 'all_in_region'];

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoalRuleRow {
  Id: number;
  RuleType: string;
  IntValue: number | null;
  IntValues: string | null;
  IsExclusion: boolean;
}

interface GoalRow {
  Id: number;
  Label: string;
  MinCount: number | null;
  CountMode: string;
  RegionId: number | null;
  StartDate: string | null;
  RollingDays: number | null;
  CompletedAt: string | null;
  SortOrder: number;
}

export interface CanyonListEntry {
  Key: string;
  DetailUrl: string | null;
  Name: string;
  Url: string;
  RegionId?: number | null;
  RegionSlug?: string | null;
  RegionSymbol?: string | null;
  AquaticRating: number;
  VerticalRating: number;
  CommitmentRating: number;
  StarRating: number;
  IsUnrated: boolean;
  IsVerified: boolean;
  CanyonType: number | null;
  Descents: number;
  LastDescentDate?: string | null;
  IsFavourite?: boolean;
  SourceId?: number | null;
  SourceName?: string | null;
  SourceLogoUrl?: string | null;
  SourceWebsiteUrl?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Load GoalRules for one or more goal IDs, keyed by goal Id. */
async function loadRules(pool: any, goalIds: number[]): Promise<Record<number, GoalRuleRow[]>> {
  if (goalIds.length === 0) return {};
  const inList = goalIds.join(',');
  const result = await pool.request().query(
    `SELECT Id, GoalId, RuleType, IntValue, IntValues, IsExclusion
     FROM GoalRules WHERE GoalId IN (${inList})`
  );
  const map: Record<number, GoalRuleRow[]> = {};
  for (const row of result.recordset) {
    if (!map[row.GoalId]) map[row.GoalId] = [];
    map[row.GoalId].push({
      Id: row.Id,
      RuleType: row.RuleType,
      IntValue: row.IntValue,
      IntValues: row.IntValues,
      IsExclusion: row.IsExclusion,
    });
  }
  return map;
}

/** Replace all rules for a goal (delete + bulk insert). */
async function replaceRules(pool: any, goalId: number, rules: any[]): Promise<void> {
  await pool.request()
    .input('goalId', sql.Int, goalId)
    .query('DELETE FROM GoalRules WHERE GoalId = @goalId');

  for (const rule of rules) {
    await pool.request()
      .input('goalId', sql.Int, goalId)
      .input('ruleType', sql.NVarChar(30), rule.RuleType)
      .input('intValue', sql.Int, rule.IntValue ?? null)
      .input('intValues', sql.NVarChar(500), rule.IntValues ?? null)
      .input('isExclusion', sql.Bit, rule.IsExclusion ? 1 : 0)
      .query(`
        INSERT INTO GoalRules (GoalId, RuleType, IntValue, IntValues, IsExclusion)
        VALUES (@goalId, @ruleType, @intValue, @intValues, @isExclusion)
      `);
  }
}

/**
 * Build a parameterised WHERE clause fragment and parameter bindings from a goal's rules.
 *
 * Returns { conditions: string[], bindings: { name, type, value }[] }
 *
 * Region scope (Goals.RegionId) is handled separately by the caller — not a rule.
 */
async function buildRuleConditions(
  rules: GoalRuleRow[],
  paramOffset = 0
): Promise<{ conditions: string[]; totalConditions: string[]; bindings: { name: string; type: any; value: any }[] }> {
  const conditions: string[] = [];
  const totalConditions: string[] = [];
  const bindings: { name: string; type: any; value: any }[] = [];
  let idx = paramOffset;

  for (const rule of rules) {
    const pn = (suffix: string) => `rp${idx}_${suffix}`;
    const negate = rule.IsExclusion;

    function buildContainsCondition(field: string, inList: string, negate: boolean, bonusConditions: string[] = []): string {
      const condition = `${field} IN (${inList})`;
      const allConditions = [condition, ...bonusConditions].join(' AND ');
      return negate ? `NOT (${allConditions})` : allConditions;
    }

    switch (rule.RuleType) {
      case 'canyon_type': {
        const typeIds = (rule.IntValues ?? '').split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        if (typeIds.length === 0) break;
        const inList = typeIds.join(',');
        conditions.push(buildContainsCondition('COALESCE(c.CanyonType, uc.CanyonType)', inList, negate));
        totalConditions.push(buildContainsCondition('all_canyons.CanyonType', inList, negate));
        break;
      }
      case 'min_vertical': {
        const p = pn('minV');
        bindings.push({ name: p, type: sql.Int, value: rule.IntValue });
        const condition = `COALESCE(c.VerticalRating, uc.VerticalRating) >= @${p} AND COALESCE(c.IsUnrated, uc.IsUnrated) = 0`;
        conditions.push(negate ? `NOT (${condition})` : condition);
        const totalCondition = `all_canyons.VerticalRating >= @${p} AND all_canyons.IsUnrated = 0`;
        totalConditions.push(negate ? `NOT (${totalCondition})` : totalCondition);
        break;
      }
      case 'min_aquatic': {
        const p = pn('minA');
        bindings.push({ name: p, type: sql.Int, value: rule.IntValue });
        const condition = `COALESCE(c.AquaticRating, uc.AquaticRating) >= @${p} AND COALESCE(c.IsUnrated, uc.IsUnrated) = 0`;
        conditions.push(negate ? `NOT (${condition})` : condition);
        const totalCondition = `all_canyons.AquaticRating >= @${p} AND all_canyons.IsUnrated = 0`;
        totalConditions.push(negate ? `NOT (${totalCondition})` : totalCondition);
        break;
      }
      case 'min_commitment': {
        const p = pn('minC');
        bindings.push({ name: p, type: sql.Int, value: rule.IntValue });
        const condition = `COALESCE(c.CommitmentRating, uc.CommitmentRating) >= @${p} AND COALESCE(c.IsUnrated, uc.IsUnrated) = 0`;
        conditions.push(negate ? `NOT (${condition})` : condition);
        const totalCondition = `all_canyons.CommitmentRating >= @${p} AND all_canyons.IsUnrated = 0`;
        totalConditions.push(negate ? `NOT (${totalCondition})` : totalCondition);
        break;
      }
      case 'min_star': {
        const p = pn('minS');
        bindings.push({ name: p, type: sql.Int, value: rule.IntValue });
        const condition = `COALESCE(c.StarRating, uc.StarRating) >= @${p} AND COALESCE(c.IsUnrated, uc.IsUnrated) = 0`;
        conditions.push(negate ? `NOT (${condition})` : condition);
        const totalCondition = `all_canyons.StarRating >= @${p} AND all_canyons.IsUnrated = 0`;
        totalConditions.push(negate ? `NOT (${totalCondition})` : totalCondition);
        break;
      }
      case 'tag': {
        // Support multiple tags stored as comma-separated IntValues (AND semantics — all must match)
        const rawIds = rule.IntValues
          ? rule.IntValues.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
          : rule.IntValue != null ? [rule.IntValue] : [];
        for (let ti = 0; ti < rawIds.length; ti++) {
          const p = `rp${idx}_tag${ti}`;
          bindings.push({ name: p, type: sql.Int, value: rawIds[ti] });
          const condition = `EXISTS (SELECT 1 FROM CanyonRecordTags crt WHERE crt.CanyonRecordId = cr.Id AND crt.TagId = @${p})`;
          conditions.push(negate ? `NOT (${condition})` : condition);
        }
        break;
      }
      case 'first_time': {
        // Trip must be the user's first visit to that canyon (no earlier record for same canyon).
        // Tie-break by Id so that if two records share the same date, only the lowest Id counts.
        const condition = `NOT EXISTS (
          SELECT 1 FROM CanyonRecords prev
          WHERE prev.UserId = cr.UserId
            AND (prev.Date < cr.Date OR (prev.Date = cr.Date AND prev.Id < cr.Id))
            AND (
              (cr.CanyonId IS NOT NULL AND prev.CanyonId = cr.CanyonId)
              OR (cr.UserCanyonId IS NOT NULL AND prev.UserCanyonId = cr.UserCanyonId)
            )
        )`;
        conditions.push(negate ? `NOT (${condition})` : condition);
        break;
      }
    }
    idx++;
  }

  return { conditions, totalConditions, bindings };
}

/** Resolve all descendant region IDs (inclusive) for a given region using the Regions table. */
async function resolveRegionDescendants(pool: any, regionId: number): Promise<number[]> {
  const result = await pool.request()
    .input('rootId', sql.Int, regionId)
    .query(`
      WITH RegionTree AS (
        SELECT Id FROM Regions WHERE Id = @rootId
        UNION ALL
        SELECT r.Id FROM Regions r
        INNER JOIN RegionTree rt ON r.ParentId = rt.Id
      )
      SELECT Id FROM RegionTree
    `);
  return result.recordset.map((r: any) => r.Id);
}

/** Build the full set of WHERE conditions (region scope + rules) for a goal. */
async function buildGoalConditions(
  pool: any,
  goal: GoalRow,
  rules: GoalRuleRow[]
): Promise<{ conditions: string[]; totalConditions: string[]; bindings: { name: string; type: any; value: any }[] }> {
  const { conditions: ruleConditions, totalConditions, bindings } = await buildRuleConditions(rules);

  if (goal.RegionId != null) {
    const regionIds = await resolveRegionDescendants(pool, goal.RegionId);
    if (regionIds.length > 0) {
      const regionCondition = `COALESCE(c.RegionId, uc.RegionId) IN (${regionIds.join(',')})`;
      return { conditions: [regionCondition, ...ruleConditions], totalConditions, bindings };
    }
  }

  return { conditions: ruleConditions, totalConditions, bindings };
}

/**
 * Core FROM/WHERE fragment.
 * Caller binds: @userId, @startDate (may be computed from RollingDays)
 * Plus any bindings returned by buildRuleConditions.
 */
function buildBaseQuery(ruleConditions: string[]): string {
  const extra = ruleConditions.length > 0
    ? ruleConditions.map(c => `      AND ${c}`).join('\n')
    : '';
  return `
    FROM CanyonRecords cr
    LEFT JOIN Canyons c      ON cr.CanyonId     = c.Id
    LEFT JOIN UserCanyons uc ON cr.UserCanyonId  = uc.Id
    WHERE cr.UserId = @userId
      AND (@startDate IS NULL OR cr.Date >= @startDate)
    ${extra}
  `;
}

/** Resolve effective start date: absolute StartDate or RollingDays ago. */
function resolveStartDate(startDate: string | null, rollingDays: number | null): string | null {
  if (rollingDays != null) {
    const d = new Date();
    d.setDate(d.getDate() - rollingDays);
    return d.toISOString().slice(0, 10);
  }
  return startDate ?? null;
}

async function computeGoalCanyonsWithDescents(
  pool: any,
  userId: number,
  goal: GoalRow,
  rules: GoalRuleRow[]
): Promise<CanyonListEntry[]> {

  // If it's not a region-based goal, we don't need to find all the valid canyons.
  if (!(goal.CountMode == 'all_in_region' || rules.some(s => s.RuleType === 'first_time'))) return [];

  const { totalConditions } = await buildGoalConditions(pool, goal, rules);

  if(goal.RegionId != null) {
    const regionIds = await resolveRegionDescendants(pool, goal.RegionId);
    const inList = regionIds.join(',');
    totalConditions.push(`all_canyons.RegionId IN (${inList})`);
  }

  if(rules.some(r => r.RuleType === 'first_time')) {
    totalConditions.push(`all_canyons.Descents = 0`);
  }
  

  const totalWhere = totalConditions.length > 0
        ? `WHERE ${totalConditions.join(' AND ')}`
        : '';

  const all_canyons =
        await pool.request()
          .input('userId', sql.Int, userId)
          .query(`
            WITH all_canyons AS (
              SELECT CONCAT('${CANYON_KEY_PREFIX}', c.Id) as Id,
                c.Name,
                c.Url,
                c.AquaticRating,
                c.VerticalRating, 
                c.StarRating,
                c.CommitmentRating, 
                c.IsVerified, 
                c.IsUnrated, 
                c.CanyonType, 
                c.IsDeleted,
                c.SourceId, 
                c.RegionId,
                rgn.Symbol AS RegionSymbol,
                rgn.Slug AS RegionSlug,
                cs.DisplayName AS SourceName,
                cs.LogoUrl AS SourceLogoUrl,
                cs.WebsiteUrl AS SourceWebsiteUrl,
                COUNT(cr.Id) AS Descents,
                MAX(cr.Date) AS LastDescentDate,
                CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsFavourite
              FROM Canyons c
              LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
              LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
              LEFT JOIN CanyonFavourites cf ON cf.CanyonId = c.Id AND cf.UserId = @userId
              LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
              WHERE c.IsVerified = 1
              GROUP BY c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating, c.CommitmentRating, c.IsVerified, c.IsUnrated, c.RegionId, c.CanyonType, c.IsDeleted, c.SourceId, cf.Id, cs.DisplayName, cs.LogoUrl, cs.WebsiteUrl, rgn.Symbol, rgn.Slug
              UNION ALL
              SELECT CONCAT('${USERCANYON_KEY_PREFIX}', uc.Id) as Id,
                   uc.Name, 
                   uc.Url, 
                   uc.AquaticRating, 
                   uc.VerticalRating, 
                   uc.StarRating, 
                   uc.CommitmentRating, 
                   NULL AS IsVerified, 
                   uc.IsUnrated, 
                   uc.CanyonType,
                   0 AS IsDeleted,
                   NULL AS SourceId,
                   uc.RegionId,
                    rgn.Symbol AS RegionSymbol,
                    rgn.Slug AS RegionSlug,
                    NULL as SourceName,
                    NULL as SourceLogoUrl,
                    NULL as SourceWebsiteUrl,
                    COUNT(cr.Id) AS Descents,
                    MAX(cr.Date) AS LastDescentDate,
                    CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsFavourite
              FROM UserCanyons uc
              LEFT JOIN CanyonRecords cr ON cr.UserCanyonId = uc.Id
              LEFT JOIN CanyonFavourites cf ON cf.UserCanyonId = uc.Id AND cf.UserId = @userId
              LEFT JOIN Regions rgn ON uc.RegionId = rgn.Id
              WHERE uc.UserId = @userId
              GROUP BY uc.Id, uc.Name, uc.Url, uc.RegionId, uc.CanyonType,
                      rgn.Symbol, rgn.Slug,
                      uc.AquaticRating, uc.VerticalRating, uc.CommitmentRating,
                      uc.StarRating, uc.IsUnrated, cf.Id
          )
           SELECT * FROM all_canyons ${totalWhere}
          `);

          console.log(all_canyons);
  
  return all_canyons.recordset;

}

/** Compute progress for a goal, returning { currentCount, targetCount }. */
async function computeProgress(
  pool: any,
  userId: number,
  goal: GoalRow,
  rules: GoalRuleRow[]
): Promise<{ currentCount: number; targetCount: number | null }> {
  const effectiveStartDate = resolveStartDate(goal.StartDate, goal.RollingDays);

  const { conditions: allConditions, totalConditions, bindings } = await buildGoalConditions(pool, goal, rules);
  const baseQuery = buildBaseQuery(allConditions);

  const req = pool.request()
    .input('userId', sql.Int, userId)
    .input('startDate', sql.Date, effectiveStartDate);
  for (const b of bindings) req.input(b.name, b.type, b.value);

  let currentCount = 0;
  let targetCount: number | null = goal.MinCount ?? null;

  if (goal.CountMode === 'all_in_region') {
    // Current = distinct canyons visited in the region; target = total canyons in the region
    const progressResult = await req.query(`
      SELECT COUNT(DISTINCT
        CASE WHEN cr.CanyonId IS NOT NULL
             THEN 'c' + CAST(cr.CanyonId AS NVARCHAR(20))
             ELSE 'u' + CAST(cr.UserCanyonId AS NVARCHAR(20))
        END
      ) AS DistinctVisited
      ${baseQuery}
    `);
    currentCount = progressResult.recordset[0].DistinctVisited;

    if (goal.RegionId != null) {
      const regionIds = await resolveRegionDescendants(pool, goal.RegionId);
      const inList = regionIds.join(',');
      const totalReq = pool.request()
        .input('userId', sql.Int, userId);
      for (const b of bindings) totalReq.input(b.name, b.type, b.value);

      const totalWhere = totalConditions.length > 0
        ? `WHERE ${totalConditions.join(' AND ')}`
        : '';

      const totalResult = await totalReq.query(`
        SELECT COUNT(*) AS Total
        FROM (
          SELECT CONCAT('c', c.Id) as Id, c.CanyonType, c.VerticalRating, c.AquaticRating, c.CommitmentRating, c.StarRating, c.IsUnrated
          FROM Canyons c
          WHERE c.RegionId IN (${inList}) AND c.IsVerified = 1
          UNION ALL
          SELECT CONCAT('u', uc.Id) as Id, uc.CanyonType, uc.VerticalRating, uc.AquaticRating, uc.CommitmentRating, uc.StarRating, uc.IsUnrated
          FROM UserCanyons uc
          WHERE uc.RegionId IN (${inList}) AND uc.UserId = @userId
        ) all_canyons
        ${totalWhere}
      `);
      targetCount = totalResult.recordset[0]?.Total ?? 0;
    }
  } else {
    const result = await req.query(`
      SELECT
        COUNT(DISTINCT cr.Id)                                          AS RecordCount,
        COUNT(DISTINCT CAST(cr.Date AS DATE))                          AS DayCount,
        COUNT(DISTINCT
          CASE WHEN cr.CanyonId IS NOT NULL
               THEN 'c' + CAST(cr.CanyonId AS NVARCHAR(20))
               ELSE 'u' + CAST(cr.UserCanyonId AS NVARCHAR(20))
          END
        )                                                              AS DistinctCanyons,
        COUNT(DISTINCT COALESCE(c.RegionId, uc.RegionId))              AS DistinctRegions
      ${baseQuery}
    `);
    const row = result.recordset[0];
    if (goal.CountMode === 'days') currentCount = row.DayCount;
    else if (goal.CountMode === 'distinct_canyons') currentCount = row.DistinctCanyons;
    else if (goal.CountMode === 'distinct_regions') currentCount = row.DistinctRegions;
    else currentCount = row.RecordCount;
  }

  return { currentCount, targetCount };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/goals — list goals with computed progress
goalsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const includeCompleted = req.query.includeCompleted === 'true';

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT Id, Label, MinCount, CountMode, RegionId, StartDate, RollingDays, CompletedAt, SortOrder
        FROM Goals
        WHERE UserId = @userId
          ${includeCompleted ? '' : 'AND CompletedAt IS NULL'}
        ORDER BY SortOrder, Id
      `);

    const rows: GoalRow[] = result.recordset;
    if (rows.length === 0) return res.json([]);

    const rulesMap = await loadRules(pool, rows.map(r => r.Id));

    const goals = await Promise.all(
      rows.map(async (row) => {
        const rules = rulesMap[row.Id] ?? [];
        const { currentCount, targetCount } = await computeProgress(pool, userId, row, rules);
        return {
          ...row,
          Rules: rules,
          CurrentCount: currentCount,
          TargetCount: targetCount,
        };
      })
    );

    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET /api/goals/:id/trips — matching trips for auditability
goalsRouter.get('/:id/trips', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const id = Number(req.params.id);
    const goalResult = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id, Label, MinCount, CountMode, RegionId, StartDate, RollingDays, CompletedAt, SortOrder FROM Goals WHERE Id = @id AND UserId = @userId');
    if (goalResult.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    const goal: GoalRow = goalResult.recordset[0];
    const rulesMap = await loadRules(pool, [id]);
    const rules = rulesMap[id] ?? [];

    const effectiveStartDate = resolveStartDate(goal.StartDate, goal.RollingDays);
    const { conditions, bindings } = await buildGoalConditions(pool, goal, rules);
    const baseQuery = buildBaseQuery(conditions);

    const tripReq = pool.request()
      .input('userId', sql.Int, userId)
      .input('startDate', sql.Date, effectiveStartDate);
    for (const b of bindings) tripReq.input(b.name, b.type, b.value);

    const result = await tripReq.query(`
      SELECT
        cr.Id, cr.Date, cr.TripRating, cr.WaterLevel, cr.TeamSize,
        cr.CanyonId, cr.UserCanyonId
      ${baseQuery}
      ORDER BY cr.Date DESC
    `);

    res.json(result.recordset.map((row: any) => ({
      ...row,
      DetailUrl: canyonDetailUrl(row.CanyonId, row.UserCanyonId),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch matching trips' });
  }
});

// GET /api/goals/:id/canyons — matching canyons with descents for auditability
goalsRouter.get('/:id/canyons', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    // Load the Goal
    const id = Number(req.params.id);
    const goal = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id, Label, MinCount, CountMode, RegionId, StartDate, RollingDays, CompletedAt, SortOrder FROM Goals WHERE Id = @id AND UserId = @userId')
      .then(r => r.recordset[0] as GoalRow | undefined);
    if (!goal) return res.status(404).json({ error: 'Not found' });

    if(goal.RegionId == null) {
      return res.status(400).json({ error: 'Only regional completion goals are supported' });
    }

    // Load Rules for the Goal
    const rulesMap = await loadRules(pool, [id]);
    const rules = rulesMap[id] ?? [];

    // Get the Canyons that Apply to the Goal, along with descent counts and last descent date for the user, for auditability.
    res.json(await computeGoalCanyonsWithDescents(pool, userId, goal, rules));

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch matching canyons' });
  }
});

// GET /api/goals/:id
goalsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const id = Number(req.params.id);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('id', sql.Int, id)
      .query(`
        SELECT Id, Label, MinCount, CountMode, RegionId, StartDate, RollingDays, CompletedAt, SortOrder
        FROM Goals WHERE Id = @id AND UserId = @userId
      `);
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    const goal: GoalRow = result.recordset[0];
    const rulesMap = await loadRules(pool, [id]);
    const rules = rulesMap[id] ?? [];
    const { currentCount, targetCount } = await computeProgress(pool, userId, goal, rules);

    res.json({ ...goal, Rules: rules, CurrentCount: currentCount, TargetCount: targetCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// POST /api/goals
goalsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const { Label, MinCount, CountMode, RegionId, Rules, StartDate, RollingDays, SortOrder } = req.body;

    if (!Label?.trim()) return res.status(400).json({ error: 'Label is required' });
    if (!VALID_COUNT_MODES.includes(CountMode)) return res.status(400).json({ error: 'Invalid CountMode' });
    if (CountMode !== 'all_in_region' && (!MinCount || MinCount < 1))
      return res.status(400).json({ error: 'MinCount must be at least 1' });
    if (CountMode === 'all_in_region' && !RegionId)
      return res.status(400).json({ error: 'all_in_region mode requires a region' });

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('label', sql.NVarChar(200), Label.trim())
      .input('minCount', sql.Int, MinCount ?? null)
      .input('countMode', sql.NVarChar(20), CountMode)
      .input('regionId', sql.Int, RegionId ?? null)
      .input('startDate', sql.Date, StartDate ?? null)
      .input('rollingDays', sql.Int, RollingDays ?? null)
      .input('sortOrder', sql.Int, SortOrder ?? 0)
      .query(`
        INSERT INTO Goals (UserId, Label, MinCount, CountMode, RegionId, StartDate, RollingDays, SortOrder)
        OUTPUT INSERTED.Id
        VALUES (@userId, @label, @minCount, @countMode, @regionId, @startDate, @rollingDays, @sortOrder)
      `);

    const newId = result.recordset[0].Id;
    if (Array.isArray(Rules) && Rules.length > 0) {
      await replaceRules(pool, newId, Rules);
    }

    res.status(201).json({ Id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PUT /api/goals/:id
goalsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const id = Number(req.params.id);
    const { Label, MinCount, CountMode, RegionId, Rules, StartDate, RollingDays, SortOrder } = req.body;

    if (!Label?.trim()) return res.status(400).json({ error: 'Label is required' });
    if (!VALID_COUNT_MODES.includes(CountMode)) return res.status(400).json({ error: 'Invalid CountMode' });
    if (CountMode !== 'all_in_region' && (!MinCount || MinCount < 1))
      return res.status(400).json({ error: 'MinCount must be at least 1' });
    if (CountMode === 'all_in_region' && !RegionId)
      return res.status(400).json({ error: 'all_in_region mode requires a region' });

    const check = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Goals WHERE Id = @id AND UserId = @userId');
    if (check.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    await pool.request()
      .input('id', sql.Int, id)
      .input('label', sql.NVarChar(200), Label.trim())
      .input('minCount', sql.Int, MinCount ?? null)
      .input('countMode', sql.NVarChar(20), CountMode)
      .input('regionId', sql.Int, RegionId ?? null)
      .input('startDate', sql.Date, StartDate ?? null)
      .input('rollingDays', sql.Int, RollingDays ?? null)
      .input('sortOrder', sql.Int, SortOrder ?? 0)
      .query(`
        UPDATE Goals SET
          Label = @label, MinCount = @minCount, CountMode = @countMode,
          RegionId = @regionId, StartDate = @startDate, RollingDays = @rollingDays, SortOrder = @sortOrder
        WHERE Id = @id
      `);

    await replaceRules(pool, id, Array.isArray(Rules) ? Rules : []);
    res.json({ Id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// PATCH /api/goals/:id/complete
goalsRouter.patch('/:id/complete', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const id = Number(req.params.id);
    const check = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Goals WHERE Id = @id AND UserId = @userId');
    if (check.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Goals SET CompletedAt = GETUTCDATE() WHERE Id = @id');

    res.json({ Id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark goal complete' });
  }
});

// PATCH /api/goals/:id/reopen
goalsRouter.patch('/:id/reopen', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const id = Number(req.params.id);
    const check = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Goals WHERE Id = @id AND UserId = @userId');
    if (check.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Goals SET CompletedAt = NULL WHERE Id = @id');

    res.json({ Id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reopen goal' });
  }
});

// DELETE /api/goals/:id
goalsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const id = Number(req.params.id);
    const check = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Goals WHERE Id = @id AND UserId = @userId');
    if (check.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Goals WHERE Id = @id');

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default goalsRouter;
