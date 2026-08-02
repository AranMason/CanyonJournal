import { IBaseCanyon } from './Canyon';

export interface UserCanyon extends IBaseCanyon {
  Id: number;
  UserId?: number;
  Url?: string;
  Notes?: string;
  Created?: string;
  Updated?: string;
}

export interface UserCanyonWithDescents extends UserCanyon {
  Descents: number;
  LastDescentDate?: string | null;
}
