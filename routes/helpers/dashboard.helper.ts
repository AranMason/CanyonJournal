import { getPool } from "../middleware/sqlserver";

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

export async function getTotalDescentsCount(userId: number): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
        .input('userId', userId)
        .query('SELECT COUNT(*) as Total FROM CanyonRecords WHERE UserId = @userId')


    return result.recordset[0]?.Total ?? 0;
}

export async function getUniqueCanyonsDescendedCount(userId: number): Promise<number> {
    const pool = await getPool();

    // We treat unique canyons as distinct CanyonId values, but if CanyonId is null, we fall back to using the Name field
    const result = await pool.request()
        .input('userId', userId)
        .query('SELECT COUNT(DISTINCT(COALESCE(CONVERT(varchar(255), CanyonId), Name))) As Total FROM CanyonRecords WHERE UserId = @userId')

    return result.recordset[0]?.Total ?? 0;
}
