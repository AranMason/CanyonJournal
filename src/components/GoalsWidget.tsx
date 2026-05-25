import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Collapse, DialogContent,
  DialogContentText, Divider, IconButton, Tooltip, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import { Goal, AuditTrip, EnrichedAuditTrip, enrichAuditTrips } from '../types/Goal';
import GoalProgressBar from './GoalProgressBar';
import CanyonRating from './CanyonRating';
import * as TagsDataStore from '../helpers/TagsDataStore';
import * as CanyonDataStore from '../helpers/CanyonDataStore';
import * as UserCanyonDataStore from '../helpers/UserCanyonDataStore';
import { Tag } from '../helpers/TagsDataStore';
import { useTranslation } from 'react-i18next';
import AppModal from './AppModal';

const PREVIEW_COUNT = 5;

const GoalsWidget: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Goal | null>(null);

  const [auditOpen, setAuditOpen] = useState<Record<number, boolean>>({});
  const [auditTrips, setAuditTrips] = useState<Record<number, EnrichedAuditTrip[] | undefined>>({});
  const [auditLoading, setAuditLoading] = useState<Record<number, boolean>>({});

  const loadGoals = () =>
    Promise.all([apiFetch<Goal[]>('/api/goals'), TagsDataStore.load()])
      .then(([gs, tgs]) => { setGoals(gs); setTags(tgs); })
      .catch(() => {})
      .finally(() => setIsLoading(false));

  useEffect(() => { loadGoals(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAudit = async (goal: Goal) => {
    const id = goal.Id!;
    const isOpen = auditOpen[id];
    setAuditOpen(prev => ({ ...prev, [id]: !isOpen }));
    if (!isOpen && auditTrips[id] === undefined) {
      setAuditLoading(prev => ({ ...prev, [id]: true }));
      try {
        const [trips, canyonsById, userCanyonsById] = await Promise.all([
          apiFetch<AuditTrip[]>(`/api/goals/${id}/trips`),
          CanyonDataStore.loadById(),
          UserCanyonDataStore.loadById(),
        ]);
        setAuditTrips(prev => ({ ...prev, [id]: enrichAuditTrips(trips, canyonsById, userCanyonsById) }));
      } catch {
        setAuditTrips(prev => ({ ...prev, [id]: [] }));
      } finally {
        setAuditLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleMarkComplete = async (goal: Goal) => {
    setCompletingId(goal.Id!);
    setConfirmTarget(null);
    try {
      await apiFetch(`/api/goals/${goal.Id}/complete`, { method: 'PATCH' });
      setIsLoading(true);
      await loadGoals();
    } catch {
      // silently ignore — user can use Settings to retry
    } finally {
      setCompletingId(null);
    }
  };

  const tagNames = (ids: number[]) =>
    ids.map(id => tags.find(t => t.Id === id)?.Name).filter((n): n is string => Boolean(n));

  if (isLoading) return <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>;
  if (goals.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{t('goals.progress')}</Typography>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, px: 2, pt: 2, pb: 1, backgroundColor: 'background.paper' }}>
        {goals.map((goal, i) => {
          const trips = auditTrips[goal.Id!];
          const previewTrips = trips?.slice(0, PREVIEW_COUNT);
          const hasMore = (trips?.length ?? 0) > PREVIEW_COUNT;
          return (
            <React.Fragment key={goal.Id}>
              {i > 0 && <Divider sx={{ my: 1.5 }} />}

              <Box display="flex" alignItems="center" gap={0.5}>
                <Box flex={1} minWidth={0}>
                  <GoalProgressBar
                    requirement={goal}
                    tagNames={tagNames(goal.RequiredTagIds)}
                    onMarkComplete={() => setConfirmTarget(goal)}
                    isCompleting={completingId === goal.Id}
                    onTitleClick={() => navigate(`/journal/goals/${goal.Id}`)}
                  />
                </Box>

                <Tooltip title={t('goals.viewTrips')}>
                  <IconButton size="small" onClick={() => toggleAudit(goal)} sx={{ ml: 2 }}>
                    {auditOpen[goal.Id!] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Audit trip list */}
              <Collapse in={!!auditOpen[goal.Id!]}>
                <Divider sx={{ mt: 1, mb: 0.5 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={600}
                  sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {t('goals.matchingTrips')}
                </Typography>
                {auditLoading[goal.Id!] ? (
                  <Box display="flex" justifyContent="center" py={1}><CircularProgress size={18} /></Box>
                ) : (previewTrips ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                    {t('goals.noMatchingTrips')}
                  </Typography>
                ) : (
                  <Box sx={{ mb: 0.5 }}>
                    {previewTrips!.map((trip, ti) => (
                      <Box key={trip.Id}>
                        {ti > 0 && <Divider sx={{ my: 0.5 }} />}
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
                        onClick={() => navigate(`/journal/goals/${goal.Id}`)}
                        sx={{ p: 0, mt: 0.5, typography: 'caption', minWidth: 0, textTransform: 'none' }}
                      >
                        {t('goals.viewAllTrips', { count: trips!.length })}
                      </Button>
                    )}
                  </Box>
                )}
              </Collapse>
            </React.Fragment>
          );
        })}
      </Box>

      <AppModal
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        title={t('goals.markCompleteConfirmTitle')}
        maxWidth="xs"
        actions={
          <>
            <Button onClick={() => setConfirmTarget(null)}>{t('common:actions.cancel')}</Button>
            <Button variant="contained" color="success"
              onClick={() => confirmTarget && handleMarkComplete(confirmTarget)}>
              {t('goals.markComplete')}
            </Button>
          </>
        }
      >
        <DialogContent>
          <DialogContentText>
            {t('goals.markCompleteConfirmMessage', { label: confirmTarget?.Label })}
          </DialogContentText>
        </DialogContent>
      </AppModal>
    </Box>
  );
};

export default GoalsWidget;