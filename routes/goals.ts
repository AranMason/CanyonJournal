import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';
import { canyonDetailUrl } from './helpers/urlHelper';

const goalsRouter: Router = express.Router();

const VALID_COUNT_MODES = ['records', 'days', 'distinct_canyons'];

/**
 * Shared FROM/WHERE fragment for filtering CanyonRecords against a goal's criteria.
 * Caller must bind: @userId, @reqId, @minV, @minA, @minC, @startDate
 *
 * Tag filter: AND semantics — record must have ALL tags listed for this requirement.
 * We compare the count of matching CanyonRecordTags entries against the total required tags.
 *
 * Distinct-canyon counting: prefixes CanyonId with 'c' and UserCanyonId with 'u' to
 * prevent integer Id collisions between the two tables.
 *
 * Includes Region joins (LEFT JOIN) for rich trip responses — unused in progress queries.
 */
const MATCHING_RECORDS_SQL = `
    FROM CanyonRecords cr
    LEFT JOIN Canyons c      ON cr.CanyonId     = c.Id
    LEFT JOIN UserCanyons uc ON cr.UserCanyonId  = uc.Id
    LEFT JOIN Regions crgn   ON c.RegionId       = crgn.Id
    LEFT JOIN Regions ucrgn  ON uc.RegionId      = ucrgn.Id
    WHERE cr.UserId = @userId
      AND (@startDate IS NULL OR cr.Date >= @startDate)
      AND (@minV  IS NULL OR COALESCE(c.VerticalRating,   uc.VerticalRating)   >= @minV)
      AND (@minA  IS NULL OR COALESCE(c.AquaticRating,    uc.AquaticRating)    >= @minA)
      AND (@minC  IS NULL OR COALESCE(c.CommitmentRating, uc.CommitmentRating) >= @minC)
      AND (
          NOT EXISTS (SELECT 1 FROM GoalTags lrt WHERE lrt.RequirementId = @reqId)
          OR (
              SELECT COUNT(*)
              FROM CanyonRecordTags crt
              JOIN GoalTags lrt ON lrt.TagId = crt.TagId AND lrt.RequirementId = @reqId
              WHERE crt.CanyonRecordId = cr.Id
          ) = (SELECT COUNT(*) FROM GoalTags WHERE RequirementId = @reqId)
      )
`;

async function computeProgress(
  pool: any,
  userId: number,
  reqId: number,
  params: {
    MinVerticalRating?: number | null;
    MinAquaticRating?: number | null;
    MinCommitmentRating?: number | null;
    StartDate?: string | null;
    CountMode: string;
  }
): Promise<number> {
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('reqId', sql.Int, reqId)
    .input('minV', sql.Int, params.MinVerticalRating ?? null)
    .input('minA', sql.Int, params.MinAquaticRating ?? null)
    .input('minC', sql.Int, params.MinCommitmentRating ?? null)
    .input('startDate', sql.Date, params.StartDate ?? null)
    .query(`
      SELECT
        COUNT(DISTINCT cr.Id)                           AS RecordCount,
        COUNT(DISTINCT CAST(cr.Date AS DATE))           AS DayCount,
        COUNT(DISTINCT
          CASE WHEN cr.CanyonId IS NOT NULL
               THEN 'c' + CAST(cr.CanyonId AS NVARCHAR(20))
               ELSE 'u' + CAST(cr.UserCanyonId AS NVARCHAR(20))
          END
        )                                               AS DistinctCanyons
      ${MATCHING_RECORDS_SQL}
    `);

  const row = result.recordset[0];
  if (params.CountMode === 'days') return row.DayCount;
  if (params.CountMode === 'distinct_canyons') return row.DistinctCanyons;
  return row.RecordCount;
}

/** Load RequiredTagIds for one or more requirements (keyed by requirement Id) */
async function loadTagIds(pool: any, requirementIds: number[]): Promise<Record<number, number[]>> {
  if (requirementIds.length === 0) return {};
  // Build IN list — safe since these are integer IDs from the DB, not user input
  const inList = requirementIds.join(',');
  const result = await pool.request().query(
    `SELECT RequirementId, TagId FROM GoalTags WHERE RequirementId IN (${inList})`
  );
  const map: Record<number, number[]> = {};
  for (const row of result.recordset) {
    if (!map[row.RequirementId]) map[row.RequirementId] = [];
    map[row.RequirementId].push(row.TagId);
  }
  return map;
}

/** Replace all tags for a requirement (delete + reinsert) */
async function replaceTagIds(pool: any, requirementId: number, tagIds: number[]): Promise<void> {
  await pool.request()
    .input('reqId', sql.Int, requirementId)
    .query('DELETE FROM GoalTags WHERE RequirementId = @reqId');
  for (const tagId of tagIds) {
    await pool.request()
      .input('reqId', sql.Int, requirementId)
      .input('tagId', sql.Int, tagId)
      .query('INSERT INTO GoalTags (RequirementId, TagId) VALUES (@reqId, @tagId)');
  }
}

