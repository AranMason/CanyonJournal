import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';

const favouritesRouter: Router = express.Router();

// GET /api/favourites - list all favourites for the current user
favouritesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const pool = await getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT CanyonId, UserCanyonId FROM CanyonFavourites WHERE UserId = @userId');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// POST /api/favourites - add a favourite
favouritesRouter.post('/', async (req: Request, res: Response) => {
  const { CanyonId, UserCanyonId } = req.body;
  if (!CanyonId && !UserCanyonId) {
    return res.status(400).json({ error: 'CanyonId or UserCanyonId is required' });
  }
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const pool = await getPool();
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('canyonId', sql.Int, CanyonId || null)
      .input('userCanyonId', sql.Int, UserCanyonId || null)
      .query(`
        IF NOT EXISTS (
          SELECT 1 FROM CanyonFavourites
          WHERE UserId = @userId
            AND (CanyonId = @canyonId OR (CanyonId IS NULL AND @canyonId IS NULL))
            AND (UserCanyonId = @userCanyonId OR (UserCanyonId IS NULL AND @userCanyonId IS NULL))
        )
        INSERT INTO CanyonFavourites (UserId, CanyonId, UserCanyonId)
        VALUES (@userId, @canyonId, @userCanyonId)
      `);
    res.status(201).json({ message: 'Favourite added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

// DELETE /api/favourites - remove a favourite
favouritesRouter.delete('/', async (req: Request, res: Response) => {
  const { CanyonId, UserCanyonId } = req.body;
  if (!CanyonId && !UserCanyonId) {
    return res.status(400).json({ error: 'CanyonId or UserCanyonId is required' });
  }
  try {
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const pool = await getPool();
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('canyonId', sql.Int, CanyonId || null)
      .input('userCanyonId', sql.Int, UserCanyonId || null)
      .query(`
        DELETE FROM CanyonFavourites
        WHERE UserId = @userId
          AND (CanyonId = @canyonId OR (CanyonId IS NULL AND @canyonId IS NULL))
          AND (UserCanyonId = @userCanyonId OR (UserCanyonId IS NULL AND @userCanyonId IS NULL))
      `);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

export default favouritesRouter;
