import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { Goal } from '../types/Goal';
import GoalProgressBar from '../components/goals/GoalProgressBar';
import * as TagsDataStore from '../helpers/TagsDataStore';
import * as RegionDataStore from '../helpers/RegionDataStore';
import { Tag } from '../helpers/TagsDataStore';
import { Region } from '../types/Region';
import { useTranslation } from 'react-i18next';
import GoalCanyonsTab from '../components/goals/GoalCanyonsTab';
import GoalTripsTab from '../components/goals/GoalTripsTab';

const GoalTripsPage: React.FC = () => {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState(0);

  const [goal, setGoal] = useState<Goal | null>(null);

  const [tags, setTags] = useState<Tag[]>([]);
  const [flatRegions, setFlatRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!goalId) return;
    Promise.all([
      apiFetch<Goal>(`/api/goals/${goalId}`),
      TagsDataStore.load(),
      RegionDataStore.load(),
    ])
      .then(([g, tgs, regions]) => {
        setGoal(g);
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

  

  return (
    <PageTemplate pageTitle={goal?.Label ?? t('goals.progress')} isAuthRequired isLoading={isLoading}>
      {goal && (
        <>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 2, py: 2 }}>
              <GoalProgressBar requirement={goal} tagNames={goalTagNames} regionNames={goalRegionNames} />
            </Box>
          </Box>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
            <Tab label={t('goals.trips')} />
            <Tab label={t('goals.canyons')} disabled={!(goal.RegionId != null || goal.Rules.some(r => r.RuleType === 'first_time'))} />
          </Tabs>
          {activeTab === 0 && <GoalTripsTab goal={goal} />}
          {activeTab === 1 && <GoalCanyonsTab goal={goal} />}
        </>
      )}

    </PageTemplate>
  )


};

export default GoalTripsPage;
