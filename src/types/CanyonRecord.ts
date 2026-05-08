import RegionType from './RegionEnum';

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
    Region?: RegionType;
    Timestamp?: string;
    RopeIds: number[];
    GearIds: number[];
    WaterLevel?: WaterLevel;
    TripRating?: number;
}

export enum WaterLevel {
    Unknown = 0,
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4,
    VeryHigh = 5
}
