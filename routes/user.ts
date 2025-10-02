import express, { Request, Response, Router } from 'express';
import { getPool, sql } from './middleware/sqlserver';

const router: Router = express.Router();


// Get DB user Id by email
router.get('/user-id', async (req: Request, res: Response) => {
  const email = req.query.email;
  const firstName = req.query.firstName || '';
  const profilePicture = req.query.profilePicture || null;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid email' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('guid', sql.NVarChar(255), email)
      .input('firstName', sql.NVarChar(100), firstName)
      .input('profilePicture', sql.NVarChar(255), profilePicture)
      .query(`MERGE INTO Users WITH (HOLDLOCK) AS target
              USING (SELECT @guid AS Guid) AS source
              ON target.Guid = source.Guid
              WHEN MATCHED THEN
                UPDATE SET FirstName = @firstName, ProfilePicture = @profilePicture
              WHEN NOT MATCHED THEN
                INSERT (Guid, FirstName, ProfilePicture) VALUES (@guid, @firstName, @profilePicture)
              OUTPUT inserted.Id;`);
    if (!result.recordset[0]) {
      return res.status(500).json({ error: 'Failed to upsert user' });
    }
    res.json({ dbUserId: result.recordset[0].Id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upsert user' });
  }
});

// Auth0: Get current user info from OIDC
router.get('/user', async (req: Request, res: Response) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated with SSO' });
  }
  const user = req.oidc.user;
  console.log('OIDC user:', user, req.session);
  if (!user || !user.email) {
    return res.status(401).json({ error: 'Not authenticated with Valid Credentials' });
  }

  res.json({
      id: req.oidc.user?.[`${process.env.BASE_URL}/dbUserId`],
      guid: user.email,
      first_name: user.given_name,
      picture_url: user.picture,
      email: user?.email,
      isloggedin: req.oidc.isAuthenticated()
    });

});

export default router