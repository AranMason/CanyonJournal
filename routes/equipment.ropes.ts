import { Router, Response, Request } from "express";
import { getPool, sql } from "./middleware/sqlserver";
import { getUserIdByRequest } from "./helpers/user.helper";
import { toNullableDate, toNullableString } from "./helpers/sql.helper";
import { getRecordsByRopeId } from "./helpers/records.data";
import { createRopeItem, deleteRopeItem, updateRopeItem } from "./helpers/rope.data";

const router = Router();

// Add rope
router.post('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);

    if(!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    var ropeItem = await createRopeItem(pool, userId, req.body);

    res.status(201).json(ropeItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add rope' });
  }
});

// Edit rope
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);

    if(!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    var ropeItem = await updateRopeItem(pool, userId, Number(req.params.id), req.body);
   
    if (!ropeItem) return res.status(404).json({ error: 'Not found' });
    res.json(ropeItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update rope' });
  }
});

// Delete rope
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);

    if(!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await deleteRopeItem(pool, userId, id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rope' });
  }
});

/// =========================================================================
/// Trip history endpoints
/// =========================================================================

// GET /api/equipment/rope/:ropeId/descents - get all canyon records using this rope
router.get('/:ropeId/descents', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const ropeId = Number(req.params.ropeId);
    const records = await getRecordsByRopeId(pool, userId, ropeId);
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch descents' });
  }
});

/// =========================================================================
/// Service history endpoints
/// =========================================================================

router.get('/:id/service', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const ropeId = Number(req.params.id);

    const historyRes = await pool.request()
      .input('userId', sql.Int, userId)
      .input('ropeId', sql.Int, ropeId)
      .query('SELECT * FROM RopeServiceRecords WHERE RopeItemId = @ropeId AND UserId = @userId ORDER BY ServiceDate DESC');
    res.json(historyRes.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rope service history' });
  }
});

router.post('/:id/service', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const ropeId = Number(req.params.id);
    const { serviceType, serviceDate, notes } = req.body;

    await pool.request()
      .input('ropeId', sql.Int, ropeId)
      .input('userId', sql.Int, userId)
      .input('serviceType', sql.Int, serviceType)
      .input('serviceDate', sql.Date, toNullableDate(serviceDate))
      .input('notes', sql.NVarChar(500), toNullableString(notes))
      .query(`INSERT INTO RopeServiceRecords (
                RopeItemId,
                UserId,
                ServiceType,
                ServiceDate,
                Notes
              ) VALUES (
                @ropeId,
                @userId,
                @serviceType,
                @serviceDate,
                @notes
              )`);
    res.status(201).json({ message: 'Service record added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add service record' });
  }
});

export default router;