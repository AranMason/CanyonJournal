import { getPool } from "../middleware/sqlserver";


export async function getRecentCanyonCount(userId: number): Promise<number> {
    const pool = await getPool();
    const result = await pool.request()
        .input('userId', userId)
        .query('SELECT COUNT(*) as Total FROM CanyonRecords WHERE UserId = @userId AND Date >= DATEADD(MONTH, -3, GETDATE()) ')


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
    const result = await pool.request()
        .input('userId', userId)
        .query('SELECT COUNT(Distinct CanyonId) as Total FROM CanyonRecords WHERE UserId = @userId AND CanyonId IS NOT NULL')


    return result.recordset[0]?.Total ?? 0;
}
