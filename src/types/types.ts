export enum Unit {
  Metres = 'Metres',
  Feet = 'Feet',
}
export interface User {
  first_name: string;
  picture_url?: string;
  id: Number,
  isAdmin: boolean;
}

export interface BaseItem {
  Id: number;
  Name: string;
  IsRetired: boolean;
  Manufacturer?: string;
  ManufactureDate?: string;
  InServiceDate?: string;
  RetirementDate?: string;
  SerialNumber?: string;
  Model?: string;
  LastInspectionDate?: string;
  LastServicedDate?: string;
  WeightGrams?: number;
  Notes?: string;
  Created: string;
  Updated: string;
}

export interface GearItem extends BaseItem {
  Category: string;
}

export interface RopeItem extends BaseItem {
  Diameter?: number;
  Length?: number;
  Unit: string;
  ParentRopeItemsId?: number;
}