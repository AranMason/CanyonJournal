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

export const getBaseCanyonDataWithDescents = async (pool: sql.ConnectionPool, userId: number): Promise<CanyonData[]> => {
    var res = await pool.request()
        .input('userId', sql.Int, userId)
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
                  MAX(cr.Date) AS LastDescentDate,
                  CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsFavourite
                FROM Canyons c
                LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
                LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @userId
                LEFT JOIN CanyonFavourites cf ON cf.CanyonId = c.Id AND cf.UserId = @userId
                LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
                WHERE c.IsVerified = 1
                GROUP BY c.Id, c.Name, c.Url, c.AquaticRating, c.VerticalRating, c.StarRating, c.CommitmentRating, c.IsVerified, c.IsUnrated, c.RegionId, c.CanyonType, c.IsDeleted, c.SourceId, cf.Id, cs.DisplayName, cs.LogoUrl, cs.WebsiteUrl, rgn.Symbol, rgn.Slug
              `);

    return res.recordset;
}

export const getUserCanyonDataWithDescents = async (pool: sql.ConnectionPool, userId: number): Promise<UserCanyonData[]> => {

    var res = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
            SELECT uc.Id, uc.Name, uc.Url, uc.RegionId, uc.CanyonType,
                   rgn.Symbol AS RegionSymbol,
                   rgn.Slug AS RegionSlug,
                   uc.AquaticRating, uc.VerticalRating, uc.CommitmentRating,
                   uc.StarRating, uc.IsUnrated,
                   COUNT(cr.Id) AS Descents,
                   MAX(cr.Date) AS LastDescentDate,
                   CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS IsFavourite
            FROM UserCanyons uc
            LEFT JOIN CanyonRecords cr ON cr.UserCanyonId = uc.Id
            LEFT JOIN CanyonFavourites cf ON cf.UserCanyonId = uc.Id AND cf.UserId = @userId
            LEFT JOIN Regions rgn ON uc.RegionId = rgn.Id
            WHERE uc.UserId = @userId
            GROUP BY uc.Id, uc.Name, uc.Url, uc.RegionId, uc.CanyonType,
                     rgn.Symbol, rgn.Slug,
                     uc.AquaticRating, uc.VerticalRating, uc.CommitmentRating,
                     uc.StarRating, uc.IsUnrated, cf.Id
            ORDER BY Descents DESC, uc.Name
          `);

    return res.recordset;
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