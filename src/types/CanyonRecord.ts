export interface CanyonRecord {
    Id?: number;
    Name: string;
    Date: string;
    Url: string;
    TeamSize?: number;
    Comments?: string;
    CanyonId?: number;
    Timestamp?: string; // ISO string for when record was created
    RopeIds: number[];
    GearIds: number[];
    WaterLevel?: WaterLevel;
}

export enum WaterLevel {
    VeryLow = 1,
    Low = 2,
    Medium = 3,
    High = 4,
    VeryHigh = 5
}
