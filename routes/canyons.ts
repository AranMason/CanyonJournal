import express from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest, isAdmin } from './helpers/user.helper';
import { } from '../src/types/express-session';

const router = express.Router();

// GET /api/canyons - return the list of canyons from SQL Server
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    // If withDescents=1, join with CanyonRecords for user-specific count
    const userId = await getUserIdByRequest(req);
    if (req.query.withDescents === '1' && userId) {
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT c.*, 
            COUNT(cr.Id) AS Descents,
            MAX(cr.Date) AS LastDescentDate
          FROM Canyons c
          LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
          WHERE c.IsVerified = 1
          GROUP BY c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating, c.CommitmentRating, c.IsVerified
          ORDER BY Descents DESC, c.Name
        `);
      res.json(result.recordset);
    } else {
      const result = await pool.request().query('SELECT * FROM Canyons WHERE IsVerified = 1 ORDER BY Name');
      res.json(result.recordset);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch canyons' });
  }
});

router.get('/verify', async (req, res) => {

  // NOTE: This has to go before the :id route
  if (await isAdmin(req) === false) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .query(`
          SELECT c.*
          FROM Canyons c
          WHERE c.IsVerified = 0
        `);
    res.json(result.recordset);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch canyons' });
  }
});

// GET /api/canyons/:id - return the specific canyons from SQL Server
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    // If withDescents=1, join with CanyonRecords for user-specific count
    const userId = await getUserIdByRequest(req);
    if (req.query.withDescents === '1' && userId) {
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('canyonId', req.params.id)
        .query(`
          SELECT c.*, 
            COUNT(cr.Id) AS Descents,
            MAX(cr.Date) AS LastDescentDate
          FROM Canyons c
          LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
          WHERE c.Id = @canyonId
          GROUP BY c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating, c.CommitmentRating, c.IsVerified
          ORDER BY Descents DESC, c.Name
        `);
      res.json(result.recordset[0]);
    } else {
      const result = await pool.request().input('canyonId', req.params.id).query('SELECT * FROM Canyons WHERE Id = @canyonId');
      res.json(result.recordset[0]);
    }
  } catch (err) {
    console.log(err);
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
    const request = await pool.request()
      .input('name', sql.NVarChar(200), name)
      .input('url', sql.NVarChar(255), url || '')
      .input('aquaticRating', sql.Int, aquaticRating)
      .input('verticalRating', sql.Int, verticalRating)
      .input('starRating', sql.Int, starRating)
      .input('commitmentRating', sql.Int, commitmentRating)

    if (await isAdmin(req) && req.body.id > 0) {
      request.input('id', sql.Int, req.body.id);
      const result = await request.query(`UPDATE Canyons SET 
              Name = @name,
              Url = @url,
              AquaticRating = @aquaticRating,
              VerticalRating = @verticalRating,
              StarRating = @starRating,
              CommitmentRating = @commitmentRating,
              IsVerified = 1
              WHERE Id = @id`);
      return res.status(201).json(req.body);
    }

    else {

      var result = await request.query(`INSERT INTO Canyons (Name, Url, AquaticRating, VerticalRating, StarRating, CommitmentRating)
              OUTPUT INSERTED.*
              VALUES (@name, @url, @aquaticRating, @verticalRating, @starRating, @commitmentRating)`);
      return res.status(201).json(result.recordset[0]);
    }


  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add canyon' });
  }
});

export default router;
