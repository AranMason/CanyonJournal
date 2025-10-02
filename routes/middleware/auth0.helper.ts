import { Request } from 'express';

export function getDbUserId(req: Request): number | undefined {
    console.log('Request user:', req.oidc.user);
    // Construct custom claim URL using URL constructor
    const baseUrl = process.env.BASE_URL || 'http://localhost:8000/';
    const claimUrl = new URL('dbUserId', baseUrl).toString();
    return req.oidc.user?.[claimUrl];
}