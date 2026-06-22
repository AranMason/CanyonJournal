import { sql } from '../middleware/sqlserver';
import { CanyonRecord } from '../../src/types/CanyonRecord';
import { canyonDetailUrl } from './urlHelper';

/** Upsert a list of tag names for a user, returning their IDs. */
export async function upsertTags(pool: sql.ConnectionPool, userId: number, tagNames: string[]): Promise<number[]> {
  const ids: number[] = [];
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(100), trimmed)
      .query(`
        MERGE Tags AS target
        USING (SELECT @userId AS UserId, @name AS Name) AS source
        ON target.UserId = source.UserId AND target.Name = source.Name
        WHEN NOT MATCHED THEN INSERT (UserId, Name) VALUES (source.UserId, source.Name);
        SELECT Id FROM Tags WHERE UserId = @userId AND Name = @name;
      `);
    if (result.recordset.length > 0) {
      ids.push(result.recordset[0].Id);
    }
  }
  return ids;
}

/** Create a new canyon record with gear, rope, and tags. */
export async function createCanyonRecord(
  pool: any,
  userId: number,
  data: {
    date: string;
    teamSize: number;
    comments?: string;
    canyonId?: number;
    userCanyonId?: number;
    waterLevel?: number;
    tripRating?: number;
    ropeIds?: number[];
    gearIds?: number[];
    tagNames?: string[];
  }
): Promise<CanyonRecord> {
  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('date', sql.Date, data.date)
    .input('teamSize', sql.Int, data.teamSize)
    .input('comments', sql.NVarChar(), data.comments || null)
    .input('canyonId', sql.Int, data.canyonId || null)
    .input('userCanyonId', sql.Int, data.userCanyonId || null)
    .input('waterLevel', sql.Int, data.waterLevel || null)
    .input('tripRating', sql.Int, data.tripRating || null)
    .query(`INSERT INTO CanyonRecords (UserId, Date, TeamSize, Comments, CanyonId, UserCanyonId, WaterLevel, TripRating)
            OUTPUT INSERTED.*
            VALUES (@userId, @date, @teamSize, @comments, @canyonId, @userCanyonId, @waterLevel, @tripRating)`);
  const record = result.recordset[0];

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  if (Array.isArray(data.ropeIds)) {
    for (const ropeId of data.ropeIds) {
      await transaction.request()
        .input('canyonRecordId', sql.Int, record.Id)
        .input('ropeItemId', sql.Int, ropeId)
        .query('INSERT INTO CanyonRecordRope (CanyonRecordId, RopeItemId) VALUES (@canyonRecordId, @ropeItemId)');
    }
  }

  if (Array.isArray(data.gearIds)) {
    for (const gearId of data.gearIds) {
      await transaction.request()
        .input('canyonRecordId', sql.Int, record.Id)
        .input('gearItemId', sql.Int, gearId)
        .query('INSERT INTO CanyonRecordGear (CanyonRecordId, GearItemId) VALUES (@canyonRecordId, @gearItemId)');
    }
  }

  if (Array.isArray(data.tagNames) && data.tagNames.length > 0) {
    const tagIds = await upsertTags(pool, userId, data.tagNames);
    for (const tagId of tagIds) {
      await transaction.request()
        .input('canyonRecordId', sql.Int, record.Id)
        .input('tagId', sql.Int, tagId)
        .query('INSERT INTO CanyonRecordTags (CanyonRecordId, TagId) VALUES (@canyonRecordId, @tagId)');
    }
  }

  await transaction.commit();
  return record;
}

