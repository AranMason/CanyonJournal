import express, { Request, Response, Router } from 'express';
import { requireAuth } from './middleware/authentication';
import { getPool, sql } from './middleware/sqlserver';

const recordRouter: Router = express.Router();

// POST /api/record - add a canyon record to SQL Server
recordRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { name, date, url, teamSize, comments, canyonId, ropeIds, gearIds } = req.body;
  if (!name || !date) {
    return res.status(400).json({ error: 'Name and date are required.' });
  }
  const teamSizeNum = Number(teamSize);
  if (isNaN(teamSizeNum) || teamSizeNum < 1) {
    return res.status(400).json({ error: 'Team size must be a positive number.' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.session.userId)
      .input('name', sql.NVarChar(200), name)
      .input('date', sql.Date, date)
      .input('url', sql.NVarChar(255), url)
      .input('teamSize', sql.Int, teamSizeNum)
      .input('comments', sql.NVarChar(1000), comments || null)
      .input('canyonId', sql.Int, canyonId || null)
      .query(`INSERT INTO CanyonRecords (UserId, Name, Date, Url, TeamSize, Comments, CanyonId)
              OUTPUT INSERTED.*
              VALUES (@userId, @name, @date, @url, @teamSize, @comments, @canyonId)`);
    const record = result.recordset[0];
    // Insert mapping tables if ropeIds/gearIds provided
    if (Array.isArray(ropeIds)) {
      for (const ropeId of ropeIds) {
        await pool.request()
          .input('canyonRecordId', sql.Int, record.Id)
          .input('ropeItemId', sql.Int, ropeId)
          .query('INSERT INTO CanyonRecordRope (CanyonRecordId, RopeItemId) VALUES (@canyonRecordId, @ropeItemId)');
      }
    }
    if (Array.isArray(gearIds)) {
      for (const gearId of gearIds) {
        await pool.request()
          .input('canyonRecordId', sql.Int, record.Id)
          .input('gearItemId', sql.Int, gearId)
          .query('INSERT INTO CanyonRecordGear (CanyonRecordId, GearItemId) VALUES (@canyonRecordId, @gearItemId)');
      }
    }
    res.status(201).json({ message: 'Canyon record added!', record });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add canyon record' });
  }
});

// GET /api/record - get all canyon records for the user from SQL Server
recordRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, req.session.userId)
      .query('SELECT * FROM CanyonRecords WHERE UserId = @userId ORDER BY Timestamp DESC');
    res.json({ records: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

export default recordRouter;
