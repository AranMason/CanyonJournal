interface CanyonRegionInfo {
    RegionId: number;
    RegionSlug: string;
    RegionSymbol: string;
}

interface CanyonSourceInfo {
    SourceId: number;
    SourceName: string;
    SourceLogoUrl?: string;
    SourceWebsiteUrl?: string;
}

interface CanyonDescentInfo {
    Descents: number;
    LastDescentDate?: string;
}

interface BaseCanyonData extends CanyonRegionInfo {
  Id: number;
  Name: string;
  Url: string;
  AquaticRating: number;
  VerticalRating: number;
  StarRating: number;
  CommitmentRating: number;
  IsVerified: boolean;
  IsUnrated: boolean;
  CanyonType: number;
  IsFavourite: boolean;
}

export interface CanyonData extends BaseCanyonData, CanyonRegionInfo, CanyonDescentInfo, CanyonSourceInfo {
}

export interface UserCanyonData extends BaseCanyonData, CanyonRegionInfo, CanyonDescentInfo, CanyonSourceInfo {
}