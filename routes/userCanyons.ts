import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';

const userCanyonsRouter: Router = express.Router();

// GET /api/user-canyons - list all custom canyons for the authenticated user
userCanyonsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT uc.*,
          COUNT(cr.Id) AS Descents,
          MAX(cr.Date) AS LastDescentDate
        FROM UserCanyons uc
        LEFT JOIN CanyonRecords cr ON cr.UserCanyonId = uc.Id
        WHERE uc.UserId = @userId
        GROUP BY uc.Id, uc.UserId, uc.Name, uc.Url, uc.Region, uc.CanyonType,
                 uc.AquaticRating, uc.VerticalRating, uc.CommitmentRating,
                 uc.StarRating, uc.IsUnrated, uc.Notes, uc.Created, uc.Updated
        ORDER BY uc.Name
      `);
    res.json(result.recordset);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch custom canyons' });
  }
});

// GET /api/user-canyons/:id - get a single custom canyon (must belong to user)
userCanyonsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('id', sql.Int, parseInt(req.params.id, 10))
      .query(`
        SELECT uc.*,
          COUNT(cr.Id) AS Descents,
          MAX(cr.Date) AS LastDescentDate
        FROM UserCanyons uc
        LEFT JOIN CanyonRecords cr ON cr.UserCanyonId = uc.Id
        WHERE uc.Id = @id AND uc.UserId = @userId
        GROUP BY uc.Id, uc.UserId, uc.Name, uc.Url, uc.Region, uc.CanyonType,
                 uc.AquaticRating, uc.VerticalRating, uc.CommitmentRating,
                 uc.StarRating, uc.IsUnrated, uc.Notes, uc.Created, uc.Updated
      `);
    if (!result.recordset[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to fetch custom canyon' });
  }
});

// POST /api/user-canyons - create a new custom canyon
userCanyonsRouter.post('/', async (req: Request, res: Response) => {
  const { Name, Url, Region, CanyonType, AquaticRating, VerticalRating, CommitmentRating, StarRating, IsUnrated, Notes } = req.body;
  if (!Name) return res.status(400).json({ error: 'Name is required' });
  try {
    const userId = await getUserIdByRequest(req);
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(200), Name)
      .input('url', sql.NVarChar(255), Url || null)
      .input('region', sql.Int, Region ?? null)
      .input('canyonType', sql.Int, CanyonType ?? null)
      .input('aquaticRating', sql.Int, AquaticRating ?? 0)
      .input('verticalRating', sql.Int, VerticalRating ?? 0)
      .input('commitmentRating', sql.Int, CommitmentRating ?? 0)
      .input('starRating', sql.Int, StarRating ?? 0)
      .input('isUnrated', sql.Bit, IsUnrated ?? true)
      .input('notes', sql.NVarChar(1000), Notes || null)
      .query(`
        INSERT INTO UserCanyons (UserId, Name, Url, Region, CanyonType, AquaticRating, VerticalRating, CommitmentRating, StarRating, IsUnrated, Notes)
        OUTPUT INSERTED.*
        VALUES (@userId, @name, @url, @region, @canyonType, @aquaticRating, @verticalRating, @commitmentRating, @starRating, @isUnrated, @notes)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to create custom canyon' });
  }
});

// PATCH /api/user-canyons/:id - update a custom canyon (must belong to user)
userCanyonsRouter.patch('/:id', async (req: Request, res: Response) => {
  const { Name, Url, Region, CanyonType, AquaticRating, VerticalRating, CommitmentRating, StarRating, IsUnrated, Notes } = req.body;
  if (!Name) return res.status(400).json({ error: 'Name is required' });
  try {
    const userId = await getUserIdByRequest(req);
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('id', sql.Int, parseInt(req.params.id, 10))
      .input('name', sql.NVarChar(200), Name)
      .input('url', sql.NVarChar(255), Url || null)
      .input('region', sql.Int, Region ?? null)
      .input('canyonType', sql.Int, CanyonType ?? null)
      .input('aquaticRating', sql.Int, AquaticRating ?? 0)
      .input('verticalRating', sql.Int, VerticalRating ?? 0)
      .input('commitmentRating', sql.Int, CommitmentRating ?? 0)
      .input('starRating', sql.Int, StarRating ?? 0)
      .input('isUnrated', sql.Bit, IsUnrated ?? true)
      .input('notes', sql.NVarChar(1000), Notes || null)
      .query(`
        UPDATE UserCanyons
        SET Name = @name, Url = @url, Region = @region, CanyonType = @canyonType,
            AquaticRating = @aquaticRating, VerticalRating = @verticalRating,
            CommitmentRating = @commitmentRating, StarRating = @starRating,
            IsUnrated = @isUnrated, Notes = @notes,
            Updated = GETDATE()
        OUTPUT INSERTED.*
        WHERE Id = @id AND UserId = @userId
      `);
    if (!result.recordset[0]) return res.status(404).json({ error: 'Not found or not authorized' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to update custom canyon' });
  }
});

// DELETE /api/user-canyons/:id - delete a custom canyon (must belong to user)
// Also unlinks any CanyonRecords pointing to it (sets UserCanyonId = NULL)
userCanyonsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    const id = parseInt(req.params.id, 10);
    const pool = await getPool();

    // Verify ownership
    const own = await pool.request()
      .input('id', sql.Int, id)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM UserCanyons WHERE Id = @id AND UserId = @userId');
    if (!own.recordset[0]) return res.status(404).json({ error: 'Not found or not authorized' });

    // Unlink records (preserve the journal entries, just orphan them)
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE CanyonRecords SET UserCanyonId = NULL WHERE UserCanyonId = @id');

    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM UserCanyons WHERE Id = @id');

    res.status(204).send();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to delete custom canyon' });
  }
});

export default userCanyonsRouter;
