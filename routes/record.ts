import express, { Request, Response, Router } from 'express';
import { requireAuth } from './middleware/authentication';
import { getPool, sql } from './middleware/sqlserver';
import { CanyonRecord } from '../src/types/CanyonRecord';

const recordRouter: Router = express.Router();

// POST /api/record - add a canyon record to SQL Server
recordRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { Name, Date, Url, TeamSize, Comments, CanyonId, RopeIds, GearIds } = req.body as CanyonRecord;
  if (!Name || !Date) {
    return res.status(400).json({ error: 'Name and date are required.' });
  }
  const teamSizeNum = Number(TeamSize);
  if (isNaN(teamSizeNum) || teamSizeNum < 1) {
    return res.status(400).json({ error: 'Team size must be a positive number.' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.session.dbUser?.Id)
      .input('name', sql.NVarChar(200), Name)
      .input('date', sql.Date, Date)
      .input('url', sql.NVarChar(255), Url)
      .input('teamSize', sql.Int, teamSizeNum)
      .input('comments', sql.NVarChar(1000), Comments || null)
      .input('canyonId', sql.Int, CanyonId || null)
      .input('waterLevel', sql.Int, req.body.WaterLevel || null)
      .query(`INSERT INTO CanyonRecords (UserId, Name, Date, Url, TeamSize, Comments, CanyonId, WaterLevel)
              OUTPUT INSERTED.*
              VALUES (@userId, @name, @date, @url, @teamSize, @comments, @canyonId, @waterLevel)`);
    const record = result.recordset[0];
    // Insert mapping tables if ropeIds/gearIds provided
    if (Array.isArray(RopeIds)) {
      for (const ropeId of RopeIds) {
        await pool.request()
          .input('canyonRecordId', sql.Int, record.Id)
          .input('ropeItemId', sql.Int, ropeId)
          .query('INSERT INTO CanyonRecordRope (CanyonRecordId, RopeItemId) VALUES (@canyonRecordId, @ropeItemId)');
      }
    }
    if (Array.isArray(GearIds)) {
      for (const gearId of GearIds) {
        await pool.request()
          .input('canyonRecordId', sql.Int, record.Id)
          .input('gearItemId', sql.Int, gearId)
          .query('INSERT INTO CanyonRecordGear (CanyonRecordId, GearItemId) VALUES (@canyonRecordId, @gearItemId)');
      }
    }
    res.status(201).json({ message: 'Canyon record added!', record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add canyon record' });
  }
});

// GET /api/record - get all canyon records for the user from SQL Server
recordRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const max = req.query.max ? Number(req.query.max) : undefined;
    let query = 'SELECT * FROM CanyonRecords WHERE UserId = @userId ORDER BY Timestamp DESC';
    if (max && !isNaN(max)) {
      query += ` OFFSET 0 ROWS FETCH NEXT ${max} ROWS ONLY`;
    }
    const result = await pool.request()
      .input('userId', sql.Int, req.session.dbUser?.Id)
      .query(query);
    res.json({ records: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

export default recordRouter;