/** Update an existing canyon record with gear, rope, and tags. */
export async function updateCanyonRecord(
  pool: any,
  userId: number,
  recordId: number,
  data: {
    date: string;
    teamSize: number;
    comments?: string;
    canyonId?: number;
    userCanyonId?: number;
    waterLevel?: number;
    tripRating?: number;
    ropeIds?: number[];
    gearIds?: number[];
    tagNames?: string[];
  }
): Promise<void> {
  await pool.request()
    .input('Id', sql.Int, recordId)
    .input('userId', sql.Int, userId)
    .input('date', sql.Date, data.date)
    .input('teamSize', sql.Int, data.teamSize)
    .input('comments', sql.NVarChar(), data.comments || null)
    .input('canyonId', sql.Int, data.canyonId || null)
    .input('userCanyonId', sql.Int, data.userCanyonId || null)
    .input('waterLevel', sql.Int, data.waterLevel || null)
    .input('tripRating', sql.Int, data.tripRating || null)
    .query(`UPDATE CanyonRecords SET Date=@date, TeamSize=@teamSize, Comments=@comments, CanyonId=@canyonId, UserCanyonId=@userCanyonId, WaterLevel=@waterLevel, TripRating=@tripRating WHERE Id=@Id AND UserId=@userId`);

  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  // Clear existing mappings
  await transaction.request()
    .input('Id', sql.Int, recordId)
    .query('DELETE FROM CanyonRecordRope WHERE CanyonRecordId = @Id');
  await transaction.request()
    .input('Id', sql.Int, recordId)
    .query('DELETE FROM CanyonRecordGear WHERE CanyonRecordId = @Id');
  await transaction.request()
    .input('Id', sql.Int, recordId)
    .query('DELETE FROM CanyonRecordTags WHERE CanyonRecordId = @Id');

  // Insert new mappings
  if (Array.isArray(data.ropeIds) && data.ropeIds.length > 0) {
    const baseRequest = transaction.request().input('Id', sql.Int, recordId);
    const values: string[] = [];
    for (let i = 0; i < data.ropeIds.length; i++) {
      baseRequest.input(`ropeItemId_${i}`, sql.Int, data.ropeIds[i]);
      values.push(`(@Id, @ropeItemId_${i})`);
    }
    await baseRequest.query('INSERT INTO CanyonRecordRope (CanyonRecordId, RopeItemId) VALUES ' + values.join(', '));
  }

  if (Array.isArray(data.gearIds) && data.gearIds.length > 0) {
    const baseRequest = transaction.request().input('Id', sql.Int, recordId);
    const values: string[] = [];
    for (let i = 0; i < data.gearIds.length; i++) {
      baseRequest.input(`gearItemId_${i}`, sql.Int, data.gearIds[i]);
      values.push(`(@Id, @gearItemId_${i})`);
    }
    await baseRequest.query('INSERT INTO CanyonRecordGear (CanyonRecordId, GearItemId) VALUES ' + values.join(', '));
  }

  if (Array.isArray(data.tagNames) && data.tagNames.length > 0) {
    const tagIds = await upsertTags(pool, userId, data.tagNames);
    for (const tagId of tagIds) {
      await transaction.request()
        .input('canyonRecordId', sql.Int, recordId)
        .input('tagId', sql.Int, tagId)
        .query('INSERT INTO CanyonRecordTags (CanyonRecordId, TagId) VALUES (@canyonRecordId, @tagId)');
    }
  }

  await transaction.commit();
}

