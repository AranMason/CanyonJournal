/**
 * Normalises a URL for deduplication purposes.
 * - Lowercases the full URL
 * - Strips trailing slashes from the path
 * - Strips the `www.` subdomain prefix
 * Returns the original string lowercased and trimmed if it is not a valid URL.
 */
export function normaliseUrl(url: string | undefined | null): string {
    if (!url) return '';
    try {
        const parsed = new URL(url.toLowerCase());
        parsed.hostname = parsed.hostname.replace(/^www\./, '');
        parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
        return parsed.toString();
    } catch {
        return url.toLowerCase().replace(/\/+$/, '');
    }
}

/**
 * Returns the internal app detail URL for a canyon record.
 * - Verified canyon  → /canyons/:id
 * - User canyon      → /canyons/users/:id
 * - Neither          → null
 */
export function canyonDetailUrl(canyonId?: number | null, userCanyonId?: number | null): string | null {
    if (canyonId) return `/canyons/${canyonId}`;
    if (userCanyonId) return `/canyons/users/${userCanyonId}`;
    return null;
}
