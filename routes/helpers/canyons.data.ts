import { query } from "express";
import { CanyonFilterOptionsRequest } from "../../src/types/Canyon";
import { CANYON_KEY_PREFIX, parseCanyonKey, USERCANYON_KEY_PREFIX } from "../../src/utils/canyonKey";
import { sql } from "../middleware/sqlserver";
import { CanyonData, UserCanyonData } from "../types/Canyon.type";
import { canyonDetailUrl } from "./urlHelper";

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
    return `${canyonTableName}.Id, ${canyonTableName}.Name, ${canyonTableName}.Url, ${canyonTableName}.AquaticRating, ${canyonTableName}.VerticalRating, ${canyonTableName}.StarRating, ${canyonTableName}.CommitmentRating, ${canyonTableName}.IsUnrated, ${canyonTableName}.RegionId, ${canyonTableName}.CanyonType, cf.Id, rgn.Symbol, rgn.Slug`
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
            `
}

export async function getAllCanyonsMetaData(pool: sql.ConnectionPool, userId: number, filter: CanyonFilterOptionsRequest): Promise<{ totalPages: number, canyonCount: number }> {
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
function buildFilters(tablePrefix: string, request: sql.Request, filter: CanyonFilterOptionsRequest): string[] {
    const filters: string[] = [];

    if (filter.aquaticRating) {
        request.input('minAquaticRating', sql.Int, filter.aquaticRating);
        filters.push(`[${tablePrefix}].AquaticRating >= @minAquaticRating`);
    }

    if (filter.verticalRating) {
        request.input('minVerticalRating', sql.Int, filter.verticalRating);
        filters.push(`[${tablePrefix}].VerticalRating >= @minVerticalRating`);
    }

    if (filter.commitmentRating) {
        request.input('minCommitmentRating', sql.Int, filter.commitmentRating);
        filters.push(`[${tablePrefix}].CommitmentRating >= @minCommitmentRating`);
    }

    if (filter.starRating) {
        request.input('minStarRating', sql.Int, filter.starRating);
        filters.push(`[${tablePrefix}].StarRating >= @minStarRating`);
    }

    if (filter.regions?.length) {
        request.input('regions', sql.NVarChar, filter.regions.join(','));
        filters.push(`[${tablePrefix}].RegionId IN (SELECT value FROM STRING_SPLIT(@regions, ','))`);
    }

    if (filter.type && filter.type.length > 0) {
        request.input('type', sql.Int, filter.type);
        filters.push(`[${tablePrefix}].CanyonType = @type`);
    }

    // We have text, and it's not just white-space
    if (filter.text && !filter.text.match(/^\s*$/)) {
        const tokens = filter.text.split(' ').map(s => s.trim()).filter(s => s);
        var queries = tokens.map((t, i) => {
            request.input(`text_${i}`, sql.NVarChar, `%${t}%`);
            return `[${tablePrefix}].Name LIKE @text_${i}`;
        }).join(' AND ');
        filters.push(`(${queries})`)
    }

    return filters;
}

function getOrderByColumn(filter: CanyonFilterOptionsRequest): { column: string, direction: 'ASC' | 'DESC' }[] {
    switch (filter.orderBy) {
        case "Descents":
            return [{ column: 'Descents', direction: 'DESC' }]
        case "Name":
            return [{ column: 'Name', direction: 'ASC' }]
        case "LastDescent":
            return [{ column: 'LastDescentDate', direction: 'DESC' }]
        case "VerticalRating":
            return [{ column: 'IsUnrated', direction: 'ASC' }, { column: 'VerticalRating', direction: 'DESC' }]
        case "AquaticRating":
            return [{ column: 'IsUnrated', direction: 'ASC' }, { column: 'AquaticRating', direction: 'DESC' }]
        case "StarRating":
            return [{ column: 'IsUnrated', direction: 'ASC' }, { column: 'StarRating', direction: 'DESC' }]
        case "CommitmentRating":
            return [{ column: 'IsUnrated', direction: 'ASC' }, { column: 'CommitmentRating', direction: 'DESC' }]
    }
}

export async function getAllCanyonsWithFilters(pool: sql.ConnectionPool, userId: number, filter: CanyonFilterOptionsRequest): Promise<{
    totalCount: number,
    totalPages: number,
    results: CanyonData[]
}> {

    if (!filter.page || !filter.pageSize) {
        throw new Error('Missing Page and/or Page Size arguments')
    }

    const request = pool.request()
        .input('userId', sql.Int, userId)
        .input('offset', sql.Int, (filter.page - 1) * filter.pageSize)
        .input('pageSize', sql.Int, filter.pageSize);

    const baseQuery = `WITH AllCanyons AS (
            ${getBaseCanyonDataQuery()}
            UNION ALL
            ${getBaseUserCanyonDataQuery()}    
        )`

    const filterSet: string[] = buildFilters('ac', request, filter);

    const whereClause = filterSet.length > 0 ? `WHERE ${filterSet.join(' AND ')}` : ''
    const orderBy = getOrderByColumn(filter).map(s => `ac.[${s.column}] ${s.direction}`).join(', ')
    const pageQueryString = `
        ${baseQuery}
        SELECT * FROM AllCanyons ac
        ${whereClause}
        ORDER BY ${orderBy}${filter.orderBy !== 'Name' ? ', ac.[Name]' : ''}, ac.[Key]
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
    `


    try {
        const pageResTask = request
            .query(pageQueryString);

        const promiseArray = [pageResTask];

        if (filter.includeMetaData) {
            const metaQueryString = `
                ${baseQuery}
                SELECT COUNT(*) as [Total] FROM AllCanyons ac
                ${whereClause}
            `
            const metaResTask = request.query(metaQueryString);
            promiseArray.push(metaResTask);
        }


        const [pageRes, metaRes] = await Promise.all(promiseArray)

        const baseResult = {
            totalCount: 0,
            totalPages: 0,
            results: pageRes.recordset.map(s => {
                const { canyonId, userCanyonId } = parseCanyonKey(s.Key)
                return {
                    ...s,
                    DetailUrl: canyonDetailUrl(canyonId, userCanyonId)
                    // : getDetail
                }
            })
        }

        if (filter.includeMetaData) {
            const totalCount = metaRes.recordset[0].Total as number;

            baseResult.totalCount = totalCount;
            baseResult.totalPages = Math.ceil(totalCount / filter.pageSize);
        }


        return baseResult;
    } catch (e) {
        console.error(pageQueryString);
        throw e;
    }

}

export const getBaseCanyonDataWithDescents = async (pool: sql.ConnectionPool, userId: number): Promise<CanyonData[]> => {
    const query = `${getBaseCanyonDataQuery()} ORDER BY Descents, c.Name, c.Id`;
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
    const query = `${getBaseUserCanyonDataQuery()} ORDER BY Descents, uc.Name`
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