import express from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest, isAdmin } from './helpers/user.helper';
import { } from '../src/types/express-session';
import { canyonKey, userCanyonKey } from '../src/utils/canyonKey';
import { canyonDetailUrl } from './helpers/urlHelper';

const router = express.Router();

// GET /api/canyons - return the list of canyons from SQL Server
router.get('/', async (req, res) => {
  try {
    // If withDescents=1, join with CanyonRecords for user-specific count
    const userId = await getUserIdByRequest(req);
    if (req.query.withDescents === '1' && userId) {
      const pool = await getPool();
      const [verifiedResult, userCanyonsResult] = await Promise.all([
        pool.request()
          .input('userId', sql.Int, userId)
          .query(`
            SELECT c.*, 
              cs.DisplayName AS SourceName,
              cs.LogoUrl AS SourceLogoUrl,
              cs.WebsiteUrl AS SourceWebsiteUrl,
              COUNT(cr.Id) AS Descents,
              MAX(cr.Date) AS LastDescentDate,
              CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsFavourite
            FROM Canyons c
            LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
            LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
            LEFT JOIN CanyonFavourites cf ON cf.CanyonId = c.Id AND cf.UserId = @userId
            WHERE c.IsVerified = 1
            GROUP BY c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating, c.CommitmentRating, c.IsVerified, c.IsUnrated, c.Region, c.CanyonType, c.IsDeleted, c.SourceId, cf.Id, cs.DisplayName, cs.LogoUrl, cs.WebsiteUrl
            ORDER BY Descents DESC, c.Name
          `),
        pool.request()
          .input('userId', sql.Int, userId)
          .query(`
            SELECT uc.Id, uc.Name, uc.Url, uc.Region, uc.CanyonType,
                   uc.AquaticRating, uc.VerticalRating, uc.CommitmentRating,
                   uc.StarRating, uc.IsUnrated,
                   COUNT(cr.Id) AS Descents,
                   MAX(cr.Date) AS LastDescentDate,
                   CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsFavourite
            FROM UserCanyons uc
            LEFT JOIN CanyonRecords cr ON cr.UserCanyonId = uc.Id
            LEFT JOIN CanyonFavourites cf ON cf.UserCanyonId = uc.Id AND cf.UserId = @userId
            WHERE uc.UserId = @userId
            GROUP BY uc.Id, uc.Name, uc.Url, uc.Region, uc.CanyonType,
                     uc.AquaticRating, uc.VerticalRating, uc.CommitmentRating,
                     uc.StarRating, uc.IsUnrated, cf.Id
            ORDER BY Descents DESC, uc.Name
          `)
      ]);

      const userCanyons = userCanyonsResult.recordset.map((uc: any) => ({
        Key: userCanyonKey(uc.Id),
        DetailUrl: canyonDetailUrl(null, uc.Id),
        Name: uc.Name,
        Url: uc.Url || '',
        AquaticRating: uc.AquaticRating,
        VerticalRating: uc.VerticalRating,
        CommitmentRating: uc.CommitmentRating,
        StarRating: uc.StarRating,
        IsVerified: false,
        IsUnrated: uc.IsUnrated,
        Region: uc.Region,
        CanyonType: uc.CanyonType ?? null,
        Descents: uc.Descents,
        LastDescentDate: uc.LastDescentDate,
        IsFavourite: uc.IsFavourite ?? false,
      }));

      const officialCanyons = verifiedResult.recordset.map((c: any) => ({
        Key: canyonKey(c.Id),
        DetailUrl: canyonDetailUrl(c.Id),
        Name: c.Name,
        Url: c.Url || '',
        AquaticRating: c.AquaticRating,
        VerticalRating: c.VerticalRating,
        CommitmentRating: c.CommitmentRating,
        StarRating: c.StarRating,
        IsVerified: c.IsVerified,
        IsUnrated: c.IsUnrated,
        Region: c.Region,
        CanyonType: c.CanyonType,
        Descents: c.Descents,
        LastDescentDate: c.LastDescentDate,
        IsFavourite: c.IsFavourite ?? false,
        SourceId: c.SourceId ?? null,
        SourceName: c.SourceName ?? null,
        SourceLogoUrl: c.SourceLogoUrl ?? null,
        SourceWebsiteUrl: c.SourceWebsiteUrl ?? null,
      }));

      res.json([...officialCanyons, ...userCanyons]);
    } else {
      const pool = await getPool();
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
        `);
    res.json(result.recordset);

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
    const result = await pool.request()
      .input('canyonId', sql.Int, parseInt(req.params.id, 10))
      .query('SELECT COUNT(*) AS Count FROM CanyonRecords WHERE CanyonId = @canyonId');
    res.json({ count: result.recordset[0].Count });
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

    // Cascade: remove gear/rope junction rows, then records, then canyon
    await pool.request()
      .input('canyonId', sql.Int, canyonId)
      .query(`
        DELETE crg FROM CanyonRecordGear crg
        JOIN CanyonRecords cr ON crg.CanyonRecordId = cr.Id
        WHERE cr.CanyonId = @canyonId;

        DELETE crr FROM CanyonRecordRope crr
        JOIN CanyonRecords cr ON crr.CanyonRecordId = cr.Id
        WHERE cr.CanyonId = @canyonId;

        DELETE FROM CanyonRecords WHERE CanyonId = @canyonId;

        DELETE FROM Canyons WHERE Id = @canyonId;
      `);

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
    if (req.query.withDescents === '1' && userId) {
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('canyonId', req.params.id)
        .query(`
          SELECT c.*, 
            cs.DisplayName AS SourceName,
            cs.LogoUrl AS SourceLogoUrl,
            cs.WebsiteUrl AS SourceWebsiteUrl,
            COUNT(cr.Id) AS Descents,
            MAX(cr.Date) AS LastDescentDate
          FROM Canyons c
          LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
          LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
          WHERE c.Id = @canyonId
          GROUP BY c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating, c.CommitmentRating, c.IsVerified, c.IsUnrated, c.Region, c.CanyonType, c.SourceId, cs.DisplayName, cs.LogoUrl, cs.WebsiteUrl
          ORDER BY Descents DESC, c.Name
        `);
      res.json(result.recordset[0]);
    } else {
      const result = await pool.request()
        .input('canyonId', req.params.id)
        .query(`
          SELECT c.*,
            cs.DisplayName AS SourceName,
            cs.LogoUrl AS SourceLogoUrl,
            cs.WebsiteUrl AS SourceWebsiteUrl
          FROM Canyons c
          LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
          WHERE c.Id = @canyonId
        `);
      res.json(result.recordset[0]);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch canyons' });
  }
});

// POST /api/canyons - add a new canyon to SQL Server
router.post('/', async (req, res) => {
  const { name, url, aquaticRating, verticalRating, starRating, commitmentRating, isUnrated, canyonRegion, canyonType, sourceId } = req.body;
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
      .input('canyonRegion', sql.Int, canyonRegion)
      .input('canyonType', sql.Int, canyonType)
      .input('sourceId', sql.Int, sourceId || null)

    if (await isAdmin(req) && req.body.id > 0) {
      request.input('id', sql.Int, req.body.id);
      const result = await request.query(`UPDATE Canyons SET 
              Name = @name,
              Url = @url,
              AquaticRating = @aquaticRating,
              VerticalRating = @verticalRating,
              StarRating = @starRating,
              CommitmentRating = @commitmentRating,
              IsVerified = 1,
              IsUnrated = @isUnrated,
              Region = @CanyonRegion,
              CanyonType = @canyonType,
              SourceId = @sourceId
              WHERE Id = @id`);
      return res.status(201).json(req.body);
    }

    else {
      const isAdminUser = await isAdmin(req);
      request.input('isVerified', sql.Bit, isAdminUser ? 1 : 0);
      var result = await request.query(`INSERT INTO Canyons (Name, Url, AquaticRating, VerticalRating, StarRating, CommitmentRating, IsUnrated, Region, CanyonType, IsVerified, IsDeleted, SourceId)
              OUTPUT INSERTED.*
              VALUES (@name, @url, @aquaticRating, @verticalRating, @starRating, @commitmentRating, @isUnrated, @canyonRegion, @canyonType, @isVerified, 0, @sourceId)`);
      return res.status(201).json(result.recordset[0]);
    }


  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to add canyon' });
  }
});

export default router;
