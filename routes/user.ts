import express, { Request, Response, Router } from 'express';
import { getUserIdByRequest } from './helpers/sql.helper';
import {} from '../src/types/express-session';

const router: Router = express.Router();


// Auth0: Get current user info from OIDC
router.get('/user', async (req: Request, res: Response) => {
  res.locals
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated with SSO' });
  }
  const user = req.oidc.user;
  if (!user || !user.email) {
    return res.status(401).json({ error: 'Not authenticated with Valid Credentials' });
  }

  req.session.userId = await getUserIdByRequest(req);
  console.log('Test', req.session.userId);
  req.session.save();

  res.json({
      id: await getUserIdByRequest(req),
      guid: user.email,
      first_name: user.given_name,
      picture_url: user.picture,
      email: user?.email,
      isloggedin: req.oidc.isAuthenticated()
    });
});

export default router