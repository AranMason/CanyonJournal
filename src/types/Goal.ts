import { Canyon } from './Canyon';
import { UserCanyon } from './UserCanyon';

export type CountMode = 'records' | 'days' | 'distinct_canyons' | 'distinct_regions' | 'all_in_region';

export type GoalRuleType =
  | 'canyon_type'
  | 'min_vertical'
  | 'min_aquatic'
  | 'min_commitment'
  | 'min_star'
  | 'tag'
  | 'first_time';

export interface GoalRule {
  Id?: number;
  RuleType: GoalRuleType;
  /** Single integer value: regionId / minRating / tagId / single canyon type */
  IntValue?: number | null;
  /** Comma-separated values for multi-value rules (canyon_type: "1,2,3") */
  IntValues?: string | null;
  /** false = trip must match; true = trip must NOT match */
  IsExclusion: boolean;
}

export interface Goal {
  Id?: number;
  Label: string;
  /** Target count. Null for 'all_in_region' where the target is dynamic. */
  MinCount?: number | null;
  CountMode: CountMode;
  /** Region scope — required for 'all_in_region', optional filter for other modes. */
  RegionId?: number | null;
  /** Filter rules — replaces MinVerticalRating/AquaticRating/CommitmentRating/RequiredTagIds */
  Rules: GoalRule[];
  /** Absolute start date (YYYY-MM-DD). Mutually exclusive with RollingDays. */
  StartDate?: string | null;
  /** Rolling time window in days (e.g. 365 = last year). Mutually exclusive with StartDate. */
  RollingDays?: number | null;
  CompletedAt?: string | null;
  SortOrder?: number;
  // Computed by API
  CurrentCount?: number;
  /** For 'all_in_region': total canyons in the region. For all other modes: equals MinCount. */
  TargetCount?: number | null;
}

/** Raw trip returned by GET /api/goals/:id/trips — trip fields only. */
export interface AuditTrip {
  Id: number;
  Date: string;
  CanyonId?: number | null;
  UserCanyonId?: number | null;
  TripRating?: number | null;
  WaterLevel?: number | null;
  TeamSize?: number | null;
  DetailUrl?: string | null;
}

/** AuditTrip enriched with canyon display fields from the frontend cache. */
export interface EnrichedAuditTrip extends AuditTrip {
  Name: string;
  VerticalRating?: number | null;
  AquaticRating?: number | null;
  CommitmentRating?: number | null;
  StarRating?: number | null;
  IsUnrated?: boolean | null;
  CanyonType?: number | null;
  RegionId?: number | null;
  RegionSlug?: string | null;
  RegionSymbol?: string | null;
}

/** Merges lean API trips with local canyon cache to produce enriched display data. */
export function enrichAuditTrips(
  trips: AuditTrip[],
  canyonsById: Record<number, Canyon>,
  userCanyonsById: Record<number, UserCanyon>
): EnrichedAuditTrip[] {
  return trips.map(trip => {
    const canyon = trip.CanyonId ? canyonsById[trip.CanyonId]
      : trip.UserCanyonId ? userCanyonsById[trip.UserCanyonId]
      : undefined;
    return {
      ...trip,
      Name: canyon?.Name ?? '',
      VerticalRating: canyon?.VerticalRating ?? null,
      AquaticRating: canyon?.AquaticRating ?? null,
      CommitmentRating: canyon?.CommitmentRating ?? null,
      StarRating: canyon?.StarRating ?? null,
      IsUnrated: canyon?.IsUnrated ?? null,
      CanyonType: canyon?.CanyonType ?? null,
      RegionId: canyon?.RegionId ?? null,
      RegionSlug: canyon?.RegionSlug ?? null,
      RegionSymbol: canyon?.RegionSymbol ?? null,
    };
  });
}