/** Get all canyon records for a user with optional filters. */
export async function getCanyonRecords(
  pool: any,
  userId: number,
  options: {
    canyonId?: number;
    userCanyonId?: number;
    max?: number;
  } = {}
): Promise<any[]> {
  let query = `
    SELECT 
      cr.Id,
      cr.UserId,
      cr.Date,
      cr.TeamSize,
      cr.Comments,
      cr.CanyonId,
      cr.UserCanyonId,
      cr.WaterLevel,
      cr.TripRating,
      cr.Timestamp,
      COALESCE(c.Name, uc.Name) AS Name,
      COALESCE(c.Url, uc.Url) AS Url,
      COALESCE(c.RegionId, uc.RegionId) AS RegionId,
      COALESCE(crgn.Slug, ucrgn.Slug) AS RegionSlug,
      COALESCE(crgn.Symbol, ucrgn.Symbol) AS RegionSymbol
    FROM CanyonRecords cr
    LEFT JOIN Canyons c ON cr.CanyonId = c.Id
    LEFT JOIN UserCanyons uc ON cr.UserCanyonId = uc.Id
    LEFT JOIN Regions crgn ON c.RegionId = crgn.Id
    LEFT JOIN Regions ucrgn ON uc.RegionId = ucrgn.Id
    WHERE cr.UserId = @userId
  `;

  const request = pool.request().input('userId', sql.Int, userId);

  if (options.canyonId && !isNaN(options.canyonId)) {
    query += ' AND cr.CanyonId = @canyonId';
    request.input('canyonId', sql.Int, options.canyonId);
  }

  if (options.userCanyonId && !isNaN(options.userCanyonId)) {
    query += ' AND cr.UserCanyonId = @userCanyonId';
    request.input('userCanyonId', sql.Int, options.userCanyonId);
  }

  query += ' ORDER BY cr.Date DESC';

  if (options.max && !isNaN(options.max)) {
    query += ` OFFSET 0 ROWS FETCH NEXT ${options.max} ROWS ONLY`;
  }

  const result = await request.query(query);
  const records = result.recordset as any[];

  // Attach GearIds, RopeIds, and Tags
  if (records.length > 0) {
    const ids = records.map(r => r.Id).filter((v: any) => v !== undefined && v !== null);
    if (ids.length > 0) {
      const idList = ids.join(',');

      const ropeRows = await pool.request()
        .query(`SELECT CanyonRecordId, RopeItemId FROM CanyonRecordRope WHERE CanyonRecordId IN (${idList})`)
        .then((r: any) => r.recordset as any[]);
      const gearRows = await pool.request()
        .query(`SELECT CanyonRecordId, GearItemId FROM CanyonRecordGear WHERE CanyonRecordId IN (${idList})`)
        .then((r: any) => r.recordset as any[]);
      const tagRows = await pool.request()
        .query(`SELECT crt.CanyonRecordId, t.Id, t.Name FROM CanyonRecordTags crt JOIN Tags t ON crt.TagId = t.Id WHERE crt.CanyonRecordId IN (${idList})`)
        .then((r: any) => r.recordset as any[]);

      const ropesByRecord: Record<number, number[]> = {};
      ropeRows.forEach((r: any) => {
        ropesByRecord[r.CanyonRecordId] = ropesByRecord[r.CanyonRecordId] || [];
        ropesByRecord[r.CanyonRecordId].push(r.RopeItemId);
      });

      const gearByRecord: Record<number, number[]> = {};
      gearRows.forEach((g: any) => {
        gearByRecord[g.CanyonRecordId] = gearByRecord[g.CanyonRecordId] || [];
        gearByRecord[g.CanyonRecordId].push(g.GearItemId);
      });

      const tagsByRecord: Record<number, { Id: number; Name: string }[]> = {};
      tagRows.forEach((t: any) => {
        tagsByRecord[t.CanyonRecordId] = tagsByRecord[t.CanyonRecordId] || [];
        tagsByRecord[t.CanyonRecordId].push({ Id: t.Id, Name: t.Name });
      });

      records.forEach(rec => {
        rec.RopeIds = ropesByRecord[rec.Id] || [];
        rec.GearIds = gearByRecord[rec.Id] || [];
        rec.Tags = tagsByRecord[rec.Id] || [];
        rec.DetailUrl = canyonDetailUrl(rec.CanyonId, rec.UserCanyonId);
      });
    }
  }

  return records;
}

