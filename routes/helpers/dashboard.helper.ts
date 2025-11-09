import { getPool } from "../middleware/sqlserver";


export async function getRecentCanyonCount(userId: number): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
        .input('userId', userId)
        .input('startOfYear', new Date(new Date().getFullYear(), 0, 1))
        .input('endOfYear', new Date(new Date().getFullYear() + 1, 0, 1))
        .query('SELECT COUNT(*) as Total FROM CanyonRecords WHERE UserId = @userId AND Date >= @startOfYear AND Date < @endOfYear');

    return result.recordset[0]?.Total ?? 0;
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
