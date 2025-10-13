import { CanyonTypeEnum } from "./CanyonTypeEnum";
import RegionType from "./RegionEnum";

export interface Canyon {
  Id: number;
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
