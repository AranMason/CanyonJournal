import { Request } from 'express';
import {} from '../../src/types/express-session';

export async function getUserIdByRequest(req: Request): Promise<number | undefined> {

    if (req.user?.dbUser?.Id) {
        
        return req.user.dbUser.Id;
    }

    return 0;
}
