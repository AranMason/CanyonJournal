
export interface CanyonRecord {
    Id?: number;
    /** Read-only — returned by API via JOIN from Canyon or UserCanyon */
    Name?: string;
    Date: string;
    /** Read-only — returned by API via JOIN from Canyon or UserCanyon */
    Url?: string;
    /** Read-only — internal app route to the canyon detail page */
    DetailUrl?: string | null;
    TeamSize?: number;
    Comments?: string;
    CanyonId?: number;
    UserCanyonId?: number;
    /** Read-only — returned by API via JOIN from Canyon or UserCanyon */
    RegionId?: number | null;
    /** Read-only — region slug, resolved to display name via i18n 'regions' namespace */
    RegionSlug?: string | null;
    Timestamp?: string;
    RopeIds: number[];
    GearIds: number[];
    WaterLevel?: WaterLevel;
    TripRating?: number;
    /** Tags attached to this trip record */
    Tags?: { Id: number; Name: string }[];
}

export enum WaterLevel {
    Unknown = 0,
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4,
    VeryHigh = 5
}
