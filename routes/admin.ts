import express, { Request, Response, Router } from 'express';
import { } from '../src/types/express-session';
import { getPool } from './middleware/sqlserver';

const router: Router = express.Router();

type AdminStatsRow = {
    TotalUsers: number;
    TotalRecords: number;
    TotalTripsLast90Days: number;
    TotalGoals: number;
    TotalGoalsCompleted: number;
    ActiveUsersLast90Days: number;
};

type PopularCanyonRow = {
    CanyonName: string;
    TripCount: number;
};

type PopularRegionRow = {
    RegionSlug: string;
    RegionSymbol: string | null;
    TripCount: number;
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
                    (
                        SELECT COUNT(*)
                        FROM CanyonRecords
                        WHERE [Date] >= DATEADD(MONTH, -3, CAST(GETDATE() AS DATE))
                    ) AS TotalTripsLast90Days,
                    (SELECT COUNT(*) FROM Goals) AS TotalGoals,
                    (SELECT COUNT(*) FROM Goals WHERE CompletedAt IS NOT NULL) AS TotalGoalsCompleted,
                    (
                        SELECT COUNT(DISTINCT UserId)
                        FROM CanyonRecords
                        WHERE [Date] >= DATEADD(MONTH, -3, CAST(GETDATE() AS DATE))
                    ) AS ActiveUsersLast90Days;
              `
        );

        const popularCanyonsResult = await pool.request().query<PopularCanyonRow>(`
                SELECT TOP 5
                    c.Name AS CanyonName,
                    COUNT(*) AS TripCount
                FROM CanyonRecords cr
                INNER JOIN Canyons c ON cr.CanyonId = c.Id
                GROUP BY c.Name
                ORDER BY COUNT(*) DESC, c.Name ASC;
            `);

        const popularRegionsResult = await pool.request().query<PopularRegionRow>(`
                SELECT TOP 5
                    r.Slug AS RegionSlug,
                    r.Symbol AS RegionSymbol,
                    COUNT(*) AS TripCount
                FROM CanyonRecords cr
                LEFT JOIN Canyons c ON cr.CanyonId = c.Id
                LEFT JOIN UserCanyons uc ON cr.UserCanyonId = uc.Id
                INNER JOIN Regions r ON r.Id = COALESCE(c.RegionId, uc.RegionId)
                GROUP BY r.Slug, r.Symbol
                ORDER BY COUNT(*) DESC, r.Slug ASC;
            `);

        const stats = result.recordset[0];

        res.status(200).json({
            totalUsers: stats?.TotalUsers ?? 0,
            totalRecords: stats?.TotalRecords ?? 0,
            totalTripsLast90Days: stats?.TotalTripsLast90Days ?? 0,
            totalGoals: stats?.TotalGoals ?? 0,
            totalGoalsCompleted: stats?.TotalGoalsCompleted ?? 0,
            activeUsersLast90Days: stats?.ActiveUsersLast90Days ?? 0,
            topCanyons: popularCanyonsResult.recordset.map((row) => ({
                canyonName: row.CanyonName,
                tripCount: row.TripCount
            })),
            topRegions: popularRegionsResult.recordset.map((row) => ({
                regionSlug: row.RegionSlug,
                regionSymbol: row.RegionSymbol,
                tripCount: row.TripCount
            }))
        });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to retrieve stats' });
    }
});

export default router;