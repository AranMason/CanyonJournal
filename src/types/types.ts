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
