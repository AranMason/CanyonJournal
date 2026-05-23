import React, { useEffect, useState } from 'react';
import {
  Autocomplete, Box, Button, Chip, CircularProgress, Collapse, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, FormHelperText, IconButton,
  InputLabel, Link, MenuItem, Select, TextField, Tooltip, Typography,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { Goal, AuditTrip, EnrichedAuditTrip, enrichAuditTrips } from '../../types/Goal';
import GoalProgressBar from '../GoalProgressBar';
import CanyonRating from '../CanyonRating';
import { useTranslation } from 'react-i18next';
import * as TagsDataStore from '../../helpers/TagsDataStore';
import * as CanyonDataStore from '../../helpers/CanyonDataStore';
import * as UserCanyonDataStore from '../../helpers/UserCanyonDataStore';
import { Tag } from '../../helpers/TagsDataStore';

const PREVIEW_COUNT = 5;

const EMPTY_FORM = (): Partial<Goal> => ({
  Label: '',
  MinCount: 10,
  CountMode: 'records',
  MinVerticalRating: null,
  MinAquaticRating: null,
  MinCommitmentRating: null,
  RequiredTagIds: [],
  StartDate: null,
  SortOrder: 0,
});

const SettingsGoalsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Goal>>(EMPTY_FORM());
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completeConfirmTarget, setCompleteConfirmTarget] = useState<Goal | null>(null);

  // Tag selection state for the dialog — new (unsaved) tags get a temporary negative Id.
  // Real tag creation is deferred to handleSave to avoid orphaned tags on cancel.
  const [selectedTagItems, setSelectedTagItems] = useState<Tag[]>([]);
  let nextTempId = -1;

  // Audit state: reqId → trips
  const [auditOpen, setAuditOpen] = useState<Record<number, boolean>>({});
  const [auditTrips, setAuditTrips] = useState<Record<number, EnrichedAuditTrip[] | undefined>>({});
  const [auditLoading, setAuditLoading] = useState<Record<number, boolean>>({});

  const loadGoals = async () => {
    const [active, completed, tgs] = await Promise.all([
      apiFetch<Goal[]>('/api/goals'),
      apiFetch<Goal[]>('/api/goals?includeCompleted=true'),
      TagsDataStore.load(),
    ]);
    setActiveGoals(active);
    setCompletedGoals(completed.filter(g => g.CompletedAt));
    setTags(tgs);
  };

  useEffect(() => {
    setIsLoading(true);
    loadGoals().finally(() => setIsLoading(false));
  }, []);

  const toggleAudit = async (req: Goal) => {
    const id = req.Id!;
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

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setSelectedTagItems([]);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (req: Goal) => {
    setEditingId(req.Id ?? null);
    setForm({
      Label: req.Label,
      MinCount: req.MinCount,
      CountMode: req.CountMode,
      MinVerticalRating: req.MinVerticalRating ?? null,
      MinAquaticRating: req.MinAquaticRating ?? null,
      MinCommitmentRating: req.MinCommitmentRating ?? null,
      RequiredTagIds: req.RequiredTagIds ?? [],
      StartDate: req.StartDate ? req.StartDate.substring(0, 10) : null,
      SortOrder: req.SortOrder ?? 0,
    });
    setSelectedTagItems(tags.filter(t => (req.RequiredTagIds ?? []).includes(t.Id)));
    setErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.Label?.trim()) errs.Label = 'Label is required';
    if (!form.MinCount || form.MinCount < 1) errs.MinCount = 'Target must be at least 1';
    if (!form.CountMode) errs.CountMode = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      // Create any new (temporary) tags now, at actual save time
      const resolvedTagIds: number[] = [];
      for (const item of selectedTagItems) {
        if (item.Id < 0) {
          const newTag = await TagsDataStore.create(item.Name);
          setTags(prev => prev.some(t => t.Id === newTag.Id) ? prev : [...prev, newTag]);
          resolvedTagIds.push(newTag.Id);
        } else {
          resolvedTagIds.push(item.Id);
        }
      }
      const payload = { ...form, RequiredTagIds: resolvedTagIds };
      if (editingId != null) {
        await apiFetch(`/api/goals/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setAuditTrips(prev => { const next = { ...prev }; delete next[editingId]; return next; });
        setAuditOpen(prev => ({ ...prev, [editingId]: false }));
      } else {
        await apiFetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      await loadGoals();
      setDialogOpen(false);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to save goal' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkComplete = async (req: Goal) => {
    setCompletingId(req.Id!);
    try {
      await apiFetch(`/api/goals/${req.Id}/complete`, { method: 'PATCH' });
      await loadGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to mark complete');
    } finally {
      setCompletingId(null);
    }
  };

  const handleReopen = async (req: Goal) => {
    setCompletingId(req.Id!);
    try {
      await apiFetch(`/api/goals/${req.Id}/reopen`, { method: 'PATCH' });
      await loadGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to reopen goal');
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.Id) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/goals/${deleteTarget.Id}`, { method: 'DELETE' });
      await loadGoals();
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete goal');
    } finally {
      setIsDeleting(false);
    }
  };

  const setField = (field: keyof Goal, value: any) => {
    setForm(prev => ({ ...prev, [field]: value === '' ? null : value }));
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const tagNames = (ids: number[]) =>
    ids.map(id => tags.find(t => t.Id === id)?.Name).filter((n): n is string => Boolean(n));

  const renderGoalCard = (req: Goal, isCompleted = false) => (
    <Box
      key={req.Id}
      sx={{
        border: '1px solid', borderColor: 'divider', borderRadius: 1,
        px: 2, pt: 2, pb: 1, mb: 2,
        opacity: isCompleted ? 0.7 : 1,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box flex={1} mr={1}>
          <GoalProgressBar requirement={req} tagNames={tagNames(req.RequiredTagIds)}
            onTitleClick={() => navigate(`/journal/goals/${req.Id}`)} />
        </Box>
        <Box display="flex" gap={0.5} mt={-0.5} flexShrink={0}>
          <Tooltip title={t('goals.viewTrips')}>
            <IconButton size="small" onClick={() => toggleAudit(req)}>
              {auditOpen[req.Id!] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {!isCompleted ? (
            <Tooltip title={t('goals.markComplete')}>
              <IconButton size="small" color="success" onClick={() => setCompleteConfirmTarget(req)} disabled={completingId === req.Id}>
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t('goals.reopen')}>
              <IconButton size="small" onClick={() => handleReopen(req)} disabled={completingId === req.Id}>
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t('common:actions.edit')}>
            <IconButton size="small" onClick={() => openEdit(req)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('common:actions.delete')}>
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(req)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={auditOpen[req.Id!]}>
        <Divider sx={{ mt: 1, mb: 1 }} />
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {t('goals.matchingTrips')}
        </Typography>
        {auditLoading[req.Id!] ? (
          <Box display="flex" justifyContent="center" py={1}><CircularProgress size={18} /></Box>
        ) : (auditTrips[req.Id!] ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
            {t('goals.noMatchingTrips')}
          </Typography>
        ) : (
          <Box sx={{ mb: 1 }}>
            {(auditTrips[req.Id!] ?? []).slice(0, PREVIEW_COUNT).map((trip, ti) => (
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
            {(auditTrips[req.Id!] ?? []).length > PREVIEW_COUNT && (
              <Button
                size="small"
                variant="text"
                onClick={() => navigate(`/journal/goals/${req.Id}`)}
                sx={{ p: 0, mt: 0.5, typography: 'caption', minWidth: 0, textTransform: 'none' }}
              >
                {t('goals.viewAllTrips', { count: (auditTrips[req.Id!] ?? []).length })}
              </Button>
            )}
          </Box>
        )}
      </Collapse>
    </Box>
  );

  if (isLoading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Define progress goals — useful for guide training or personal targets.
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
            {showCompleted ? 'Hide completed' : `${t('goals.showCompleted')} (${completedGoals.length})`}
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

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => !isSaving && setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId != null ? t('goals.editRequirement') : t('goals.addRequirement')}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {errors.general && (
              <Typography color="error" variant="body2">{errors.general}</Typography>
            )}
            <TextField
              label={t('goals.label')}
              value={form.Label ?? ''}
              onChange={e => setField('Label', e.target.value)}
              size="small"
              fullWidth
              required
              error={Boolean(errors.Label)}
              helperText={errors.Label}
            />
            <TextField
              label={t('goals.minCount')}
              type="number"
              value={form.MinCount ?? ''}
              onChange={e => setField('MinCount', parseInt(e.target.value, 10) || '')}
              size="small"
              inputProps={{ min: 1 }}
              error={Boolean(errors.MinCount)}
              helperText={errors.MinCount}
              fullWidth
            />
            <FormControl size="small" fullWidth error={Boolean(errors.CountMode)}>
              <InputLabel>{t('goals.countMode')}</InputLabel>
              <Select
                value={form.CountMode ?? 'records'}
                label={t('goals.countMode')}
                onChange={e => setField('CountMode', e.target.value)}
              >
                <MenuItem value="records">{t('goals.countModeRecords')}</MenuItem>
                <MenuItem value="days">{t('goals.countModeDays')}</MenuItem>
                <MenuItem value="distinct_canyons">{t('goals.countModeDistinctCanyons')}</MenuItem>
              </Select>
              {errors.CountMode && <FormHelperText>{errors.CountMode}</FormHelperText>}
            </FormControl>

            <TextField
              label={t('goals.startDate')}
              type="date"
              value={form.StartDate ?? ''}
              onChange={e => setField('StartDate', e.target.value || null)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText={t('goals.startDateHelp')}
            />

            <Divider><Typography variant="caption" color="text.secondary">Filters (optional)</Typography></Divider>

            <Box display="flex" gap={1}>
              <TextField
                label={t('goals.minVertical')}
                type="number"
                value={form.MinVerticalRating ?? ''}
                onChange={e => setField('MinVerticalRating', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                size="small"
                inputProps={{ min: 1, max: 7 }}
                fullWidth
              />
              <TextField
                label={t('goals.minAquatic')}
                type="number"
                value={form.MinAquaticRating ?? ''}
                onChange={e => setField('MinAquaticRating', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                size="small"
                inputProps={{ min: 1, max: 7 }}
                fullWidth
              />
              <TextField
                label={t('goals.minCommitment')}
                type="number"
                value={form.MinCommitmentRating ?? ''}
                onChange={e => setField('MinCommitmentRating', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                size="small"
                inputProps={{ min: 0, max: 6 }}
                fullWidth
              />
            </Box>

            <Autocomplete
              multiple
              freeSolo
              size="small"
              options={tags}
              getOptionLabel={option => typeof option === 'string' ? option : option.Name}
              filterOptions={(options, params) => {
                const filtered = createFilterOptions<Tag>()(options, params);
                const { inputValue } = params;
                const isExisting = options.some(o => o.Name.toLowerCase() === inputValue.toLowerCase());
                if (inputValue.trim() && !isExisting) {
                  filtered.push({ Id: -1, Name: `Add "${inputValue.trim()}"` } as Tag);
                }
                return filtered;
              }}
              value={selectedTagItems}
              onChange={(_, selected) => {
                const resolved = selected.map(item => {
                  if (typeof item === 'string') {
                    // User pressed Enter on a free-typed string
                    return { Id: nextTempId--, Name: item.trim() } as Tag;
                  }
                  if (item.Id === -1) {
                    // User clicked the "Add '...'" option — extract the real name
                    const name = item.Name.replace(/^Add "/, '').replace(/"$/, '');
                    return { Id: nextTempId--, Name: name } as Tag;
                  }
                  return item;
                });
                setSelectedTagItems(resolved);
              }}
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip label={option.Name} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={params => (
                <TextField {...params} label={t('goals.requiredTags')} />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isSaving}>{t('common:actions.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? t('settings.saving') : t('common:actions.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => !isDeleting && setDeleteTarget(null)}>
        <DialogTitle>{t('goals.deleteRequirement')}</DialogTitle>
        <DialogContent>
          <Typography>{t('goals.deleteConfirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>{t('common:actions.cancel')}</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? t('settings.deleting') : t('common:actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark complete confirmation */}
      <Dialog open={Boolean(completeConfirmTarget)} onClose={() => setCompleteConfirmTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('goals.markCompleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('goals.markCompleteConfirmMessage', { label: completeConfirmTarget?.Label })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCompleteConfirmTarget(null)}>{t('common:actions.cancel')}</Button>
          <Button variant="contained" color="success"
            disabled={completingId === completeConfirmTarget?.Id}
            onClick={() => { if (completeConfirmTarget) { setCompleteConfirmTarget(null); handleMarkComplete(completeConfirmTarget); } }}>
            {t('goals.markComplete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsGoalsTab;
