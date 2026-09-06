import express from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest, isAdmin } from './helpers/user.helper';
import { } from '../src/types/express-session';
import { canyonKey } from '../src/utils/canyonKey';
import {
  getBaseCanyonDataWithoutDescents,
  getAdminCanyonList,
  getBaseCanyonDataWithDescents,
  getUserCanyonDataWithDescents,
  getSpecificCanyon,
  getSpecificCanyonWithDescents,
  getCanyonRecordCount,
  deleteCanyonWithCascade,
  getAllCanyonsWithFilters
} from './helpers/canyons.data';
import { CanyonFilterOptions, CanyonListEntry } from '../src/types/Canyon';
import { CanyonData } from './types/Canyon.type';
import { canyonDetailUrl } from './helpers/urlHelper';

const router = express.Router();

function mapUserCanyonTableToType(c: CanyonData): CanyonListEntry {
  return {
    ...c,
    DetailUrl: canyonDetailUrl(null, c.Id),
    Key: canyonKey(c.Id),
  };
}

function mapCanyonTableToType(c: CanyonData): CanyonListEntry {
  return {
    ...c,
    DetailUrl: canyonDetailUrl(c.Id, null),
    Key: canyonKey(c.Id),
  }
}

// GET /api/canyons - return the list of canyons from SQL Server
router.get('/', async (req, res) => {
  try {
    // If withDescents=1, join with CanyonRecords for user-specific count
    const userId = await getUserIdByRequest(req);
    if (req.query.withDescents === '1' && userId) {
      const pool = await getPool();
      const [verifiedResult, userCanyonsResult] = await Promise.all([
        getBaseCanyonDataWithDescents(pool, userId),
        getUserCanyonDataWithDescents(pool, userId)
      ]);

      const userCanyons = userCanyonsResult.map(mapUserCanyonTableToType);

      const officialCanyons = verifiedResult.map(mapCanyonTableToType);

      res.json([...officialCanyons, ...userCanyons]);
    } else {
      const pool = await getPool();
      const result = await getBaseCanyonDataWithoutDescents(pool);
      res.json(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch canyons' });
  }
});

// GET /api/canyons - return the list of canyons from SQL Server
router.get('/search', async (req, res) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = req.body as CanyonFilterOptions;
    const pool = await getPool();

    const queryResults = getAllCanyonsWithFilters(pool, userId, query);

    res.json(queryResults);

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
    const result = await getAdminCanyonList(pool);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch canyons' });
  }
});

// GET /api/canyons/:id/record-count - count of ALL CanyonRecords linked to this canyon (admin only)
router.get('/:id/record-count', async (req, res) => {
  if (await isAdmin(req) === false) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const pool = await getPool();
    const count = await getCanyonRecordCount(pool, parseInt(req.params.id, 10));
    res.json({ count });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to count records' });
  }
});

// DELETE /api/canyons/:id - delete a canyon and all linked journal entries (admin only)
router.delete('/:id', async (req, res) => {
  if (await isAdmin(req) === false) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const pool = await getPool();
    const canyonId = parseInt(req.params.id, 10);
    await deleteCanyonWithCascade(pool, canyonId);
    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to delete canyon' });
  }
});

// GET /api/canyons/:id - return the specific canyons from SQL Server
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();
    // If withDescents=1, join with CanyonRecords for user-specific count
    const userId = await getUserIdByRequest(req);


    const canyonId = parseInt(req.params.id, 10);

    if (req.query.withDescents === '1' && userId) {
      const result = await getSpecificCanyonWithDescents(pool, canyonId, userId);
      res.json(result);
    } else {
      const result = await getSpecificCanyon(pool, canyonId);
      res.json(result);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch canyons' });
  }
});

// POST /api/canyons - add a new canyon to SQL Server
router.post('/', async (req, res) => {
  const { name, url, aquaticRating, verticalRating, starRating, commitmentRating, isUnrated, canyonRegionId, canyonType, sourceId } = req.body;
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
      .input('isUnrated', sql.Bit, isUnrated || false)
      .input('canyonRegionId', sql.Int, canyonRegionId ?? null)
      .input('canyonType', sql.Int, canyonType)
      .input('sourceId', sql.Int, sourceId || null)
      .input('lastUpdated', sql.DateTime, new Date().toUTCString());

    if (await isAdmin(req) && req.body.id > 0) {
      request.input('id', sql.Int, req.body.id);
      await request.query(`UPDATE Canyons SET 
              Name = @name,
              Url = @url,
              AquaticRating = @aquaticRating,
              VerticalRating = @verticalRating,
              StarRating = @starRating,
              CommitmentRating = @commitmentRating,
              IsVerified = 1,
              IsUnrated = @isUnrated,
              RegionId = @canyonRegionId,
              CanyonType = @canyonType,
              SourceId = @sourceId,
              LastUpdated = @lastUpdated
              WHERE Id = @id`);
      return res.status(201).json(req.body);
    }

    else {
      const isAdminUser = await isAdmin(req);
      request.input('isVerified', sql.Bit, isAdminUser ? 1 : 0);
      var result = await request.query(`INSERT INTO Canyons (Name, Url, AquaticRating, VerticalRating, StarRating, CommitmentRating, IsUnrated, RegionId, CanyonType, IsVerified, IsDeleted, SourceId)
              OUTPUT INSERTED.*
              VALUES (@name, @url, @aquaticRating, @verticalRating, @starRating, @commitmentRating, @isUnrated, @canyonRegionId, @canyonType, @isVerified, 0, @sourceId)`);
      return res.status(201).json(result.recordset[0]);
    }


  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add canyon' });
  }
});

export default router;
