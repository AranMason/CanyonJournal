export enum Unit {
  Metres = 'Metres',
  Feet = 'Feet',
}
export interface User {
  first_name: string;
  profile: {
    raw_attributes: {
        picture?: string;
    }
  }
}
export interface GearItem {
  id: number;
  name: string;
  category: string;
  notes?: string;
  created: string;
  updated: string;
}

export interface RopeItem {
  id: number;
  name: string;
  diameter: string;
  length: string;
  unit: string;
  notes?: string;
  created: string;
  updated: string;
}