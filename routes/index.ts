import express, { Application, Request, Response, Router } from 'express'
import { ProfileAndToken, WorkOS } from '@workos-inc/node'
import path from 'path'

const app: Application = express()
const router: Router = express.Router()
const session: any = require('express-session')
interface Params {
  clientID: string;
  redirectURI: string;
  state?: string;
  provider?: string;
  connection?: string;
  organization?: string;
}

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
)

const workos: WorkOS = new WorkOS(process.env.WORKOS_API_KEY)
const clientID: string = process.env.WORKOS_CLIENT_ID !== undefined ? process.env.WORKOS_CLIENT_ID : ''
const organizationID: string = ''
const redirectURI: string = 'http://localhost:8000/callback'
const state: string = ''

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
    res.render('error.ejs', { error: error })
  }
})

router.get('/callback', async (req: Request, res: Response) => {
  try {
    const code: string = typeof req.query.code === 'string' ? req.query.code : ''

    const profile: ProfileAndToken = await workos.sso.getProfileAndToken({
      code,
      clientID,
    })

    session.first_name = profile.profile.first_name
    session.profile = profile
    session.isloggedin = true

    res.redirect('/')
  } catch (error) {
    return res.render('error.ejs', { error: error })
  }
})

router.get('/logout', async (req: Request, res: Response) => {
  try {
    session.first_name = null
    session.profile = null
    session.isloggedin = null

    return res.redirect('/')
  } catch (error) {
    return res.render('error.ejs', { error: error })
  }
})

export default router