import { Typography } from "@mui/material"
import { AuditTrip, enrichAuditTrips, EnrichedAuditTrip, Goal } from "../../types/Goal"
import FilterPanel, { FilterConfig, FilterValues } from "../FilterPanel"
import CanyonRecordAccordion from "../CanyonRecordAccordion/CanyonRecordAccordion"
import { Canyon } from "../../types/Canyon"
import { useCallback, useEffect, useMemo, useState } from "react"
import * as RegionDataStore from "../../helpers/RegionDataStore"
import { UserCanyon } from "../../types/UserCanyon"
import { CanyonRecord } from "../../types/CanyonRecord"
import { getCanyonNameFilterConfig, getRegionFilterConfig } from "../../helpers/filterConfigs"
import { apiFetch } from "../../utils/api"
import * as CanyonDataStore from "../../helpers/CanyonDataStore"
import * as UserCanyonDataStore from "../../helpers/UserCanyonDataStore"
import { Region } from "../../types/Region"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Loader from "../Loader"

const GoalTripsTab: React.FC<{ goal: Goal | null}> = ({ goal }) => {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<EnrichedAuditTrip[]>([]);
  const [canyonsById, setCanyonsById] = useState<Record<number, Canyon>>({});
  const [userCanyonsById, setUserCanyonsById] = useState<Record<number, UserCanyon>>({});
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  const [flatRegions, setFlatRegions] = useState<Region[]>([]);

  useEffect(() => {
    if (!goal) return;
    Promise.all([
      apiFetch<AuditTrip[]>(`/api/goals/${goal.Id}/trips`),
      CanyonDataStore.loadById(),
      UserCanyonDataStore.loadById(),
      RegionDataStore.load(),
    ])
      .then(([ts, cByid, ucById, regions]) => {
        setTrips(enrichAuditTrips(ts, cByid, ucById));
        setCanyonsById(cByid);
        setUserCanyonsById(ucById);
        setFlatRegions(regions);
      })
      .catch(() => navigate('/journal'))
      .finally(() => setIsLoading(false));
  }, [goal?.Id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toRecord = (trip: EnrichedAuditTrip): CanyonRecord => ({
    Id: trip.Id,
    Date: trip.Date,
    Name: trip.Name,
    TripRating: trip.TripRating ?? undefined,
    WaterLevel: trip.WaterLevel ?? undefined,
    TeamSize: trip.TeamSize ?? undefined,
    CanyonId: trip.CanyonId ?? undefined,
    UserCanyonId: trip.UserCanyonId ?? undefined,
    RegionSlug: trip.RegionSlug ?? undefined,
    RegionSymbol: trip.RegionSymbol ?? undefined,
    DetailUrl: trip.DetailUrl ?? null,
    RopeIds: [],
    GearIds: [],
    Comments: trip.Comments ?? undefined,
  });



  const usedRegionIds = useMemo(
    () => [...new Set(trips.map(t => t.RegionId).filter((id): id is number => id != null))],
    [trips]
  );

  const years = useMemo(() => {
    const ys = new Set(trips.map(trip => new Date(trip.Date).getFullYear()));
    return Array.from(ys).sort((a, b) => b - a);
  }, [trips]);

  const filterConfig = useMemo((): FilterConfig[] => [
    getCanyonNameFilterConfig(),
    getRegionFilterConfig('region', usedRegionIds),
    ...(years.length > 1 ? [{
      type: 'single-select' as const,
      key: 'year',
      label: t('goals.allTime'),
      labelId: 'year-filter',
      placeholder: t('goals.allTime'),
      options: years.map(y => ({ value: y, label: String(y) })),
    }] : []),
  ], [usedRegionIds, years, t]);

  const filterFn = useCallback((trip: EnrichedAuditTrip, values: FilterValues): boolean => {
    const nf = (values.name as string).trim().toLowerCase();
    if (nf && !trip.Name.toLowerCase().includes(nf)) return false;

    if (values.region != null) {
      if (trip.RegionId == null) return false;
      const ids = RegionDataStore.getDescendantIds(values.region as number, flatRegions);
      if (!ids.includes(trip.RegionId)) return false;
    }

    if (values.year && new Date(trip.Date).getFullYear() !== Number(values.year)) return false;

    return true;
  }, [flatRegions]);

  const getCanyonForTrip = (trip: EnrichedAuditTrip): Canyon | UserCanyon | undefined => {
    if (trip.CanyonId) return canyonsById[trip.CanyonId];
    if (trip.UserCanyonId) return userCanyonsById[trip.UserCanyonId];
    return undefined;
  };


  return <Loader isLoading={isLoading}>
    <FilterPanel<EnrichedAuditTrip>
      items={trips}
      config={filterConfig}
      filterFn={filterFn}
    >
      {(filteredTrips) => (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('goals.matchingTrips')}
            {' '}({filteredTrips.length}{filteredTrips.length !== trips.length ? ` / ${trips.length}` : ''})
          </Typography>
          {filteredTrips.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{t('goals.noMatchingTrips')}</Typography>
          ) : filteredTrips.map(trip => (
            <CanyonRecordAccordion
              key={trip.Id}
              record={toRecord(trip)}
              canyon={getCanyonForTrip(trip)}
              isOpen={sectionOpen === trip.Id}
              onChange={() => setSectionOpen(prev => prev === trip.Id ? null : trip.Id)}
            />
          ))}
        </>
      )}
    </FilterPanel>
  </Loader>
}

export default GoalTripsTab