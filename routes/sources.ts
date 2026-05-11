import express, { Request, Response } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { isAdmin } from './helpers/user.helper';

const router = express.Router();

// GET /api/sources — all sources (any authenticated user)
router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM CanyonSources ORDER BY DisplayName');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

// POST /api/sources — create a source (admin only)
router.post('/', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  const { displayName, logoUrl, websiteUrl } = req.body;
  if (!displayName) return res.status(400).json({ error: 'DisplayName is required' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('displayName', sql.NVarChar(200), displayName)
      .input('logoUrl', sql.NVarChar(500), logoUrl || null)
      .input('websiteUrl', sql.NVarChar(500), websiteUrl || null)
      .query('INSERT INTO CanyonSources (DisplayName, LogoUrl, WebsiteUrl) OUTPUT INSERTED.* VALUES (@displayName, @logoUrl, @websiteUrl)');
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create source' });
  }
});

// PATCH /api/sources/:id — update a source (admin only)
router.patch('/:id', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  const { displayName, logoUrl, websiteUrl } = req.body;
  if (!displayName) return res.status(400).json({ error: 'DisplayName is required' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, parseInt(req.params.id, 10))
      .input('displayName', sql.NVarChar(200), displayName)
      .input('logoUrl', sql.NVarChar(500), logoUrl || null)
      .input('websiteUrl', sql.NVarChar(500), websiteUrl || null)
      .query('UPDATE CanyonSources SET DisplayName=@displayName, LogoUrl=@logoUrl, WebsiteUrl=@websiteUrl OUTPUT INSERTED.* WHERE Id=@id');
    if (result.recordset.length === 0) return res.status(404).json({ error: 'Source not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update source' });
  }
});

// DELETE /api/sources/:id — delete a source (admin only)
router.delete('/:id', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  try {
    const pool = await getPool();
    const id = parseInt(req.params.id, 10);
    // Guard: don't delete if canyons reference this source
    const ref = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT COUNT(*) AS Count FROM Canyons WHERE SourceId = @id');
    if (ref.recordset[0].Count > 0) {
      return res.status(409).json({ error: 'Cannot delete: canyons are assigned to this source' });
    }
    await pool.request().input('id', sql.Int, id).query('DELETE FROM CanyonSources WHERE Id=@id');
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

export default router;
