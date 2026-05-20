import { CanyonTypeEnum } from './CanyonTypeEnum';

export interface UserCanyon {
  Id: number;
  UserId?: number;
  Name: string;
  Url?: string;
  RegionId?: number | null;
  RegionSlug?: string | null;
  RegionSymbol?: string | null;
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
