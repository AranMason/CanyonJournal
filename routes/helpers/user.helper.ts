import { Request } from 'express';
import {} from '../../src/types/express-session';

export async function getUserIdByRequest(req: Request): Promise<number | undefined> {
    return req.user?.dbUser?.Id ?? undefined;
}

export async function isAdmin(req: Request): Promise<boolean> {
    return req.user?.dbUser?.IsAdmin || false
}
