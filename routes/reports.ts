import express, { Request, Response } from 'express';
import { getPool, sql } from './middleware/sqlserver';
import { getUserIdByRequest, isAdmin } from './helpers/user.helper';
import { canyonDetailUrl } from './helpers/urlHelper';

const router = express.Router();

// POST /api/reports — submit a report for a verified canyon (any authenticated user)
router.post('/', async (req: Request, res: Response) => {
  const userId = await getUserIdByRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthenticated' });

  const { canyonId, issueType, description } = req.body;
  if (!canyonId || !issueType) return res.status(400).json({ error: 'canyonId and issueType are required' });

  const issueTypeInt = parseInt(issueType, 10);
  if (![1, 2, 3].includes(issueTypeInt)) return res.status(400).json({ error: 'Invalid issueType' });

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('canyonId', sql.Int, parseInt(canyonId, 10))
      .input('userId', sql.Int, userId)
      .input('issueType', sql.Int, issueTypeInt)
      .input('description', sql.NVarChar(1000), description || null)
      .query(`
        INSERT INTO CanyonReports (CanyonId, UserId, IssueType, Description)
        OUTPUT INSERTED.*
        VALUES (@canyonId, @userId, @issueType, @description)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// GET /api/reports — list all reports (admin only), with canyon and reporter info
router.get('/', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        r.Id,
        r.CanyonId,
        c.Name AS CanyonName,
        r.UserId,
        u.FirstName AS ReporterName,
        r.IssueType,
        r.Description,
        r.Status,
        r.AdminNotes,
        r.ReviewedAt,
        r.ReviewedByUserId,
        r.CreatedAt
      FROM CanyonReports r
      JOIN Canyons c ON r.CanyonId = c.Id
      JOIN Users u ON r.UserId = u.Id
      ORDER BY r.CreatedAt DESC
    `);

    const reports = result.recordset.map((row: any) => ({
      ...row,
      CanyonDetailUrl: canyonDetailUrl(row.CanyonId),
    }));

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PATCH /api/reports/:id — update status and/or admin notes (admin only)
router.patch('/:id', async (req: Request, res: Response) => {
  if (!await isAdmin(req)) return res.status(403).json({ error: 'Admin access required' });

  const adminUserId = await getUserIdByRequest(req);
  const { status, adminNotes } = req.body;

  if (status === undefined && adminNotes === undefined) {
    return res.status(400).json({ error: 'status or adminNotes is required' });
  }

  const statusInt = status !== undefined ? parseInt(status, 10) : undefined;
  if (statusInt !== undefined && ![0, 1, 2, 3].includes(statusInt)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const pool = await getPool();

    // Determine if this update resolves/reviews the report
    const isResolution = statusInt === 2 || statusInt === 3; // Reviewed or Rejected

    const result = await pool.request()
      .input('id', sql.Int, parseInt(req.params.id, 10))
      .input('status', sql.Int, statusInt ?? null)
      .input('adminNotes', sql.NVarChar(1000), adminNotes ?? null)
      .input('reviewedAt', sql.DateTime, isResolution ? new Date() : null)
      .input('reviewedByUserId', sql.Int, isResolution ? (adminUserId ?? null) : null)
      .query(`
        UPDATE CanyonReports
        SET
          Status = COALESCE(@status, Status),
          AdminNotes = COALESCE(@adminNotes, AdminNotes),
          ReviewedAt = CASE WHEN @reviewedAt IS NOT NULL THEN @reviewedAt ELSE ReviewedAt END,
          ReviewedByUserId = CASE WHEN @reviewedByUserId IS NOT NULL THEN @reviewedByUserId ELSE ReviewedByUserId END
        OUTPUT INSERTED.*
        WHERE Id = @id
      `);

    if (result.recordset.length === 0) return res.status(404).json({ error: 'Report not found' });
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

export default router;
