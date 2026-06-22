import { Router, Response, Request } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';
import gear from './equipment.gear';
import ropes from './equipment.ropes';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    console.log("userId in /api/equipment:", userId);
    const gearRes = await pool.request().input('userId', sql.Int, userId).query('SELECT *, (SELECT MAX(ServiceDate) FROM GearServiceRecords gsr WHERE gsr.GearItemId = GearItems.Id AND gsr.ServiceType = 1) AS LastServicedDate, (SELECT MAX(ServiceDate) FROM GearServiceRecords gsr WHERE gsr.GearItemId = GearItems.Id AND gsr.ServiceType = 2) AS LastInspectionDate FROM GearItems WHERE GearItems.UserId = @userId');
    const ropeRes = await pool.request().input('userId', sql.Int, userId).query('SELECT * FROM RopeItems WHERE UserId = @userId');
    res.json({ gear: gearRes.recordset, ropes: ropeRes.recordset });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch gear/ropes' });
  }
});

router.use('/gear', gear);
router.use('/rope', ropes);

export default router;