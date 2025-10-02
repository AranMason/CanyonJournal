import { Router, Response, Request } from 'express';
import { requiresAuth } from 'express-openid-connect';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/sql.helper';

const router = Router();

// Get all gear and ropes for the user
router.get('/', requiresAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const gearRes = await pool.request().input('userId', sql.Int, userId).query('SELECT * FROM GearItems WHERE UserId = @userId');
    const ropeRes = await pool.request().input('userId', sql.Int, userId).query('SELECT * FROM RopeItems WHERE UserId = @userId');
    res.json({ gear: gearRes.recordset, ropes: ropeRes.recordset });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gear/ropes' });
  }
});

// Add gear
router.post('/gear', requiresAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const { name, category, notes } = req.body;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('category', sql.NVarChar(100), category)
      .input('notes', sql.NVarChar(500), notes || null)
      .query(`INSERT INTO GearItems (UserId, Name, Category, Notes, Created, Updated)
              OUTPUT INSERTED.*
              VALUES (@userId, @name, @category, @notes, GETDATE(), GETDATE())`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gear' });
  }
});

// Edit gear
router.put('/gear/:id', requiresAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    const { name, category, notes } = req.body;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('category', sql.NVarChar(100), category)
      .input('notes', sql.NVarChar(500), notes || null)
      .query(`UPDATE GearItems SET Name=@name, Category=@category, Notes=@notes, Updated=GETDATE()
              OUTPUT INSERTED.*
              WHERE Id=@id AND UserId=@userId`);
    if (!result.recordset[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update gear' });
  }
});

// Delete gear
router.delete('/gear/:id', requiresAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    await pool.request().input('id', sql.Int, id).input('userId', sql.Int, userId).query('DELETE FROM GearItems WHERE Id=@id AND UserId=@userId');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gear' });
  }
});

// Add rope
router.post('/rope', requiresAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const { name, diameter, length, unit, notes } = req.body;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('diameter', sql.Float, Number(diameter))
      .input('length', sql.Float, Number(length))
      .input('unit', sql.NVarChar(20), unit)
      .input('notes', sql.NVarChar(500), notes || null)
      .query(`INSERT INTO RopeItems (UserId, Name, Diameter, Length, Unit, Notes, Created, Updated)
              OUTPUT INSERTED.*
              VALUES (@userId, @name, @diameter, @length, @unit, @notes, GETDATE(), GETDATE())`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add rope' });
  }
});

// Edit rope
router.put('/rope/:id', requiresAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    const { name, diameter, length, unit, notes } = req.body;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), name)
      .input('diameter', sql.Float, Number(diameter))
      .input('length', sql.Float, Number(length))
      .input('unit', sql.NVarChar(20), unit)
      .input('notes', sql.NVarChar(500), notes || null)
      .query(`UPDATE RopeItems SET Name=@name, Diameter=@diameter, Length=@length, Unit=@unit, Notes=@notes, Updated=GETDATE()
              OUTPUT INSERTED.*
              WHERE Id=@id AND UserId=@userId`);
    if (!result.recordset[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update rope' });
  }
});

// Delete rope
router.delete('/rope/:id', requiresAuth, async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const id = Number(req.params.id);
    await pool.request().input('id', sql.Int, id).input('userId', sql.Int, userId).query('DELETE FROM RopeItems WHERE Id=@id AND UserId=@userId');
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete rope' });
  }
});

export default router;
