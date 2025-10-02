
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();


// Auth0: Get current user info from OIDC
router.get('/user', async (req: Request, res: Response) => {
  if (!req.oidc || !req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated with SSO' });
  }
  const user = req.oidc.user;
  console.log('OIDC user:', user, req.session.dbUser);
  if (!user || !user.email) {
    return res.status(401).json({ error: 'Not authenticated with Valid Credentials' });
  }

  res.json({
      id: req.session.dbUser?.Id,
      guid: req.session.dbUser?.Guid,
      first_name: req.session.dbUser?.FirstName,
      picture_url: req.session.dbUser?.ProfilePicture,
      email: user.email,
      isloggedin: true
    });

});

export default router