import { CanyonFilterOptions } from "../../src/types/Canyon";
import { CANYON_KEY_PREFIX, USERCANYON_KEY_PREFIX } from "../../src/utils/canyonKey";
import { sql } from "../middleware/sqlserver";
import { CanyonData, UserCanyonData } from "../types/Canyon.type";

export const getBaseCanyonDataWithoutDescents = async (pool: sql.ConnectionPool): Promise<CanyonData[]> => {
    const res = await pool.request().query(`
        SELECT c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating,
               c.CommitmentRating, c.IsVerified, c.IsUnrated, c.CanyonType, c.IsDeleted,
               c.SourceId, c.RegionId,
               rgn.Symbol AS RegionSymbol,
               rgn.Slug AS RegionSlug,
               cs.DisplayName AS SourceName,
               cs.LogoUrl AS SourceLogoUrl,
               cs.WebsiteUrl AS SourceWebsiteUrl
        FROM Canyons c
        LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
        LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
        WHERE c.IsVerified = 1
        ORDER BY c.Name
    `);
    return res.recordset;
};

export const getAdminCanyonList = async (pool: sql.ConnectionPool): Promise<CanyonData[]> => {
    const res = await pool.request().query(`
        SELECT c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating,
               c.CommitmentRating, c.IsVerified, c.IsUnrated, c.CanyonType, c.IsDeleted,
               c.SourceId, c.RegionId,
               rgn.Symbol AS RegionSymbol,
               rgn.Slug AS RegionSlug,
               cs.DisplayName AS SourceName,
               cs.LogoUrl AS SourceLogoUrl,
               cs.WebsiteUrl AS SourceWebsiteUrl
        FROM Canyons c
        LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
        LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
        ORDER BY c.Name
    `);
    return res.recordset;
};


function buildSelectStatement(canyonTableName: string, canyonKeyPrefix: string): string {
    return `${canyonTableName}.Id, 
            CONCAT('${canyonKeyPrefix}', ${canyonTableName}.Id) AS [Key],
            ${canyonTableName}.Name,
            ${canyonTableName}.Url,
            ${canyonTableName}.AquaticRating,
            ${canyonTableName}.VerticalRating,
            ${canyonTableName}.StarRating,
            ${canyonTableName}.CommitmentRating,
            ${canyonTableName}.IsUnrated,
            ${canyonTableName}.CanyonType,
            ${canyonTableName}.RegionId,
            rgn.Symbol AS RegionSymbol,
            rgn.Slug AS RegionSlug,
            COUNT(cr.Id) AS Descents,
            MAX(cr.Date) AS LastDescentDate,
            CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsFavourite`
}

function buildGroupByStatement(canyonTableName: string, canyonKeyPrefix: string): string {
    return `${canyonTableName}.Id, CONCAT('${canyonKeyPrefix}', ${canyonTableName}.Id), ${canyonTableName}.Name, ${canyonTableName}.Url, ${canyonTableName}.AquaticRating, ${canyonTableName}.VerticalRating, ${canyonTableName}.StarRating, ${canyonTableName}.CommitmentRating, ${canyonTableName}.IsUnrated, ${canyonTableName}.RegionId, ${canyonTableName}.CanyonType, cf.Id, rgn.Symbol, rgn.Slug`
}

function getBaseCanyonDataQuery() {
    return `SELECT ${buildSelectStatement('c', CANYON_KEY_PREFIX)},
                c.IsVerified,
                c.IsDeleted,
                c.SourceId,
                cs.DisplayName AS SourceName,
                cs.LogoUrl AS SourceLogoUrl,
                cs.WebsiteUrl AS SourceWebsiteUrl
            FROM Canyons c
                LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
                LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
                LEFT JOIN CanyonFavourites cf ON cf.CanyonId = c.Id AND cf.UserId = @userId
                LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
                WHERE c.IsVerified = 1 AND cs.IsEnabled = 1
                GROUP BY ${buildGroupByStatement('c', CANYON_KEY_PREFIX)},
                    c.IsVerified,
                    c.IsDeleted,
                    c.SourceId,
                    cs.DisplayName,
                    cs.LogoUrl,
                    cs.WebsiteUrl`
}

function getBaseUserCanyonDataQuery() {
    return `SELECT ${buildSelectStatement('uc', USERCANYON_KEY_PREFIX)},
            1 AS IsVerified,
            0 AS IsDeleted,
            NULL As SourceId,
            NULL AS DisplayName,
            NULL AS LogoUrl,
            NULL AS SourceWebsiteUrl
            FROM UserCanyons uc
            LEFT JOIN CanyonRecords cr ON cr.UserCanyonId = uc.Id
            LEFT JOIN CanyonFavourites cf ON cf.UserCanyonId = uc.Id AND cf.UserId = @userId
            LEFT JOIN Regions rgn ON uc.RegionId = rgn.Id
            WHERE uc.UserId = @userId
            GROUP BY ${buildGroupByStatement('uc', USERCANYON_KEY_PREFIX)}
            ORDER BY Descents DESC, uc.Name`
}

