import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, CircularProgress, DialogContent, Typography,
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

const SettingsGoalsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
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
    setActiveGoals(completed.filter(g => !g.CompletedAt).sort(sortGoals));
    setCompletedGoals(completed.filter(g => g.CompletedAt));
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

  const renderGoalCard = (req: Goal, isCompleted = false) => (
    <Box
      key={req.Id}
      sx={{
        border: '1px solid', borderColor: 'divider', borderRadius: 1,
        px: 2, pt: 2, pb: 1, mb: 2,
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <GoalCard
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
    </Box>
  );

  if (isLoading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('goals.descriptionText')}
      </Typography>

      {activeGoals.length === 0 && !showCompleted && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('goals.noRequirements')}
        </Typography>
      )}

      {activeGoals.map(req => renderGoalCard(req, false))}

      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <Button variant="outlined" startIcon={<AddIcon />} onClick={openAdd}>
          {t('goals.addRequirement')}
        </Button>
        {completedGoals.length > 0 && (
          <Button size="small" variant="text" onClick={() => setShowCompleted(v => !v)}>
            {showCompleted ? t('goals.hideCompleted') : `${t('goals.showCompleted')} (${completedGoals.length})`}
          </Button>
        )}
      </Box>

      {showCompleted && completedGoals.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {t('goals.completedGoals')}
          </Typography>
          {completedGoals.map(req => renderGoalCard(req, true))}
        </Box>
      )}

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

export default SettingsGoalsTab;
