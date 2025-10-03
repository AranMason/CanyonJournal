import express, { Request, Response, Router } from 'express';
import { getUserIdByRequest } from './helpers/sql.helper';
import {} from '../src/types/express-session';

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

  const userId = await getUserIdByRequest(req);

  res.json({
    id: userId,
    guid: user.email,
    first_name: user.given_name,
    picture_url: user.picture,
    email: user.email,
    isloggedin: req.oidc.isAuthenticated()
  });
});

export default router