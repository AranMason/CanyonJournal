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

export enum ServiceType {
  Other = 0,
  Service = 1,
  Inspection = 2
}

export interface GearServiceHistoryItem {
  Id: number;
  GearId: number;
  ServiceType: ServiceType;
  ServiceDate: string;
  Notes?: string;
}

export interface RopeServiceHistoryItem {
  Id: number;
  RopeId: number;
  ServiceType: ServiceType;
  ServiceDate: string;
  Notes?: string;
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
  WeightGrams?: number;
  Notes?: string;
  Created: string;
  Updated: string;
}

export interface GearItem extends BaseItem {
  Category: string;
  LastInspectionDate?: string;
  LastServiceDate?: string;
}

export interface RopeItem extends BaseItem {
  Diameter?: number;
  Length?: number;
  Unit: string;
  ParentRopeItemsId?: number;
}