import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { CanyonRecord } from '../src/types/CanyonRecord';
import { getUserIdByRequest } from './helpers/user.helper';

const recordRouter: Router = express.Router();

// POST /api/record - add a canyon record to SQL Server
recordRouter.post('/', async (req: Request, res: Response) => {
  const { Name,  Url, TeamSize, Comments, CanyonId, RopeIds, GearIds } = req.body as CanyonRecord;
  const dateTime = req.body.Date;
  if (!Name || !dateTime) {
    return res.status(400).json({ error: 'Name and date are required.' });
  }
  if(Date.parse(dateTime) > Date.now()) {
    return res.status(400).json({ error: 'Date cannot be in the future.' });
  }
  const teamSizeNum = Number(TeamSize);
  if (isNaN(teamSizeNum) || teamSizeNum < 1) {
    return res.status(400).json({ error: 'Team size must be a positive number.' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, await getUserIdByRequest(req))
      .input('name', sql.NVarChar(200), Name)
      .input('date', sql.Date, dateTime)
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

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    if (Array.isArray(RopeIds)) {
      for (const ropeId of RopeIds) {
        await transaction.request()
          .input('canyonRecordId', sql.Int, record.Id)
          .input('ropeItemId', sql.Int, ropeId)
          .query('INSERT INTO CanyonRecordRope (CanyonRecordId, RopeItemId) VALUES (@canyonRecordId, @ropeItemId)');
      }
    }
    if (Array.isArray(GearIds)) {
      for (const gearId of GearIds) {
        await transaction.request()
          .input('canyonRecordId', sql.Int, record.Id)
          .input('gearItemId', sql.Int, gearId)
          .query('INSERT INTO CanyonRecordGear (CanyonRecordId, GearItemId) VALUES (@canyonRecordId, @gearItemId)');
      }
    }

    transaction.commit();
    res.status(201).json({ message: 'Canyon record added!', record });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add canyon record' });
  }
});

recordRouter.patch('/', async (req: Request, res: Response) => {
  const { Id, Name, Url, TeamSize, Comments, CanyonId, RopeIds, GearIds } = req.body as CanyonRecord;
  const dateTime = req.body.Date;

  if (!Id) {
    return res.status(400).json({ error: 'Record ID is required for update.' });
  }
  if (!Name || !dateTime) {
    return res.status(400).json({ error: 'Name and date are required.' });
  }
  if(Date.parse(dateTime) > Date.now()) {
    return res.status(400).json({ error: 'Date cannot be in the future.' });
  }
  const teamSizeNum = Number(TeamSize);
  if (isNaN(teamSizeNum) || teamSizeNum < 1) {
    return res.status(400).json({ error: 'Team size must be a positive number.' });
  }
  try {
    const pool = await getPool();
    await pool.request()
      .input('Id', sql.Int, Id)
      .input('userId', sql.Int, await getUserIdByRequest(req))
      .input('name', sql.NVarChar(200), Name)
      .input('date', sql.Date, dateTime)
      .input('url', sql.NVarChar(255), Url)
      .input('teamSize', sql.Int, teamSizeNum)
      .input('comments', sql.NVarChar(1000), Comments || null)
      .input('canyonId', sql.Int, CanyonId || null)
      .input('waterLevel', sql.Int, req.body.WaterLevel || null)
      .query(`UPDATE CanyonRecords SET Name=@name, Date=@date, Url=@url, TeamSize=@teamSize, Comments=@comments, CanyonId=@canyonId, WaterLevel=@waterLevel WHERE Id=@Id AND UserId=@userId`);


    // UPDATE GEAR/ROPE IDS
    const transaction = new sql.Transaction(pool);
    await transaction.begin();


    // We need to clear existing mappings first, as we might've removed some as part of the edit
    await transaction.request()
      .input('Id', sql.Int, Id)
      .query('DELETE FROM CanyonRecordRope WHERE CanyonRecordId = @Id');
    await transaction.request()
      .input('Id', sql.Int, Id)
      .query('DELETE FROM CanyonRecordGear WHERE CanyonRecordId = @Id');

    // Insert mapping tables if ropeIds/gearIds provided
    if (Array.isArray(RopeIds) && RopeIds.length > 0) {
      var baseRequest = transaction.request()
        .input('Id', sql.Int, Id);
      let baseQuery = 'INSERT INTO CanyonRecordRope (CanyonRecordId, RopeItemId) VALUES ';
      let values: string[] = []
      for (let index = 0; index < RopeIds.length; index++) {

          baseRequest.input(`ropeItemId_${index}`, sql.Int, RopeIds[index]);
          values.push(`(@Id, @ropeItemId_${index})`);
      }

      await baseRequest.query(baseQuery + values.join(', '));
    }
    if (Array.isArray(GearIds) && GearIds.length > 0) {
      var baseRequest = transaction.request()
        .input('Id', sql.Int, Id);
      let baseQuery = 'INSERT INTO CanyonRecordGear (CanyonRecordId, GearItemId) VALUES ';
      let values: string[] = []
      for (let index = 0; index < GearIds.length; index++) {
          baseRequest.input(`gearItemId_${index}`, sql.Int, GearIds[index]);
          values.push(`(@Id, @gearItemId_${index})`);
      } 
      await baseRequest.query(baseQuery + values.join(', '));
    }

    await transaction.commit();
    res.status(201).json({ message: 'Canyon record updated!', Id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add canyon record' });
  }
});

// GET /api/record - get all canyon records for the user from SQL Server
recordRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const max = req.query.max ? Number(req.query.max) : undefined;
    const canyonId = req.query.canyon ? Number(req.query.canyon) : undefined;
    const request = await pool.request()
      .input('userId', sql.Int, await getUserIdByRequest(req))
    let query = `SELECT * FROM CanyonRecords WHERE UserId = @userId`;

    if(canyonId && !isNaN(canyonId)) {
      query += ' AND CanyonId=@CanyonId';
      request.input('canyonId', canyonId);
    }

    query += ' ORDER BY Date DESC'

    if (max && !isNaN(max)) {
      query += ` OFFSET 0 ROWS FETCH NEXT ${max} ROWS ONLY`;
    }

    const result = await request.query(query);
    res.json({ records: result.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// GET /api/record - get all canyon records for the user from SQL Server
recordRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const query = 'SELECT TOP 1 * FROM CanyonRecords WHERE Id = @Id AND UserId = @userId';
    const userId = await getUserIdByRequest(req);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('Id', sql.Int, Number(req.params.id))
      .query(query);

    if(result.recordset.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    var resultRecord = result.recordset[0] as CanyonRecord;

    resultRecord.RopeIds = await pool.request()
      .input('Id', sql.Int, Number(req.params.id))
      .query('SELECT RopeItemId FROM CanyonRecordRope WHERE CanyonRecordId = @Id')
      .then(r => r.recordset.map((row: any) => row.RopeItemId));
    resultRecord.GearIds = await pool.request()
      .input('Id', sql.Int, Number(req.params.id))
      .query('SELECT GearItemId FROM CanyonRecordGear WHERE CanyonRecordId = @Id')
      .then(r => r.recordset.map((row: any) => row.GearItemId));;

    res.json(resultRecord);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

export default recordRouter;

