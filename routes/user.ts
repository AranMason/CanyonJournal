import express, { Request, Response, Router } from 'express';
import {} from '../src/types/express-session';

const router: Router = express.Router();


// Auth0: Get current user info from OIDC
router.get('/user', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/api/login');
  }

  const user = req.user.dbUser;
  if (!user) {
    return res.redirect('/api/login');
  }

  res.json({
    id: user.Id,
    first_name: user.FirstName,
    picture_url: user.ProfilePicture,
    isloggedin: req.isAuthenticated(),
    isAdmin: user.IsAdmin || false
  });
});

export default router