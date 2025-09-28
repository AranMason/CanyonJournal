import express from 'express';
import { getPool, sql } from './middleware/sqlserver';
const router = express.Router();

// GET /api/canyons - return the list of canyons from SQL Server
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Canyons');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch canyons' });
  }
});

// POST /api/canyons - add a new canyon to SQL Server
router.post('/', async (req, res) => {
  const { name, url, aquaticRating, verticalRating, starRating, commitmentRating } = req.body;
  if (!name || aquaticRating == null || verticalRating == null || starRating == null || commitmentRating == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('name', sql.NVarChar(200), name)
      .input('url', sql.NVarChar(255), url || '')
      .input('aquaticRating', sql.Int, aquaticRating)
      .input('verticalRating', sql.Int, verticalRating)
      .input('starRating', sql.Int, starRating)
      .input('commitmentRating', sql.Int, commitmentRating)
      .query(`INSERT INTO Canyons (Name, Url, AquaticRating, VerticalRating, StarRating, CommitmentRating)
              OUTPUT INSERTED.*
              VALUES (@name, @url, @aquaticRating, @verticalRating, @starRating, @commitmentRating)`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add canyon' });
  }
});

export default router;
