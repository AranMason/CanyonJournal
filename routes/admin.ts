import express, { Request, Response, Router } from 'express';
import { } from '../src/types/express-session';
import { getPool } from './middleware/sqlserver';

const router: Router = express.Router();

type AdminStatsRow = {
    TotalUsers: number;
    TotalRecords: number;
    TotalGoals: number;
    TotalGoalsCompleted: number;
};

// Auth0: Get current user info from OIDC
router.get('/stats', async (req: Request, res: Response) => {
    const user = req.user?.dbUser;
    if (!user || !user.IsAdmin) {
        return res.status(401).json({ error: 'Unauthenticated' });
    }

    try {
        const pool = await getPool();
        const result = await pool.request().query<AdminStatsRow>(`
                SELECT
                    (SELECT COUNT(*) FROM Users) AS TotalUsers,
                    (SELECT COUNT(*) FROM CanyonRecords) AS TotalRecords,
                    (SELECT COUNT(*) FROM Goals) AS TotalGoals,
                    (SELECT COUNT(*) FROM Goals WHERE CompletedAt IS NOT NULL) AS TotalGoalsCompleted;
              `
        );

        const stats = result.recordset[0];

        res.status(200).json({
            totalUsers: stats?.TotalUsers ?? 0,
            totalRecords: stats?.TotalRecords ?? 0,
            totalGoals: stats?.TotalGoals ?? 0,
            totalGoalsCompleted: stats?.TotalGoalsCompleted ?? 0
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to retrieve stats' });
    }
});

export default router;