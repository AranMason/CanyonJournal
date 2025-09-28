export interface CanyonRecord {
  Id?: number;
  Name: string;
  Date: string;
  Url: string;
  TeamSize?: number;
  Comments?: string;
  CanyonId?: number;
  Timestamp?: string; // ISO string for when record was created
  RopeIds: number[];
  GearIds: number[];
}