// GET /api/goals — list goals with computed progress
// Query param: ?includeCompleted=true to also return completed goals
goalsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const includeCompleted = req.query.includeCompleted === 'true';

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT Id, Label, MinCount,
               MinVerticalRating, MinAquaticRating, MinCommitmentRating,
               CountMode, StartDate, CompletedAt, SortOrder
        FROM Goals
        WHERE UserId = @userId
          ${includeCompleted ? '' : 'AND CompletedAt IS NULL'}
        ORDER BY SortOrder, Id
      `);

    const rows = result.recordset;
    if (rows.length === 0) return res.json([]);

    const tagMap = await loadTagIds(pool, rows.map((r: any) => r.Id));

    const requirements = await Promise.all(
      rows.map(async (row: any) => {
        const currentCount = await computeProgress(pool, userId, row.Id, row);
        return {
          ...row,
          RequiredTagIds: tagMap[row.Id] ?? [],
          CurrentCount: currentCount,
        };
      })
    );

    res.json(requirements);
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
    const reqRow = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Goals WHERE Id = @id AND UserId = @userId');
    if (reqRow.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    const requirement = reqRow.recordset[0];

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('reqId', sql.Int, id)
      .input('minV', sql.Int, requirement.MinVerticalRating ?? null)
      .input('minA', sql.Int, requirement.MinAquaticRating ?? null)
      .input('minC', sql.Int, requirement.MinCommitmentRating ?? null)
      .input('startDate', sql.Date, requirement.StartDate ?? null)
      .query(`
        SELECT
          cr.Id,
          cr.Date,
          cr.TripRating,
          cr.WaterLevel,
          cr.TeamSize,
          cr.CanyonId,
          cr.UserCanyonId
        ${MATCHING_RECORDS_SQL}
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

// GET /api/goals/:id — get a single goal with computed progress
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
        SELECT Id, Label, MinCount,
               MinVerticalRating, MinAquaticRating, MinCommitmentRating,
               CountMode, StartDate, CompletedAt, SortOrder
        FROM Goals
        WHERE Id = @id AND UserId = @userId
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    const row = result.recordset[0];
    const tagMap = await loadTagIds(pool, [id]);
    const currentCount = await computeProgress(pool, userId, id, row);

    res.json({ ...row, RequiredTagIds: tagMap[id] ?? [], CurrentCount: currentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// POST /api/goals — create a goal
goalsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const {
      Label, MinCount,
      MinVerticalRating, MinAquaticRating, MinCommitmentRating,
      RequiredTagIds, CountMode, StartDate, SortOrder,
    } = req.body;

    if (!Label?.trim()) return res.status(400).json({ error: 'Label is required' });
    if (!MinCount || MinCount < 1) return res.status(400).json({ error: 'MinCount must be at least 1' });
    if (!VALID_COUNT_MODES.includes(CountMode)) return res.status(400).json({ error: 'Invalid CountMode' });

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('label', sql.NVarChar(200), Label.trim())
      .input('minCount', sql.Int, MinCount)
      .input('minV', sql.Int, MinVerticalRating ?? null)
      .input('minA', sql.Int, MinAquaticRating ?? null)
      .input('minC', sql.Int, MinCommitmentRating ?? null)
      .input('countMode', sql.NVarChar(20), CountMode)
      .input('startDate', sql.Date, StartDate ?? null)
      .input('sortOrder', sql.Int, SortOrder ?? 0)
      .query(`
        INSERT INTO Goals
          (UserId, Label, MinCount, MinVerticalRating, MinAquaticRating,
           MinCommitmentRating, CountMode, StartDate, SortOrder)
        OUTPUT INSERTED.Id
        VALUES (@userId, @label, @minCount, @minV, @minA, @minC,
                @countMode, @startDate, @sortOrder)
      `);

    const newId = result.recordset[0].Id;
    if (Array.isArray(RequiredTagIds) && RequiredTagIds.length > 0) {
      await replaceTagIds(pool, newId, RequiredTagIds);
    }

    res.status(201).json({ Id: newId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PUT /api/goals/:id — update a goal
goalsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

    const id = Number(req.params.id);
    const {
      Label, MinCount,
      MinVerticalRating, MinAquaticRating, MinCommitmentRating,
      RequiredTagIds, CountMode, StartDate, SortOrder,
    } = req.body;

    if (!Label?.trim()) return res.status(400).json({ error: 'Label is required' });
    if (!MinCount || MinCount < 1) return res.status(400).json({ error: 'MinCount must be at least 1' });
    if (!VALID_COUNT_MODES.includes(CountMode)) return res.status(400).json({ error: 'Invalid CountMode' });

    const check = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Goals WHERE Id = @id AND UserId = @userId');
    if (check.recordset.length === 0) return res.status(404).json({ error: 'Not found' });

    await pool.request()
      .input('id', sql.Int, id)
      .input('label', sql.NVarChar(200), Label.trim())
      .input('minCount', sql.Int, MinCount)
      .input('minV', sql.Int, MinVerticalRating ?? null)
      .input('minA', sql.Int, MinAquaticRating ?? null)
      .input('minC', sql.Int, MinCommitmentRating ?? null)
      .input('countMode', sql.NVarChar(20), CountMode)
      .input('startDate', sql.Date, StartDate ?? null)
      .input('sortOrder', sql.Int, SortOrder ?? 0)
      .query(`
        UPDATE Goals SET
          Label = @label, MinCount = @minCount,
          MinVerticalRating = @minV, MinAquaticRating = @minA, MinCommitmentRating = @minC,
          CountMode = @countMode, StartDate = @startDate, SortOrder = @sortOrder
        WHERE Id = @id
      `);

    await replaceTagIds(pool, id, Array.isArray(RequiredTagIds) ? RequiredTagIds : []);

    res.json({ Id: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// PATCH /api/goals/:id/complete — mark a goal as complete (soft delete)
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

// PATCH /api/goals/:id/reopen — reopen a completed goal
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

// DELETE /api/goals/:id — hard delete a goal
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