export async function getAllCanyonsMetaData(pool: sql.ConnectionPool, userId: number, filter: CanyonFilterOptions): Promise<{ totalPages: number, canyonCount: number }> {
    const request = pool.request()
        .input('userId', sql.Int, userId)
        .input('offset', sql.Int, (filter.page - 1) * filter.pageSize)
        .input('pageSize', sql.Int, filter.pageSize);

    const baseQuery = `WITH Canyons AS (
            ${getBaseCanyonDataQuery()}
            UNION
            ${getBaseUserCanyonDataQuery()}    
        )`

    const totalQueryString = `
        ${baseQuery}
        SELECT COUNT(*) As TotalCanyons, COUNT(*) / @pageSize AS PageCount FROM Canyons
    `

    const metaRes = await request.query(totalQueryString);

    return {
        canyonCount: metaRes.recordset[0].TotalCanyons,
        totalPages: metaRes.recordset[0].PageCount
    }
}

export async function getAllCanyonsWithFilters(pool: sql.ConnectionPool, userId: number, filter: CanyonFilterOptions): Promise<CanyonData[]> {

    const request = pool.request()
        .input('userId', sql.Int, userId)
        .input('offset', sql.Int, (filter.page - 1) * filter.pageSize)
        .input('pageSize', sql.Int, filter.pageSize);

    const baseQuery = `WITH Canyons AS (
            ${getBaseCanyonDataQuery()}
            UNION ALL
            ${getBaseUserCanyonDataQuery()}    
        )`

    const pageQueryString = `
        ${baseQuery}
        SELECT * FROM Canyons
        ORDER BY Name, Key
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
    `

    const pageRes = await request
        .query(pageQueryString);

    return pageRes.recordset;

}

export const getBaseCanyonDataWithDescents = async (pool: sql.ConnectionPool, userId: number): Promise<CanyonData[]> => {
    const query = getBaseCanyonDataQuery();
    try {
        const res = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);

        return res.recordset;
    }
    catch (e) {
        console.error(query);
        throw e;
    }
}

export const getUserCanyonDataWithDescents = async (pool: sql.ConnectionPool, userId: number): Promise<UserCanyonData[]> => {
    const query = getBaseUserCanyonDataQuery()
    try {
        var res = await pool.request()
            .input('userId', sql.Int, userId)
            .query(query);

        return res.recordset;
    } catch (e) {
        console.error('USER CANYON QUERY:', query);
        throw e;
    }
}

export const getSpecificCanyon = async (pool: sql.ConnectionPool, canyonId: number): Promise<CanyonData> => {
    const res = await pool.request()
        .input('canyonId', sql.Int, canyonId)
        .query(`
            SELECT c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating,
              c.CommitmentRating, c.IsVerified, c.IsUnrated, c.CanyonType, c.IsDeleted,
              c.SourceId, c.RegionId,
              rgn.Symbol AS RegionSymbol,
              rgn.Slug AS RegionSlug,
              cs.DisplayName AS SourceName,
              cs.LogoUrl AS SourceLogoUrl,
              cs.WebsiteUrl AS SourceWebsiteUrl
            FROM Canyons c
            LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
            LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
            WHERE c.Id = @canyonId
        `);
    return res.recordset[0];
};

export const getSpecificCanyonWithDescents = async (pool: sql.ConnectionPool, canyonId: number, userId: number): Promise<CanyonData> => {
    const res = await pool.request()
        .input('userId', sql.Int, userId)
        .input('canyonId', sql.Int, canyonId)
        .query(`
            SELECT c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating,
              c.CommitmentRating, c.IsVerified, c.IsUnrated, c.CanyonType, c.IsDeleted,
              c.SourceId, c.RegionId,
              rgn.Symbol AS RegionSymbol,
              rgn.Slug AS RegionSlug,
              cs.DisplayName AS SourceName,
              cs.LogoUrl AS SourceLogoUrl,
              cs.WebsiteUrl AS SourceWebsiteUrl,
              COUNT(cr.Id) AS Descents,
              MAX(cr.Date) AS LastDescentDate
            FROM Canyons c
            LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
            LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
            LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
            WHERE c.Id = @canyonId
            GROUP BY c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating, c.CommitmentRating, c.IsVerified, c.IsUnrated, c.RegionId, c.CanyonType, c.IsDeleted, c.SourceId, cs.DisplayName, cs.LogoUrl, cs.WebsiteUrl, rgn.Symbol, rgn.Slug
            ORDER BY Descents DESC, c.Name
        `);
    return res.recordset[0];
};

export const getCanyonRecordCount = async (pool: sql.ConnectionPool, canyonId: number): Promise<number> => {
    const res = await pool.request()
        .input('canyonId', sql.Int, canyonId)
        .query('SELECT COUNT(*) AS Count FROM CanyonRecords WHERE CanyonId = @canyonId');
    return res.recordset[0].Count;
};

export const deleteCanyonWithCascade = async (pool: sql.ConnectionPool, canyonId: number): Promise<void> => {
    await pool.request()
        .input('canyonId', sql.Int, canyonId)
        .query(`
            DELETE crg FROM CanyonRecordGear crg
            JOIN CanyonRecords cr ON crg.CanyonRecordId = cr.Id
            WHERE cr.CanyonId = @canyonId;

            DELETE crr FROM CanyonRecordRope crr
            JOIN CanyonRecords cr ON crr.CanyonRecordId = cr.Id
            WHERE cr.CanyonId = @canyonId;

            DELETE FROM CanyonRecords WHERE CanyonId = @canyonId;

            DELETE FROM Canyons WHERE Id = @canyonId;
        `);
};