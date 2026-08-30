import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, CircularProgress, DialogContent, FormControlLabel, Paper, Switch, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { Goal } from '../../types/Goal';
import * as GoalsDataStore from '../../helpers/GoalsDataStore';
import GoalCard from '../goals/GoalCard';
import { useTranslation } from 'react-i18next';
import * as TagsDataStore from '../../helpers/TagsDataStore';
import * as RegionDataStore from '../../helpers/RegionDataStore';
import { Tag } from '../../helpers/TagsDataStore';
import { Region } from '../../types/Region';
import AppModal from '../AppModal';
import GoalEditorModal, { GoalEditorPayload } from './GoalEditorModal';
import EmptyCellCta from '../EmptyCellCta';

const GoalSettings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [flatRegions, setFlatRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const goalProgressPercentage = (goal: Goal): number => {
    const target = goal.TargetCount ?? goal.MinCount ?? 0;
    return target > 0 ? Math.min(((goal.CurrentCount ?? 0) / target) * 100, 100) : 0;
  };

  const sortGoals = (goal_a: Goal, goal_b: Goal): number => {
    var delta = goalProgressPercentage(goal_b) - goalProgressPercentage(goal_a);

    if (delta === 0) {
      delta = goal_a.Id! - goal_b.Id!;
    }
    return delta;
  }

  const loadGoals = async () => {
    const [completed, tgs, regions] = await Promise.all([
      GoalsDataStore.load(true),
      TagsDataStore.load(),
      RegionDataStore.load(),
    ]);
    setActiveGoals(completed.sort(sortGoals));
    setTags(tgs);
    setFlatRegions(regions);
  };

  useEffect(() => {
    setIsLoading(true);
    loadGoals().finally(() => setIsLoading(false));
  }, []);

  const openAdd = () => {
    setEditingGoal(null);
    setDialogOpen(true);
  };

  const openEdit = (req: Goal) => {
    setEditingGoal(req);
    setDialogOpen(true);
  };

  const handleSave = async (payload: GoalEditorPayload) => {
    if (editingGoal?.Id != null) {
      await apiFetch(`/api/goals/${editingGoal.Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await apiFetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    GoalsDataStore.invalidate();
    await loadGoals();
  };

  const handleReopen = async (req: Goal) => {
    try {
      await apiFetch(`/api/goals/${req.Id}/reopen`, { method: 'PATCH' });
      GoalsDataStore.invalidate();
      await loadGoals();
    } catch (err: any) {
      alert(err.message || t('goals.errors.reopenFailed'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.Id) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/goals/${deleteTarget.Id}`, { method: 'DELETE' });
      GoalsDataStore.invalidate();
      await loadGoals();
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || t('goals.errors.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const goalRegionNames = useMemo((): Record<number, string> => {
    const map: Record<number, string> = {};
    flatRegions.forEach(r => { map[r.Id] = r.Name; });
    return map;
  }, [flatRegions]);

  const goalsToDiplay = useMemo(() => {
    if (!showCompleted) {
      return activeGoals.filter(s => !s.CompletedAt)
    }
    return activeGoals;
  }, [activeGoals, showCompleted])


  if (isLoading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('goals.descriptionText')}
      </Typography>



      <Box display="flex" gap={2} alignItems="center" justifyContent={'space-between'} flexWrap="wrap" mb={2}>
        <Button variant="contained" color='primary' startIcon={<AddIcon />} onClick={openAdd} data-test={`goal-add`}>
          {t('goals.addRequirement')}
        </Button>
        <FormControlLabel
          control={
            <Switch title={t('goals.showCompleted')} value={!showCompleted} onClick={() => setShowCompleted(v => !v)} data-test={`goal-switch-include-completed`} />
          }
          labelPlacement="start"
          label={t('goals.showCompleted')}
          sx={{ m: 0, whiteSpace: 'nowrap' }}
        />

      </Box>

      <Paper sx={{
        borderLeft: 2,
        borderColor: 'secondary.main',
        borderRadius: 1, px: 2, pt: 2, pb: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        mb: 2
      }}>
        {goalsToDiplay.length > 0 ? goalsToDiplay.map(req => {
          const isCompleted = !!req.CompletedAt;

          return <GoalCard
            goal={req}
            regionNames={goalRegionNames}
            isCompleted={isCompleted}
            isAlwaysCompletable={!isCompleted}
            onTitleClick={() => navigate(`/journal/goals/${req.Id}`)}
            onCompleted={loadGoals}
            onEdit={() => openEdit(req)}
            onDelete={() => setDeleteTarget(req)}
            onReopen={isCompleted ? () => handleReopen(req) : undefined}
          />
        }) :
          <EmptyCellCta description={t('goals.noRequirements')} cta={t('goals.addRequirement')} ctaIcon={<AddIcon />} ctaAction={() => openAdd()} />
        }
      </Paper>

      <GoalEditorModal
        open={dialogOpen}
        goal={editingGoal}
        tags={tags}
        onClose={() => {
          setDialogOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSave}
      />

      {/* Delete confirmation */}
      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        title={t('goals.deleteRequirement')}
        maxWidth="xs"
        disableClose={isDeleting}
        actions={
          <>
            <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>{t('common:actions.cancel')}</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
              {isDeleting ? t('settings.deleting') : t('common:actions.delete')}
            </Button>
          </>
        }
      >
        <DialogContent>
          <Typography>{t('goals.deleteConfirm')}</Typography>
        </DialogContent>
      </AppModal>

    </>
  );
};

export default GoalSettings;
