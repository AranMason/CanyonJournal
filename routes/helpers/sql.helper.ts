import { Request } from 'express';
import { getPool, sql } from '../middleware/sqlserver';

export async function getUserIdByRequest(req: Request): Promise<number | undefined> {

    if(req.session?.userId) {
        return req.session.userId;
    }

    const email = req.oidc.user?.email;
    return getUserIdByEmail(email);
}

/**
 * Loads the DB user Id for a given email (SSO guid).
 * @param email The user's email (SSO guid)
 * @returns The user Id if found, otherwise undefined
 */
export async function getUserIdByEmail(email: string): Promise<number | undefined> {
  if (!email) return undefined;
  const pool = await getPool();
  const result = await pool.request()
    .input('guid', sql.NVarChar(255), email)
    .query('SELECT Id FROM Users WHERE Guid = @guid');
  if (result.recordset.length === 0) return undefined;
  return result.recordset[0].Id;
}
