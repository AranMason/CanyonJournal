import { Request } from 'express';

export function getDbUserId(req: Request): number | undefined {
    console.log('Request user:', req.oidc.user);
    return req.oidc.user?.[`${process.env.BASE_URL}dbUserId`];
}