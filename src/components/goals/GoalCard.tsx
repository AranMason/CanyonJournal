import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Collapse, DialogContent, DialogContentText, Divider, IconButton, Tooltip, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../utils/api';
import { AuditTrip, Goal, EnrichedAuditTrip, enrichAuditTrips } from '../../types/Goal';
import * as CanyonDataStore from '../../helpers/CanyonDataStore';
import * as UserCanyonDataStore from '../../helpers/UserCanyonDataStore';
import * as TagsDataStore from '../../helpers/TagsDataStore';
import * as GoalsDataStore from '../../helpers/GoalsDataStore';
import { Tag } from '../../helpers/TagsDataStore';
import GoalProgressBar from './GoalProgressBar';
import CanyonRating from '../canyons/CanyonRating';
import AppModal from '../AppModal';

const PREVIEW_COUNT = 5;

interface GoalCardProps {
  goal: Goal;
  regionNames: Record<number, string>;
  onTitleClick: () => void;
  onCompleted: () => Promise<void>;
  isCompleted?: boolean;
  isAlwaysCompletable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReopen?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  regionNames,
  onTitleClick,
  onCompleted,
  isCompleted = false,
  isAlwaysCompletable,
  onEdit,
  onDelete,
  onReopen,
}) => {
  const { t } = useTranslation();
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditTrips, setAuditTrips] = useState<EnrichedAuditTrip[] | undefined>();
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const previewTrips = auditTrips?.slice(0, PREVIEW_COUNT);
  const hasMore = (auditTrips?.length ?? 0) > PREVIEW_COUNT;
  const tagNames = (goal.Rules ?? [])
    .filter(rule => rule.RuleType === 'tag' && !rule.IsExclusion)
    .flatMap(rule => (rule.IntValues ?? '').split(',').map(Number).filter(id => !isNaN(id) && id > 0))
    .map(id => tags.find(tag => tag.Id === id)?.Name)
    .filter((name): name is string => Boolean(name));

  useEffect(() => {
    let cancelled = false;

    TagsDataStore.load()
      .then(loadedTags => {
        if (!cancelled) setTags(loadedTags);
      })
      .catch(() => {
        if (!cancelled) setTags([]);
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!auditOpen || auditTrips !== undefined) return;

    let cancelled = false;
    setAuditLoading(true);

    Promise.all([
      apiFetch<AuditTrip[]>(`/api/goals/${goal.Id}/trips`),
      CanyonDataStore.loadById(),
      UserCanyonDataStore.loadById(),
    ])
      .then(([trips, canyonsById, userCanyonsById]) => {
        if (!cancelled) setAuditTrips(enrichAuditTrips(trips, canyonsById, userCanyonsById));
      })
      .catch(() => {
        if (!cancelled) setAuditTrips([]);
      })
      .finally(() => {
        if (!cancelled) setAuditLoading(false);
      });

    return () => { cancelled = true; };
  }, [auditOpen, auditTrips, goal.Id]);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    try {
      await apiFetch(`/api/goals/${goal.Id}/complete`, { method: 'PATCH' });
      setConfirmCompleteOpen(false);
      GoalsDataStore.invalidate();
      await onCompleted();
    } catch {
      // The goal remains visible so the user can retry.
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" gap={0.5} data-test={`goal-entry-${goal.Id}`}>
        <Box flex={1} minWidth={0}>
          <GoalProgressBar
            requirement={goal}
            tagNames={tagNames}
            regionNames={regionNames}
            onMarkComplete={() => setConfirmCompleteOpen(true)}
            isCompleting={isCompleting}
            isAlwaysCompletable={isAlwaysCompletable}
            onTitleClick={onTitleClick}
          />
        </Box>

        <Box display="flex" gap={0.5} flexShrink={0}>
          <Tooltip title={t('goals.viewTrips')}>
            <IconButton size="small" onClick={() => setAuditOpen(prev => !prev)} sx={{ ml: 2 }} data-test={`goal-expand-${goal.Id}`}>
              {auditOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {isCompleted && onReopen && (
            <Tooltip title={t('goals.reopen')}>
              <IconButton size="small" onClick={onReopen} data-test={`goal-reopen-${goal.Id}`}>
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {!isCompleted && onEdit && (
            <Tooltip title={t('common:actions.edit')}>
              <IconButton size="small" onClick={onEdit} data-test={`goal-edit-${goal.Id}`}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title={t('common:actions.delete')}>
              <IconButton size="small" color="error" onClick={onDelete} data-test={`goal-delete-${goal.Id}`}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Collapse in={auditOpen} data-test={`goal-expand-${goal.Id}`}>
        <Divider sx={{ mt: 1, mb: 0.5 }} />
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {t('goals.matchingTrips')}
        </Typography>
        {auditLoading ? (
          <Box display="flex" justifyContent="center" py={1}><CircularProgress size={18} /></Box>
        ) : (previewTrips ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
            {t('goals.noMatchingTrips')}
          </Typography>
        ) : (
          <Box sx={{ mb: 0.5 }}>
            {previewTrips!.map((trip, index) => (
              <Box key={trip.Id}>
                {index > 0 && <Divider sx={{ my: 0.5 }} />}
                <Box display="flex" justifyContent="space-between" alignItems="center" py={0.5}>
                  <Box minWidth={0} flex={1}>
                    <Typography variant="body2" noWrap>
                      {trip.RegionSymbol ? `${trip.RegionSymbol} ` : ''}{trip.Name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(trip.Date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </Typography>
                  </Box>
                  <Box ml={1} flexShrink={0}>
                    <Typography variant="caption" color="text.secondary">
                      <CanyonRating
                        verticalRating={trip.VerticalRating ?? undefined}
                        aquaticRating={trip.AquaticRating ?? undefined}
                        commitmentRating={trip.CommitmentRating ?? undefined}
                        starRating={trip.StarRating ?? undefined}
                        isUnrated={trip.IsUnrated ?? undefined}
                      />
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
            {hasMore && (
              <Button
                size="small"
                variant="text"
                onClick={onTitleClick}
                sx={{ p: 0, mt: 0.5, typography: 'caption', minWidth: 0, textTransform: 'none' }}
              >
                {t('goals.viewAllTrips', { count: auditTrips!.length })}
              </Button>
            )}
          </Box>
        )}
      </Collapse>

      <AppModal
        open={confirmCompleteOpen}
        onClose={() => !isCompleting && setConfirmCompleteOpen(false)}
        title={t('goals.markCompleteConfirmTitle')}
        maxWidth="xs"
        disableClose={isCompleting}
        actions={
          <>
            <Button onClick={() => setConfirmCompleteOpen(false)} disabled={isCompleting}>{t('common:actions.cancel')}</Button>
            <Button variant="contained" color="success" onClick={handleMarkComplete} disabled={isCompleting}>
              {t('goals.markComplete')}
            </Button>
          </>
        }
      >
        <DialogContent>
          <DialogContentText>
            {t('goals.markCompleteConfirmMessage', { label: goal.Label })}
          </DialogContentText>
        </DialogContent>
      </AppModal>
    </>
  );
};

export default GoalCard;