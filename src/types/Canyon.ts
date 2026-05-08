import { CanyonTypeEnum } from "./CanyonTypeEnum";
import RegionType from "./RegionEnum";

export interface Canyon {
  Id: number | null;
  Name: string;
  Url: string;
  AquaticRating: number;
  VerticalRating: number;
  CommitmentRating: number;
  StarRating: number;
  IsUnrated: boolean;
  Region: RegionType;
  CanyonType: CanyonTypeEnum;
  IsDeleted: boolean;
  IsVerified: boolean;
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
  Region: RegionType;
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
}
