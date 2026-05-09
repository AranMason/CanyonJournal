import { getPool } from "../middleware/sqlserver";
import sql from 'mssql';

async function getCanyonCountForPeriod(userId: number, year: number): Promise<number> {
    const pool = await getPool();

    const periodStart = new Date(year, 0, 1);
    const periodEnd = new Date(new Date(year + 1, 0, 1).getTime() - 1);
    
    const result = await pool.request()
        .input('userId', userId)
        .input('startOfYear', periodStart)
        .input('endOfYear', periodEnd)
        .query('SELECT COUNT(*) as Total FROM CanyonRecords WHERE UserId = @userId AND Date >= @startOfYear AND Date < @endOfYear');

    return result.recordset[0]?.Total ?? 0;

}

export async function getRecentCanyonCount(userId: number): Promise<{ currentYear: number; priorYear: number }> {
    const currentYear = new Date().getFullYear();

    const [currentYearResults, priorYearResults] = await Promise.all([
        getCanyonCountForPeriod(userId, currentYear),
        getCanyonCountForPeriod(userId, currentYear - 1),
    ]);

    return {
        currentYear: currentYearResults ?? 0,
        priorYear: priorYearResults ?? 0,
    };
}

export async function getTotalDescentsCount(userId: number): Promise<{ total: number; regions: number }> {
    const pool = await getPool();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT
                COUNT(*) AS Total,
                COUNT(DISTINCT CASE
                    WHEN COALESCE(c.Region, uc.Region) IS NOT NULL AND COALESCE(c.Region, uc.Region) != 0
                    THEN COALESCE(c.Region, uc.Region)
                END) AS Regions
            FROM CanyonRecords cr
            LEFT JOIN Canyons c ON cr.CanyonId = c.Id
            LEFT JOIN UserCanyons uc ON cr.UserCanyonId = uc.Id
            WHERE cr.UserId = @userId
        `);

    return {
        total: result.recordset[0]?.Total ?? 0,
        regions: result.recordset[0]?.Regions ?? 0,
    };
}

export async function getUniqueCanyonsDescendedCount(userId: number): Promise<{ total: number; thisYear: number }> {
    const pool = await getPool();
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('yearStart', yearStart)
        .query(`
            SELECT
                COUNT(DISTINCT CASE WHEN CanyonId IS NOT NULL THEN 'c' + CONVERT(varchar(20), CanyonId)
                                    WHEN UserCanyonId IS NOT NULL THEN 'u' + CONVERT(varchar(20), UserCanyonId)
                               END) AS Total,
                COUNT(DISTINCT CASE WHEN Date >= @yearStart AND CanyonId IS NOT NULL THEN 'c' + CONVERT(varchar(20), CanyonId)
                                    WHEN Date >= @yearStart AND UserCanyonId IS NOT NULL THEN 'u' + CONVERT(varchar(20), UserCanyonId)
                               END) AS ThisYear
            FROM CanyonRecords WHERE UserId = @userId
        `);

    return {
        total: result.recordset[0]?.Total ?? 0,
        thisYear: result.recordset[0]?.ThisYear ?? 0,
    };
}
