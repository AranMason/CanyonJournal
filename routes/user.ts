
import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';

const router: Router = express.Router();


// Auth0: Get current user info from OIDC
router.get('/user', async (req: Request, res: Response) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated with SSO' });
  }
  const user = req.oidc.user;
  if (!user || !user.email) {
    return res.status(401).json({ error: 'Not authenticated with Valid Credentials' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('guid', sql.NVarChar(255), user.email)
      .input('firstName', sql.NVarChar(100), user.given_name || user.name || '')
      .input('profilePicture', sql.NVarChar(255), user.picture || null)
      .query(`MERGE INTO Users WITH (HOLDLOCK) AS target
              USING (SELECT @guid AS Guid) AS source
              ON target.Guid = source.Guid
              WHEN MATCHED THEN
                UPDATE SET FirstName = @firstName, ProfilePicture = @profilePicture
              WHEN NOT MATCHED THEN
                INSERT (Guid, FirstName, ProfilePicture) VALUES (@guid, @firstName, @profilePicture)
              OUTPUT inserted.Id, inserted.Guid, inserted.FirstName, inserted.ProfilePicture;`);
    const dbUser = result.recordset[0];
    req.session.userId = dbUser.Id;
    res.json({
      id: dbUser.Id,
      guid: dbUser.Guid,
      first_name: dbUser.FirstName,
      picture_url: dbUser.ProfilePicture,
      email: user.email,
      isloggedin: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upsert user in DB' });
  }
});


// Login/logout handled by express-openid-connect

export default router