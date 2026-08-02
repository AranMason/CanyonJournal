import { CanyonTypeEnum } from "./CanyonTypeEnum";

export interface CanyonSource {
  Id: number;
  DisplayName: string;
  LogoUrl?: string | null;
  WebsiteUrl?: string | null;
}

export interface IBaseCanyon {
  Name: string;
  CanyonType: CanyonTypeEnum | null;

  // Rating Info
  AquaticRating: number;
  VerticalRating: number;
  CommitmentRating: number;
  StarRating: number;
  IsUnrated: boolean;
  // Region Info
  RegionId?: number | null;
  RegionSlug?: string | null;
  RegionSymbol?: string | null;
}

export interface Canyon extends IBaseCanyon {
  Id: number | null;
  Url: string;
  CanyonType: CanyonTypeEnum;
  IsDeleted: boolean;
  IsVerified: boolean;
  SourceId?: number | null;
  SourceName?: string | null;
  SourceLogoUrl?: string | null;
  SourceWebsiteUrl?: string | null;
}

export interface CanyonWithDescents extends Canyon {
  Descents: number;
  LastDescentDate?: string | null;
}

export interface CanyonListEntry extends IBaseCanyon {
  Key: string;
  DetailUrl: string;
  Url: string;
  IsVerified: boolean;
  CanyonType: CanyonTypeEnum | null;
  Descents: number;
  LastDescentDate?: string | null;
  IsFavourite?: boolean;
  SourceId?: number | null;
  SourceName?: string | null;
  SourceLogoUrl?: string | null;
  SourceWebsiteUrl?: string | null;
}