/** Get a specific canyon record by ID. */
export async function getCanyonRecordById(pool: any, userId: number, recordId: number): Promise<CanyonRecord | null> {
  const query = `
    SELECT TOP 1 
      cr.Id,
      cr.UserId,
      cr.Date,
      cr.TeamSize,
      cr.Comments,
      cr.CanyonId,
      cr.UserCanyonId,
      cr.WaterLevel,
      cr.TripRating,
      cr.Timestamp,
      COALESCE(c.Name, uc.Name) AS Name,
      COALESCE(c.Url, uc.Url) AS Url,
      COALESCE(c.RegionId, uc.RegionId) AS RegionId,
      COALESCE(crgn.Slug, ucrgn.Slug) AS RegionSlug,
      COALESCE(crgn.Symbol, ucrgn.Symbol) AS RegionSymbol
    FROM CanyonRecords cr
    LEFT JOIN Canyons c ON cr.CanyonId = c.Id
    LEFT JOIN UserCanyons uc ON cr.UserCanyonId = uc.Id
    LEFT JOIN Regions crgn ON c.RegionId = crgn.Id
    LEFT JOIN Regions ucrgn ON uc.RegionId = ucrgn.Id
    WHERE cr.Id = @Id AND cr.UserId = @userId
  `;

  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('Id', sql.Int, recordId)
    .query(query);

  if (result.recordset.length === 0) {
    return null;
  }

  const record = result.recordset[0] as CanyonRecord;
  record.DetailUrl = canyonDetailUrl(record.CanyonId, record.UserCanyonId);

  record.RopeIds = await pool.request()
    .input('Id', sql.Int, recordId)
    .query('SELECT RopeItemId FROM CanyonRecordRope WHERE CanyonRecordId = @Id')
    .then((r: any) => r.recordset.map((row: any) => row.RopeItemId));

  record.GearIds = await pool.request()
    .input('Id', sql.Int, recordId)
    .query('SELECT GearItemId FROM CanyonRecordGear WHERE CanyonRecordId = @Id')
    .then((r: any) => r.recordset.map((row: any) => row.GearItemId));

  (record as any).Tags = await pool.request()
    .input('Id', sql.Int, recordId)
    .query('SELECT t.Id, t.Name FROM CanyonRecordTags crt JOIN Tags t ON crt.TagId = t.Id WHERE crt.CanyonRecordId = @Id')
    .then((r: any) => r.recordset.map((row: any) => ({ Id: row.Id, Name: row.Name })));

  return record;
}

/** Get all canyon records that use a specific gear item. */
export async function getRecordsByGearId(pool: sql.ConnectionPool, userId: number, gearId: number): Promise<CanyonRecord[]> {
  const query = `
    SELECT DISTINCT
      cr.Id,
      cr.UserId,
      cr.Date,
      cr.TeamSize,
      cr.Comments,
      cr.CanyonId,
      cr.UserCanyonId,
      cr.WaterLevel,
      cr.TripRating,
      cr.Timestamp,
      COALESCE(c.Name, uc.Name) AS Name,
      COALESCE(c.Url, uc.Url) AS Url,
      COALESCE(c.RegionId, uc.RegionId) AS RegionId,
      COALESCE(crgn.Slug, ucrgn.Slug) AS RegionSlug,
      COALESCE(crgn.Symbol, ucrgn.Symbol) AS RegionSymbol
    FROM CanyonRecords cr
    INNER JOIN CanyonRecordGear crg ON cr.Id = crg.CanyonRecordId
    LEFT JOIN Canyons c ON cr.CanyonId = c.Id
    LEFT JOIN UserCanyons uc ON cr.UserCanyonId = uc.Id
    LEFT JOIN Regions crgn ON c.RegionId = crgn.Id
    LEFT JOIN Regions ucrgn ON uc.RegionId = ucrgn.Id
    WHERE cr.UserId = @userId AND crg.GearItemId = @gearId
    ORDER BY cr.Date DESC
  `;

  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('gearId', sql.Int, gearId)
    .query(query);

  const records = result.recordset as any[];

  // Attach GearIds, RopeIds, and Tags for each record
  await attachGearRopeTags(pool, records)
  return records;
}

/** Get all canyon records that use a specific rope item. */
export async function getRecordsByRopeId(pool: sql.ConnectionPool, userId: number, ropeId: number): Promise<CanyonRecord[]> {
  const query = `
    SELECT DISTINCT
      cr.Id,
      cr.UserId,
      cr.Date,
      cr.TeamSize,
      cr.Comments,
      cr.CanyonId,
      cr.UserCanyonId,
      cr.WaterLevel,
      cr.TripRating,
      cr.Timestamp,
      COALESCE(c.Name, uc.Name) AS Name,
      COALESCE(c.Url, uc.Url) AS Url,
      COALESCE(c.RegionId, uc.RegionId) AS RegionId,
      COALESCE(crgn.Slug, ucrgn.Slug) AS RegionSlug,
      COALESCE(crgn.Symbol, ucrgn.Symbol) AS RegionSymbol
    FROM CanyonRecords cr
    INNER JOIN CanyonRecordRope crr ON cr.Id = crr.CanyonRecordId
    LEFT JOIN Canyons c ON cr.CanyonId = c.Id
    LEFT JOIN UserCanyons uc ON cr.UserCanyonId = uc.Id
    LEFT JOIN Regions crgn ON c.RegionId = crgn.Id
    LEFT JOIN Regions ucrgn ON uc.RegionId = ucrgn.Id
    WHERE cr.UserId = @userId AND crr.RopeItemId = @ropeId
    ORDER BY cr.Date DESC
  `;

  const result = await pool.request()
    .input('userId', sql.Int, userId)
    .input('ropeId', sql.Int, ropeId)
    .query(query);

  const records = result.recordset as any[];

  // Attach GearIds, RopeIds, and Tags for each record
  await attachGearRopeTags(pool, records)
  return records;
}

