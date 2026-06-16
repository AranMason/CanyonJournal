import express, { Request, Response, Router } from 'express';
import { getPool } from './middleware/sqlserver';
import { CanyonRecord } from '../src/types/CanyonRecord';
import { getUserIdByRequest } from './helpers/user.helper';
import {
  createCanyonRecord,
  updateCanyonRecord,
  getCanyonRecords,
  getCanyonRecordById,
  deleteCanyonRecord
} from './helpers/records.data';

const recordRouter: Router = express.Router();

// POST /api/record - add a canyon record to SQL Server
recordRouter.post('/', async (req: Request, res: Response) => {
  const { TeamSize, Comments, CanyonId, UserCanyonId, RopeIds, GearIds, TagNames } = req.body as CanyonRecord & { TagNames?: string[] };
  const dateTime = req.body.Date;
  if (!dateTime) {
    return res.status(400).json({ error: 'Date is required.' });
  }
  if (!CanyonId && !UserCanyonId) {
    return res.status(400).json({ error: 'A canyon must be selected (CanyonId or UserCanyonId required).' });
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
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const record = await createCanyonRecord(pool, userId, {
      date: dateTime,
      teamSize: teamSizeNum,
      comments: Comments,
      canyonId: CanyonId,
      userCanyonId: UserCanyonId,
      waterLevel: req.body.WaterLevel,
      tripRating: req.body.TripRating,
      ropeIds: RopeIds,
      gearIds: GearIds,
      tagNames: TagNames
    });
    res.status(201).json({ message: 'Canyon record added!', record });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add canyon record' });
  }
});

recordRouter.patch('/', async (req: Request, res: Response) => {
  const { Id, TeamSize, Comments, CanyonId, UserCanyonId, RopeIds, GearIds, TagNames } = req.body as CanyonRecord & { TagNames?: string[] };
  const dateTime = req.body.Date;

  if (!Id) {
    return res.status(400).json({ error: 'Record ID is required for update.' });
  }
  if (!dateTime) {
    return res.status(400).json({ error: 'Date is required.' });
  }
  if (!CanyonId && !UserCanyonId) {
    return res.status(400).json({ error: 'A canyon must be selected (CanyonId or UserCanyonId required).' });
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
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    await updateCanyonRecord(pool, userId, Id, {
      date: dateTime,
      teamSize: teamSizeNum,
      comments: Comments,
      canyonId: CanyonId,
      userCanyonId: UserCanyonId,
      waterLevel: req.body.WaterLevel,
      tripRating: req.body.TripRating,
      ropeIds: RopeIds,
      gearIds: GearIds,
      tagNames: TagNames
    });
    res.status(201).json({ message: 'Canyon record updated!', Id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add canyon record' } );
  }
});

// GET /api/record - get all canyon records for the user from SQL Server
recordRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const max = req.query.max ? Number(req.query.max) : undefined;
    const canyonId = req.query.canyon ? Number(req.query.canyon) : undefined;
    const userCanyonId = req.query.userCanyon ? Number(req.query.userCanyon) : undefined;
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const records = await getCanyonRecords(pool, userId, {
      canyonId: canyonId && !isNaN(canyonId) ? canyonId : undefined,
      userCanyonId: userCanyonId && !isNaN(userCanyonId) ? userCanyonId : undefined,
      max: max && !isNaN(max) ? max : undefined
    });

    res.json({ records });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// GET /api/record/:id - get a specific canyon record
recordRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const recordId = Number(req.params.id);

    if(!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }


    const record = await getCanyonRecordById(pool, userId, recordId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

recordRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const recordId = Number(req.params.id);
    const pool = await getPool();

    if(!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await deleteCanyonRecord(pool, userId, recordId);
    res.status(204).send();
  } catch (err: any) {
    if (err.message === 'Record not found') {
      return res.status(404).json({ error: 'Record not found' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default recordRouter;

