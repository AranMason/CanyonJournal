import { Region } from "../types/Region";
import i18n from "../i18n";

/**
 * Returns the display string for a region using the slug (looked up via i18n) and symbol.
 * @param regionSlug  Region slug key (e.g. "scotland") — resolved via the 'regions' i18n namespace
 * @param regionSymbol  Emoji flag (e.g. "🏴󠁧󠁢󠁳󠁣󠁴󠁿")
 * @param isShort  If true, returns only the symbol
 */
export function GetRegionDisplayNameByRegion(region: Region | null): React.ReactNode {
    return GetRegionDisplayName(region?.Slug ?? '');
}

export function GetRegionDisplayName(regionSlug?: string | null): React.ReactNode {

    if(!regionSlug) return i18n.t('regions:unknown', { defaultValue: 'Unknown' });

    let name = i18n.t(`regions:${regionSlug}`, { defaultValue: regionSlug, returnObjects: false });

    if(name === regionSlug) {
        // If the region slug is not found in the 'regions' namespace, try the 'regions-legacy' namespace for backward compatibility
        name = i18n.t(`regions-legacy:${regionSlug}`, { defaultValue: regionSlug })
    }

    return name || i18n.t('regions:unknown', { defaultValue: 'Unknown' });
}