/** Delete a canyon record and cascade delete related data. */
export async function deleteCanyonRecord(pool: sql.ConnectionPool, userId: number, recordId: number): Promise<void> {
  const existing = await pool.request()
    .input('Id', sql.Int, recordId)
    .input('userId', sql.Int, userId)
    .query('SELECT Id FROM CanyonRecords WHERE Id = @Id AND UserId = @userId');

  if (existing.recordset.length === 0) {
    throw new Error('Record not found');
  }

  await pool.request().input('Id', sql.Int, recordId).query('DELETE FROM CanyonRecordGear WHERE CanyonRecordId = @Id');
  await pool.request().input('Id', sql.Int, recordId).query('DELETE FROM CanyonRecordRope WHERE CanyonRecordId = @Id');
  await pool.request().input('Id', sql.Int, recordId).query('DELETE FROM CanyonRecordTags WHERE CanyonRecordId = @Id');
  await pool.request().input('Id', sql.Int, recordId).query('DELETE FROM CanyonRecords WHERE Id = @Id');
}

async function attachGearRopeTags(pool: sql.ConnectionPool, records: CanyonRecord[]): Promise<void> {

  if(records.length === 0) {
    return;
  }

  const ids = records.map(r => r.Id);
    const idList = ids.join(',');

    const ropeRows = await pool.request()
      .query(`SELECT CanyonRecordId, RopeItemId FROM CanyonRecordRope WHERE CanyonRecordId IN (${idList})`)
      .then((r: any) => r.recordset as any[]);
    const gearRows = await pool.request()
      .query(`SELECT CanyonRecordId, GearItemId FROM CanyonRecordGear WHERE CanyonRecordId IN (${idList})`)
      .then((r: any) => r.recordset as any[]);
    const tagRows = await pool.request()
      .query(`SELECT crt.CanyonRecordId, t.Id, t.Name FROM CanyonRecordTags crt JOIN Tags t ON crt.TagId = t.Id WHERE crt.CanyonRecordId IN (${idList})`)
      .then((r: any) => r.recordset as any[]);

    const ropesByRecord: Record<number, number[]> = {};
    ropeRows.forEach((r: any) => {
      ropesByRecord[r.CanyonRecordId] = ropesByRecord[r.CanyonRecordId] || [];
      ropesByRecord[r.CanyonRecordId].push(r.RopeItemId);
    });

    const gearByRecord: Record<number, number[]> = {};
    gearRows.forEach((g: any) => {
      gearByRecord[g.CanyonRecordId] = gearByRecord[g.CanyonRecordId] || [];
      gearByRecord[g.CanyonRecordId].push(g.GearItemId);
    });

    const tagsByRecord: Record<number, { Id: number; Name: string }[]> = {};
    tagRows.forEach((t: any) => {
      tagsByRecord[t.CanyonRecordId] = tagsByRecord[t.CanyonRecordId] || [];
      tagsByRecord[t.CanyonRecordId].push({ Id: t.Id, Name: t.Name });
    });

    records.forEach(rec => {

      if(rec.Id === undefined || rec.Id === null) {
        throw new Error('Record Id is undefined or null');
      }

      rec.RopeIds = ropesByRecord[rec.Id] || [];
      rec.GearIds = gearByRecord[rec.Id] || [];
      rec.Tags = tagsByRecord[rec.Id] || [];
      rec.DetailUrl = canyonDetailUrl(rec.CanyonId, rec.UserCanyonId);
    });
}
