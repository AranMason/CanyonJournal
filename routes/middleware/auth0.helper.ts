import { Request } from 'express';

export function getDbUserId(req: Request): number | undefined {
    return req.oidc.user?.[`${process.env.BASE_URL}/dbUserId`];
}