/**
 * Normalises a URL for deduplication purposes.
 * - Lowercases the full URL
 * - Strips trailing slashes from the path
 * - Strips the `www.` subdomain prefix
 * Returns the original string unchanged if it is not a valid URL.
 */
export function normaliseUrl(url: string | undefined | null): string {
    if (!url) return '';
    try {
        const parsed = new URL(url.toLowerCase());
        parsed.hostname = parsed.hostname.replace(/^www\./, '');
        // Remove trailing slash from pathname
        parsed.pathname = parsed.pathname.replace(/\/+$/, '') || '/';
        return parsed.toString();
    } catch {
        return url.toLowerCase().replace(/\/+$/, '');
    }
}
