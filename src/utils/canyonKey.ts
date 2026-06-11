export const CANYON_KEY_PREFIX = 'Canyon-';
export const USERCANYON_KEY_PREFIX = 'UserCanyon-';

export function canyonKey(id: number): string {
    return `${CANYON_KEY_PREFIX}${id}`;
}

export function userCanyonKey(id: number): string {
    return `${USERCANYON_KEY_PREFIX}${id}`;
}

export function isCanyonKey(key?: string): boolean {
    return key?.startsWith(CANYON_KEY_PREFIX) ?? false;
}
export function isUserCanyonKey(key?: string): boolean {
    return key?.startsWith(USERCANYON_KEY_PREFIX) ?? false;
}   

export function parseCanyonKey(key: string): { canyonId?: number; userCanyonId?: number } {
    if (isUserCanyonKey(key)) {
        return { userCanyonId: parseInt(key.slice(USERCANYON_KEY_PREFIX.length), 10) };
    }
    if (isCanyonKey(key)) {
        return { canyonId: parseInt(key.slice(CANYON_KEY_PREFIX.length), 10) };
    }
    return {};
}
