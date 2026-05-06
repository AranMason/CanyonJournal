import express, { Request, Response, Router } from 'express';
import {} from '../src/types/express-session';

const router: Router = express.Router();


// Auth0: Get current user info from OIDC
router.get('/user', async (req: Request, res: Response) => {
  const user = req.user?.dbUser;
  if (!user) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  res.json({
    id: user.Id,
    first_name: user.FirstName,
    picture_url: user.ProfilePicture,
    isAdmin: user.IsAdmin || false
  });
});

export default router