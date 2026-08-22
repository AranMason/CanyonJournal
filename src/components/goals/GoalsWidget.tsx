import React, { useEffect, useState } from 'react';
import {
  Box, CircularProgress, Divider, Paper, Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Goal } from '../../types/Goal';
import GoalCard from './GoalCard';
import * as GoalsDataStore from '../../helpers/GoalsDataStore';
import * as RegionDataStore from '../../helpers/RegionDataStore';
import { Region } from '../../types/Region';
import { useTranslation } from 'react-i18next';

const GoalsWidget: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [flatRegions, setFlatRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadGoals = () =>
    Promise.all([GoalsDataStore.load(), RegionDataStore.load()])
      .then(([gs, regions]) => { setGoals(gs); setFlatRegions(regions); })
      .catch(() => { })
      .finally(() => setIsLoading(false));

  useEffect(() => { loadGoals(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const regionNames: Record<number, string> = Object.fromEntries(
    flatRegions.map(r => [r.Id, r.Name])
  );

  if (isLoading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
  if (goals.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{t('goals.progress')}</Typography>
      <Paper sx={{
        borderLeft: 2,
        borderColor: 'secondary.main',
        borderRadius: 1, px: 2, pt: 2, pb: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        {goals.map((goal, i) => {
          return (
            <React.Fragment key={goal.Id}>
              {i > 0 && <Divider />}
              <GoalCard
                goal={goal}
                regionNames={regionNames}
                onTitleClick={() => navigate(`/journal/goals/${goal.Id}`)}
                onCompleted={async () => {
                  setIsLoading(true);
                  await loadGoals();
                }}
              />
            </React.Fragment>
          );
        })}
      </Paper>

    </Box >
  );
};

export default GoalsWidget;