import { CanyonTypeEnum } from "./CanyonTypeEnum";

export interface CanyonSource {
  Id: number;
  DisplayName: string;
  LogoUrl?: string | null;
  WebsiteUrl?: string | null;
}

export interface Canyon {
  Id: number | null;
  Name: string;
  Url: string;
  AquaticRating: number;
  VerticalRating: number;
  CommitmentRating: number;
  StarRating: number;
  IsUnrated: boolean;
  CanyonType: CanyonTypeEnum;
  IsDeleted: boolean;
  IsVerified: boolean;
  RegionId?: number | null;
  RegionSlug?: string | null;
  RegionSymbol?: string | null;
  SourceId?: number | null;
  SourceName?: string | null;
  SourceLogoUrl?: string | null;
  SourceWebsiteUrl?: string | null;
}

export interface CanyonWithDescents extends Canyon {
  Descents: number;
  LastDescentDate?: string | null;
}

export interface CanyonListEntry {
  Key: string;
  DetailUrl: string;
  Name: string;
  Url: string;
  RegionId?: number | null;
  RegionSlug?: string | null;
  RegionSymbol?: string | null;
  AquaticRating: number;
  VerticalRating: number;
  CommitmentRating: number;
  StarRating: number;
  IsUnrated: boolean;
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
