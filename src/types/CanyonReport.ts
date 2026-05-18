import { ReportIssueType } from './ReportIssueType';
import { ReportStatus } from './ReportStatus';

export interface CanyonReport {
  Id: number;
  CanyonId: number;
  CanyonName: string;
  CanyonDetailUrl: string;
  UserId: number;
  ReporterName: string;
  IssueType: ReportIssueType;
  Description: string | null;
  Status: ReportStatus;
  AdminNotes: string | null;
  ReviewedAt: string | null;
  ReviewedByUserId: number | null;
  CreatedAt: string;
}
