import { Request } from 'express';
import { getPool, sql } from '../middleware/sqlserver';
import {} from '../../src/types/express-session';

export async function getUserIdByRequest(req: Request): Promise<number | undefined> {

    console.log("Found user in req.user.dbUser.Id:", req.user);
    
    if (req.user?.dbUser?.Id) {
        
        return req.user.dbUser.Id;
    }

    return 0;
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
