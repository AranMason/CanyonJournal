import RegionType from './RegionEnum';
import { CanyonTypeEnum } from './CanyonTypeEnum';

export interface UserCanyon {
  Id: number;
  UserId?: number;
  Name: string;
  Url?: string;
  Region?: RegionType;
  CanyonType?: CanyonTypeEnum | null;
  AquaticRating: number;
  VerticalRating: number;
  CommitmentRating: number;
  StarRating: number;
  IsUnrated: boolean;
  Notes?: string;
  Created?: string;
  Updated?: string;
}

export interface UserCanyonWithDescents extends UserCanyon {
  Descents: number;
  LastDescentDate?: string | null;
}
