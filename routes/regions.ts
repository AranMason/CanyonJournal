import express, { Request, Response } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { isAdmin } from './helpers/user.helper';

const router = express.Router();

// Build nested tree from flat rows
function buildTree(rows: any[]): any[] {
  const map = new Map<number, any>();
  rows.forEach(r => map.set(r.Id, { ...r, Children: [] }));
  const roots: any[] = [];
  map.forEach(node => {
    if (node.ParentId == null) {
      roots.push(node);
    } else {
      const parent = map.get(node.ParentId);
      if (parent) parent.Children.push(node);
    }
  });
  const sortLevel = (nodes: any[]) => {
    nodes.sort((a, b) => a.SortOrder - b.SortOrder || a.Slug.localeCompare(b.Slug));
    nodes.forEach(n => sortLevel(n.Children));
  };
  sortLevel(roots);
  return roots;
}

// GET /api/regions — returns nested region tree (authenticated)
// Region display names are resolved client-side from the regions i18n namespace using the Slug.
router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT r.Id, r.ParentId, r.Slug, r.Symbol, r.SortOrder
      FROM Regions r
      WHERE r.IsActive = 1
      ORDER BY r.SortOrder, r.Id
    `);
    res.json(buildTree(result.recordset));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

// GET /api/regions/:id — single region (admin)
router.get('/:id', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  try {
    const pool = await getPool();
    const id = parseInt(req.params.id, 10);
    const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Regions WHERE Id = @id');
    if (!result.recordset[0]) return res.status(404).json({ error: 'Region not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch region' });
  }
});

// POST /api/regions — create a region (admin only)
router.post('/', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  const { parentId, slug, symbol, sortOrder } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug is required' });
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('parentId', sql.Int, parentId ?? null)
      .input('slug', sql.NVarChar(100), slug)
      .input('symbol', sql.NVarChar(20), symbol ?? null)
      .input('sortOrder', sql.Int, sortOrder ?? 0)
      .query(`
        INSERT INTO Regions (ParentId, Slug, Symbol, SortOrder)
        OUTPUT INSERTED.*
        VALUES (@parentId, @slug, @symbol, @sortOrder)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err: any) {
    if (err?.number === 2627) return res.status(409).json({ error: 'Slug already exists' });
    console.error(err);
    res.status(500).json({ error: 'Failed to create region' });
  }
});

// PUT /api/regions/:id — update a region (admin only)
router.put('/:id', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  const id = parseInt(req.params.id, 10);
  const { parentId, slug, symbol, sortOrder, isActive } = req.body;
  try {
    const pool = await getPool();

    // Guard against circular references: walk up from the proposed parentId and
    // ensure we never encounter the region being updated.
    if (parentId != null) {
      const allRegions = await pool.request().query('SELECT Id, ParentId FROM Regions');
      const parentMap = new Map<number, number | null>(
        allRegions.recordset.map((r: any) => [r.Id, r.ParentId])
      );
      let current: number | null = parentId;
      while (current != null) {
        if (current === id) {
          return res.status(400).json({ error: 'Cannot set a descendant as the parent (circular reference)' });
        }
        current = parentMap.get(current) ?? null;
      }
    }

    await pool.request()
      .input('id', sql.Int, id)
      .input('parentId', sql.Int, parentId ?? null)
      .input('slug', sql.NVarChar(100), slug)
      .input('symbol', sql.NVarChar(20), symbol ?? null)
      .input('sortOrder', sql.Int, sortOrder ?? 0)
      .input('isActive', sql.Bit, isActive ?? true)
      .query(`
        UPDATE Regions
        SET ParentId = @parentId, Slug = @slug, Symbol = @symbol,
            SortOrder = @sortOrder, IsActive = @isActive
        WHERE Id = @id
      `);
    res.status(204).send();
  } catch (err: any) {
    if (err?.number === 2627) return res.status(409).json({ error: 'Slug already exists' });
    console.error(err);
    res.status(500).json({ error: 'Failed to update region' });
  }
});

// DELETE /api/regions/:id — delete a region (admin only)
// Blocked if region has children or any canyons/userCanyons assigned
router.delete('/:id', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });
  const id = parseInt(req.params.id, 10);
  try {
    const pool = await getPool();
    const [childrenResult, canyonsResult, userCanyonsResult] = await Promise.all([
      pool.request().input('id', sql.Int, id).query('SELECT COUNT(*) AS Count FROM Regions WHERE ParentId = @id'),
      pool.request().input('id', sql.Int, id).query('SELECT COUNT(*) AS Count FROM Canyons WHERE RegionId = @id'),
      pool.request().input('id', sql.Int, id).query('SELECT COUNT(*) AS Count FROM UserCanyons WHERE RegionId = @id'),
    ]);
    const children = childrenResult.recordset[0].Count;
    const canyons = canyonsResult.recordset[0].Count;
    const userCanyons = userCanyonsResult.recordset[0].Count;
    if (children > 0 || canyons > 0 || userCanyons > 0) {
      return res.status(409).json({ error: 'Cannot delete region in use', children, canyons, userCanyons });
    }
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Regions WHERE Id = @id');
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete region' });
  }
});

export default router;

