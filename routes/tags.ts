import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest } from './helpers/user.helper';

const tagRouter: Router = express.Router();

// POST /api/tags — create a new tag (or return existing if name already taken)
tagRouter.post('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthenticated' });
    const { Name } = req.body as { Name?: string };
    if (!Name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const trimmed = Name.trim();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(100), trimmed)
      .query(`
        MERGE Tags AS target
        USING (SELECT @userId AS UserId, @name AS Name) AS source
        ON target.UserId = source.UserId AND target.Name = source.Name
        WHEN NOT MATCHED THEN INSERT (UserId, Name) VALUES (source.UserId, source.Name);
        SELECT Id, Name FROM Tags WHERE UserId = @userId AND Name = @name;
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});
tagRouter.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT
          t.Id,
          t.Name,
          COUNT(crt.CanyonRecordId) AS UsageCount,
          MAX(cr.Date) AS LastUsed
        FROM Tags t
        LEFT JOIN CanyonRecordTags crt ON crt.TagId = t.Id
        LEFT JOIN CanyonRecords cr ON cr.Id = crt.CanyonRecordId
        WHERE t.UserId = @userId
        GROUP BY t.Id, t.Name
        ORDER BY t.Name
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// PATCH /api/tags/:id — rename a tag for the current user
tagRouter.patch('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const tagId = Number(req.params.id);
    const { Name } = req.body as { Name?: string };
    if (!Name || !Name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const trimmed = Name.trim();
    const check = await pool.request()
      .input('tagId', sql.Int, tagId)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Tags WHERE Id = @tagId AND UserId = @userId');
    if (check.recordset.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    // Ensure the new name doesn't conflict with an existing tag for this user
    const conflict = await pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(100), trimmed)
      .input('tagId', sql.Int, tagId)
      .query('SELECT Id FROM Tags WHERE UserId = @userId AND Name = @name AND Id <> @tagId');
    if (conflict.recordset.length > 0) {
      return res.status(409).json({ error: 'A tag with that name already exists' });
    }
    await pool.request()
      .input('tagId', sql.Int, tagId)
      .input('name', sql.NVarChar(100), trimmed)
      .query('UPDATE Tags SET Name = @name WHERE Id = @tagId');
    res.json({ Id: tagId, Name: trimmed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to rename tag' });
  }
});


tagRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const userId = await getUserIdByRequest(req);
    const tagId = Number(req.params.id);
    // Verify ownership before deleting
    const check = await pool.request()
      .input('tagId', sql.Int, tagId)
      .input('userId', sql.Int, userId)
      .query('SELECT Id FROM Tags WHERE Id = @tagId AND UserId = @userId');
    if (check.recordset.length === 0) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    await pool.request()
      .input('tagId', sql.Int, tagId)
      .query('DELETE FROM CanyonRecordTags WHERE TagId = @tagId');
    await pool.request()
      .input('tagId', sql.Int, tagId)
      .query('DELETE FROM Tags WHERE Id = @tagId');
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

export default tagRouter;
