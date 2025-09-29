import express, { Application, Request, Response, Router } from 'express'
import { ProfileAndToken, WorkOS } from '@workos-inc/node'
import type {} from '../src/types/express-session'
import { getPool, sql } from './middleware/sqlserver';

const router: Router = express.Router()
interface Params {
  clientID: string;
  redirectURI: string;
  state?: string;
  provider?: string;
  connection?: string;
  organization?: string;
}

const workos: WorkOS = new WorkOS(process.env.WORKOS_API_KEY)
const clientID: string = process.env.WORKOS_CLIENT_ID !== undefined ? process.env.WORKOS_CLIENT_ID : ''
const organizationID: string = ''
const redirectURI: string = process.env.WORKOS_CALLBACK_URL ?? '';
const state: string = ''

// Route to get the current user's data if logged in
router.get('/user', async (req: Request, res: Response) => {
  if (!req.session.isloggedin || !req.session.userId) {
    req.session.isloggedin = false;
    req.session.userId = 0;
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('id', sql.Int, req.session.userId)
      .query('SELECT Id, Guid, FirstName, ProfilePicture FROM Users WHERE Id = @id');
    const user = result.recordset[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user.Id,
      guid: user.Guid,
      first_name: user.FirstName,
      picture_url: user.ProfilePicture,
      isloggedin: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load user from DB' });
  }
});

router.post('/login', (req: Request, res: Response) => {
  
  const login_type = req.body.login_method;

    const params: Params = {
        clientID: clientID,
        redirectURI: redirectURI,
        state: state
    };

    if (login_type === "saml") {
        params.organization = organizationID;
    } else {
        params.provider = login_type;
    }
  
  try {
    const url: string = workos.sso.getAuthorizationURL(params)

    res.redirect(url)
  } catch (error) {
    return res.redirect('/error?message=' + (error instanceof Error ? error.message : 'Unknown error'));
  }
})

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const code: string = typeof req.query.code === 'string' ? req.query.code : ''

    const profile: ProfileAndToken = await workos.sso.getProfileAndToken({
      code,
      clientID,
    })

    req.session.first_name = profile.profile.first_name
    req.session.profile = profile
    req.session.isloggedin = true

    // Upsert user in SQL Server
    console.log(profile);
    const firstName = profile.profile.first_name;
    const pictureUrl = profile.profile.raw_attributes?.picture || null;
    const pool = await getPool();
    const result = await pool.request()
      .input('guid', sql.NVarChar(255), profile.profile.email)
      .input('firstName', sql.NVarChar(100), firstName)
      .input('profilePicture', sql.NVarChar(255), pictureUrl)
      .query(`MERGE INTO Users WITH (HOLDLOCK) AS target
              USING (SELECT @guid AS Guid) AS source
              ON target.Guid = source.Guid
              WHEN MATCHED THEN
                UPDATE SET FirstName = @firstName, ProfilePicture = @profilePicture
              WHEN NOT MATCHED THEN
                INSERT (Guid, FirstName, ProfilePicture) VALUES (@guid, @firstName, @profilePicture)
              OUTPUT inserted.Id;`);
    req.session.userId = result.recordset[0].Id;
    req.session.isloggedin = result.recordset[0].Id > 0;

    res.redirect('/')
  } catch (error) {
    console.error(error);
    return res.redirect('/error?message=' + (error instanceof Error ? error.message : 'Unknown error'));
  }
})

router.get('/logout', async (req: Request, res: Response) => {
  try {
    req.session.userId = 0
    req.session.isloggedin = false

    return res.redirect('/')
  } catch (error) {
    return res.redirect('/error?message=' + (error instanceof Error ? error.message : 'Unknown error'));
  }
})

export default router