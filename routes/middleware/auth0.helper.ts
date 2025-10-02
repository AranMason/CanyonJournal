import { Request } from 'express';

export default {
    getDbUserId: (req: Request) => {
        return req.oidc.user?.[`${process.env.BASE_URL}/dbUserId`];
    }
}