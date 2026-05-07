export function canyonKey(id: number): string {
    return `Canyon-${id}`;
}

export function userCanyonKey(id: number): string {
    return `UserCanyon-${id}`;
}

export function parseCanyonKey(key: string): { canyonId?: number; userCanyonId?: number } {
    if (key.startsWith('UserCanyon-')) {
        return { userCanyonId: parseInt(key.slice('UserCanyon-'.length), 10) };
    }
    if (key.startsWith('Canyon-')) {
        return { canyonId: parseInt(key.slice('Canyon-'.length), 10) };
    }
    return {};
}
