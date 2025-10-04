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
export interface GearItem {
  Id: number;
  Name: string;
  Category: string;
  Notes?: string;
  Created: string;
  Updated: string;
}

export interface RopeItem {
  Id: number;
  Name: string;
  Diameter: number;
  Length: number;
  Unit: string;
  Notes?: string;
  Created: string;
  Updated: string;
}