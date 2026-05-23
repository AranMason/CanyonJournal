import { Canyon } from './Canyon';
import { UserCanyon } from './UserCanyon';

export type CountMode = 'records' | 'days' | 'distinct_canyons' | 'all_canyons_in_region' | 'distinct_regions';

export interface Goal {
  Id?: number;
  Label: string;
  MinCount: number;
  MinVerticalRating?: number | null;
  MinAquaticRating?: number | null;
  MinCommitmentRating?: number | null;
  RequiredTagIds: number[];
  CountMode: CountMode;
  StartDate?: string | null;   // ISO date string (YYYY-MM-DD), null = all-time
  CompletedAt?: string | null; // ISO datetime string, null = active
  SortOrder?: number;
  // Computed by API
  CurrentCount?: number;
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
