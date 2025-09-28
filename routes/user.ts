
import express, { Application, Request, Response, Router } from 'express'
import { ProfileAndToken, WorkOS } from '@workos-inc/node'
import type {} from '../src/types/express-session'

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
const redirectURI: string = 'http://localhost:3000/api/callback'
const state: string = ''

// Route to get the current user's data if logged in
router.get('/user', (req: Request, res: Response) => {
  if (req.session.isloggedin && req.session.profile) {
    const profile = req.session.profile.profile;
    res.json({
      first_name: req.session.first_name,
      profile,
      picture_url: profile.raw_attributes.picture_url,
      isloggedin: true
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
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

    res.redirect('/')
  } catch (error) {
    return res.redirect('/error?message=' + (error instanceof Error ? error.message : 'Unknown error'));
  }
})

router.get('/logout', async (req: Request, res: Response) => {
  try {
    req.session.first_name = null
    req.session.profile = null
    req.session.isloggedin = false

    return res.redirect('/')
  } catch (error) {
    return res.redirect('/error?message=' + (error instanceof Error ? error.message : 'Unknown error'));
  }
})

export default router