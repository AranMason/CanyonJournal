export interface CanyonRecord {
  name: string;
  date: string;
  url: string;
  teamSize: number;
  comments?: string;
  timestamp?: string; // ISO string for when record was created
}
