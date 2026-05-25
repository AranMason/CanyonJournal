import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Divider, Typography } from '@mui/material';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { Goal, AuditTrip, EnrichedAuditTrip, enrichAuditTrips } from '../types/Goal';
import GoalProgressBar from '../components/GoalProgressBar';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import FilterPanel, { FilterConfig, FilterValues } from '../components/FilterPanel';
import { CanyonRecord } from '../types/CanyonRecord';
import { Canyon } from '../types/Canyon';
import { UserCanyon } from '../types/UserCanyon';
import * as CanyonDataStore from '../helpers/CanyonDataStore';
import * as UserCanyonDataStore from '../helpers/UserCanyonDataStore';
import * as TagsDataStore from '../helpers/TagsDataStore';
import * as RegionDataStore from '../helpers/RegionDataStore';
import { Tag } from '../helpers/TagsDataStore';
import { Region } from '../types/Region';
import { getCanyonNameFilterConfig, getRegionFilterConfig } from '../helpers/filterConfigs';
import { useTranslation } from 'react-i18next';

const GoalTripsPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [trips, setTrips] = useState<EnrichedAuditTrip[]>([]);
  const [canyonsById, setCanyonsById] = useState<Record<number, Canyon>>({});
  const [userCanyonsById, setUserCanyonsById] = useState<Record<number, UserCanyon>>({});
  const [tags, setTags] = useState<Tag[]>([]);
  const [flatRegions, setFlatRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!goalId) return;
    Promise.all([
      apiFetch<Goal>(`/api/goals/${goalId}`),
      apiFetch<AuditTrip[]>(`/api/goals/${goalId}/trips`),
      CanyonDataStore.loadById(),
      UserCanyonDataStore.loadById(),
      TagsDataStore.load(),
      RegionDataStore.load(),
    ])
      .then(([g, ts, cByid, ucById, tgs, regions]) => {
        setGoal(g);
        setTrips(enrichAuditTrips(ts, cByid, ucById));
        setCanyonsById(cByid);
        setUserCanyonsById(ucById);
        setTags(tgs);
        setFlatRegions(regions);
      })
      .catch(() => navigate('/journal'))
      .finally(() => setIsLoading(false));
  }, [goalId]); // eslint-disable-line react-hooks/exhaustive-deps

  const goalTagNames = useMemo((): string[] => {
    if (!goal) return [];
    return (goal.Rules ?? [])
      .filter(r => r.RuleType === 'tag' && !r.IsExclusion)
      .flatMap(r => (r.IntValues ?? '').split(',').map(Number).filter(n => !isNaN(n) && n > 0))
      .map(id => tags.find(tg => tg.Id === id)?.Name)
      .filter((n): n is string => Boolean(n));
  }, [goal, tags]);

  const goalRegionNames = useMemo((): Record<number, string> => {
    if (!goal?.RegionId) return {};
    const region = flatRegions.find(r => r.Id === goal.RegionId);
    return region ? { [region.Id]: region.Name } : {};
  }, [goal, flatRegions]);

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
  });

  const getCanyonForTrip = (trip: EnrichedAuditTrip): Canyon | UserCanyon | undefined => {
    if (trip.CanyonId) return canyonsById[trip.CanyonId];
    if (trip.UserCanyonId) return userCanyonsById[trip.UserCanyonId];
    return undefined;
  };

  return (
    <PageTemplate pageTitle={goal?.Label ?? t('goals.progress')} isAuthRequired isLoading={isLoading}>
      {goal && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 2, py: 2 }}>
            <GoalProgressBar requirement={goal} tagNames={goalTagNames} regionNames={goalRegionNames} />
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

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
    </PageTemplate>
  );
};

export default GoalTripsPage;
