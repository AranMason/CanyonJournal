import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, Collapse, DialogActions,
  DialogContent, Divider, FormControl, FormControlLabel, IconButton,
  InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Tooltip, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { Goal, GoalRule, GoalRuleType, AuditTrip, EnrichedAuditTrip, enrichAuditTrips } from '../../types/Goal';
import GoalProgressBar from '../GoalProgressBar';
import CanyonRating from '../CanyonRating';
import RegionTreePicker from '../RegionTreePicker';
import { useTranslation } from 'react-i18next';
import * as TagsDataStore from '../../helpers/TagsDataStore';
import * as CanyonDataStore from '../../helpers/CanyonDataStore';
import * as UserCanyonDataStore from '../../helpers/UserCanyonDataStore';
import * as RegionDataStore from '../../helpers/RegionDataStore';
import { Tag } from '../../helpers/TagsDataStore';
import { Region } from '../../types/Region';
import { GetCanyonTypeDisplayName } from '../../helpers/EnumMapper';
import { CanyonTypeEnum, CanyonTypeList } from '../../types/CanyonTypeEnum';
import AppModal from '../AppModal';

const PREVIEW_COUNT = 5;

type TimeWindowMode = 'alltime' | 'since' | 'rolling';

interface FormState {
  Label: string;
  MinCount: number | null;
  CountMode: Goal['CountMode'];
  RegionId: number | null;
  StartDate: string | null;
  RollingDays: number | null;
  SortOrder: number;
  Rules: GoalRule[];
}

const EMPTY_FORM = (): FormState => ({
  Label: '',
  MinCount: null,
  CountMode: 'records',
  RegionId: null,
  StartDate: null,
  RollingDays: null,
  SortOrder: 0,
  Rules: [],
});

const EMPTY_RULE = (): GoalRule => ({
  RuleType: 'min_vertical',
  IntValue: null,
  IntValues: null,
  IsExclusion: false,
});

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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM());
  const [timeWindowMode, setTimeWindowMode] = useState<TimeWindowMode>('alltime');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completeConfirmTarget, setCompleteConfirmTarget] = useState<Goal | null>(null);

  const [auditOpen, setAuditOpen] = useState<Record<number, boolean>>({});
  const [auditTrips, setAuditTrips] = useState<Record<number, EnrichedAuditTrip[] | undefined>>({});
  const [auditLoading, setAuditLoading] = useState<Record<number, boolean>>({});

  const loadGoals = async () => {
    const [active, completed, tgs, regions] = await Promise.all([
      apiFetch<Goal[]>('/api/goals'),
      apiFetch<Goal[]>('/api/goals?includeCompleted=true'),
      TagsDataStore.load(),
      RegionDataStore.load(),
    ]);
    setActiveGoals(active);
    setCompletedGoals(completed.filter(g => g.CompletedAt));
    setTags(tgs);
    setFlatRegions(regions);
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
    setTimeWindowMode('alltime');
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (req: Goal) => {
    setEditingId(req.Id ?? null);
    setForm({
      Label: req.Label,
      MinCount: req.MinCount ?? null,
      CountMode: req.CountMode,
      RegionId: req.RegionId ?? null,
      StartDate: req.StartDate ? req.StartDate.substring(0, 10) : null,
      RollingDays: req.RollingDays ?? null,
      SortOrder: req.SortOrder ?? 0,
      Rules: (req.Rules ?? []).map(r => ({ ...r })),
    });
    const twm: TimeWindowMode = req.RollingDays ? 'rolling' : req.StartDate ? 'since' : 'alltime';
    setTimeWindowMode(twm);
    setErrors({});
    setDialogOpen(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.Label.trim()) errs.Label = t('goals.errors.labelRequired');
    if (form.CountMode !== 'all_in_region' && (!form.MinCount || form.MinCount < 1))
      errs.MinCount = t('goals.errors.targetRequired');
    if (!form.CountMode) errs.CountMode = t('common:required', 'Required');
    if (form.CountMode === 'all_in_region' && !form.RegionId)
      errs.RegionId = t('goals.errors.regionRequiredForMode');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        StartDate: timeWindowMode === 'since' ? form.StartDate : null,
        RollingDays: timeWindowMode === 'rolling' ? form.RollingDays : null,
      };

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
      setErrors({ general: err.message || t('goals.errors.saveFailed') });
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
      alert(err.message || t('goals.errors.markCompleteFailed'));
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
      alert(err.message || t('goals.errors.reopenFailed'));
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
      alert(err.message || t('goals.errors.deleteFailed'));
    } finally {
      setIsDeleting(false);
    }
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
  };

  const addRule = () => setForm(prev => ({ ...prev, Rules: [...prev.Rules, EMPTY_RULE()] }));

  const updateRule = (index: number, changes: Partial<GoalRule>) =>
    setForm(prev => ({
      ...prev,
      Rules: prev.Rules.map((r, i) => i === index ? { ...r, ...changes } : r),
    }));

  const removeRule = (index: number) =>
    setForm(prev => ({ ...prev, Rules: prev.Rules.filter((_, i) => i !== index) }));

  const goalTagNames = (goal: Goal): string[] =>
    (goal.Rules ?? [])
      .filter(r => r.RuleType === 'tag' && !r.IsExclusion)
      .flatMap(r => (r.IntValues ?? '').split(',').map(Number).filter(n => !isNaN(n) && n > 0))
      .map(id => tags.find(tg => tg.Id === id)?.Name)
      .filter((n): n is string => Boolean(n));

  const goalRegionNames = useMemo((): Record<number, string> => {
    const map: Record<number, string> = {};
    flatRegions.forEach(r => { map[r.Id] = r.Name; });
    return map;
  }, [flatRegions]);

  const renderRuleRow = (rule: GoalRule, index: number) => {
    const ruleTypes: GoalRuleType[] = [
      'canyon_type', 'min_vertical', 'min_aquatic', 'min_commitment', 'tag', 'first_time',
    ];
    const ruleTypeLabel: Record<GoalRuleType, string> = {
      canyon_type: t('goals.ruleTypeCanyonType'),
      min_vertical: t('goals.ruleTypeMinVertical'),
      min_aquatic: t('goals.ruleTypeMinAquatic'),
      min_commitment: t('goals.ruleTypeMinCommitment'),
      tag: t('goals.ruleTypeTag'),
      first_time: t('goals.ruleTypeFirstTime'),
    };

    return (
      <Box key={index} display="flex" gap={1} alignItems="flex-start" sx={{ mt: 1 }}>
        {/* Rule type */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t('common:canyon.canyonType')}</InputLabel>
          <Select
            value={rule.RuleType}
            label={t('common:canyon.canyonType')}
            onChange={e => updateRule(index, { RuleType: e.target.value as GoalRuleType, IntValue: null, IntValues: null })}
          >
            {ruleTypes.map(rt => (
              <MenuItem key={rt} value={rt}>{ruleTypeLabel[rt]}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Value input — adapts to rule type */}
        <Box flex={1} minWidth={0}>
          {rule.RuleType === 'canyon_type' && (
            <FormControl size="small" fullWidth>
              <InputLabel>{t('goals.ruleTypeCanyonType')}</InputLabel>
              <Select
                multiple
                    label={t('goals.ruleTypeCanyonType')}
                value={(rule.IntValues ?? '').split(',').map(Number).filter(n => !isNaN(n) && n > 0)}
                onChange={e => {
                  const vals = e.target.value as number[];
                  updateRule(index, { IntValues: vals.join(',') });
                }}
                renderValue={selected =>
                  (selected as number[]).map(v => GetCanyonTypeDisplayName(v as CanyonTypeEnum)).join(', ')
                }
              >
                {CanyonTypeList.filter(ct => ct !== CanyonTypeEnum.Unknown).map(ct => (
                  <MenuItem key={ct} value={ct}>{GetCanyonTypeDisplayName(ct)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {(rule.RuleType === 'min_vertical' || rule.RuleType === 'min_aquatic') && (
            <TextField
              size="small"
              fullWidth
              type="number"
              label={t('goals.minRating')}
              value={rule.IntValue ?? ''}
              inputProps={{ min: 1, max: 7 }}
              onChange={e => updateRule(index, { IntValue: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
            />
          )}
          {rule.RuleType === 'min_commitment' && (
            <TextField
              size="small"
              fullWidth
              type="number"
              label={t('goals.minRating')}
              value={rule.IntValue ?? ''}
              inputProps={{ min: 0, max: 6 }}
              onChange={e => updateRule(index, { IntValue: e.target.value === '' ? null : parseInt(e.target.value, 10) })}
            />
          )}
          {rule.RuleType === 'tag' && (
            <FormControl size="small" fullWidth>
              <InputLabel>{t('common:fields.tags')}</InputLabel>
              <Select
                multiple
                label={t('common:fields.tags')}
                value={(rule.IntValues ?? '').split(',').map(Number).filter(n => !isNaN(n) && n > 0)}
                onChange={e => {
                  const vals = e.target.value as number[];
                  updateRule(index, { IntValues: vals.join(','), IntValue: null });
                }}
                renderValue={selected =>
                  (selected as number[])
                    .map(id => tags.find(tg => tg.Id === id)?.Name ?? id)
                    .map(name => <Chip key={name} label={name} size="small" sx={{ mr: 0.5 }} />)
                }
              >
                {tags.map(tag => (
                  <MenuItem key={tag.Id} value={tag.Id}>{tag.Name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {rule.RuleType === 'first_time' && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pt: 1 }}>
              {t('goals.firstTimeDescription')}
            </Typography>
          )}
        </Box>

        {/* Include/Exclude toggle — not applicable to first_time */}
        {rule.RuleType !== 'first_time' && (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>{t('goals.ruleMode')}</InputLabel>
            <Select
              value={rule.IsExclusion ? 'exclude' : 'include'}
              label={t('goals.ruleMode')}
              onChange={e => updateRule(index, { IsExclusion: e.target.value === 'exclude' })}
            >
              <MenuItem value="include">{t('goals.ruleInclude')}</MenuItem>
              <MenuItem value="exclude">{t('goals.ruleExclude')}</MenuItem>
            </Select>
          </FormControl>
        )}

        <IconButton size="small" color="error" onClick={() => removeRule(index)} sx={{ mt: 0.5 }}>
          <RemoveCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };

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
          <GoalProgressBar
            requirement={req}
            tagNames={goalTagNames(req)}
            regionNames={goalRegionNames}
            onTitleClick={() => navigate(`/journal/goals/${req.Id}`)}
          />
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

      {/* Add / Edit dialog */}
      <AppModal
        open={dialogOpen}
        onClose={() => !isSaving && setDialogOpen(false)}
        title={editingId != null ? t('goals.editRequirement') : t('goals.addRequirement')}
        maxWidth="sm"
        disableClose={isSaving}
      >
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {errors.general && (
              <Typography color="error" variant="body2">{errors.general}</Typography>
            )}

            <FormControl size="small" fullWidth error={Boolean(errors.CountMode)}>
              <InputLabel>{t('goals.countMode')}</InputLabel>
              <Select
                value={form.CountMode}
                label={t('goals.countMode')}
                onChange={e => setField('CountMode', e.target.value as Goal['CountMode'])}
              >
                <MenuItem value="records">{t('goals.countModeRecords')}</MenuItem>
                <MenuItem value="days">{t('goals.countModeDays')}</MenuItem>
                <MenuItem value="distinct_canyons">{t('goals.countModeDistinctCanyons')}</MenuItem>
                <MenuItem value="distinct_regions">{t('goals.countModeDistinctRegions')}</MenuItem>
                <MenuItem value="all_in_region">{t('goals.countModeAllCanyonsInRegion')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('goals.label')}
              value={form.Label}
              onChange={e => setField('Label', e.target.value)}
              size="small"
              fullWidth
              required
              error={Boolean(errors.Label)}
              helperText={errors.Label}
            />

            {form.CountMode !== 'all_in_region' && (
              <TextField
                label={t('goals.minCount')}
                type="number"
                value={form.MinCount ?? ''}
                onChange={e => setField('MinCount', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                size="small"
                inputProps={{ min: 1 }}
                required
                error={Boolean(errors.MinCount)}
                helperText={errors.MinCount}
                fullWidth
              />
            )}

            <RegionTreePicker
              value={form.RegionId}
              onChange={id => {
                setField('RegionId', id);
              }}
              label={form.CountMode === 'all_in_region' ? t('goals.regionRequired') : t('goals.regionOptional')}
              allowClear
              error={Boolean(errors.RegionId)}
              helperText={errors.RegionId}
            />

            {/* Time window */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {t('goals.timeWindow')}
              </Typography>
              <RadioGroup
                row
                value={timeWindowMode}
                onChange={e => setTimeWindowMode(e.target.value as TimeWindowMode)}
              >
                <FormControlLabel value="alltime" control={<Radio size="small" />} label={t('goals.allTime')} />
                <FormControlLabel value="since" control={<Radio size="small" />} label={t('goals.sinceDate')} />
                <FormControlLabel value="rolling" control={<Radio size="small" />} label={t('goals.rollingWindow')} />
              </RadioGroup>
              {timeWindowMode === 'since' && (
                <TextField
                  type="date"
                  size="small"
                  fullWidth
                  value={form.StartDate ?? ''}
                  onChange={e => setField('StartDate', e.target.value || null)}
                  InputLabelProps={{ shrink: true }}
                  label={t('goals.startDate')}
                  helperText={t('goals.startDateHelp')}
                  sx={{ mt: 1 }}
                />
              )}
              {timeWindowMode === 'rolling' && (
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  label={t('goals.rollingDays')}
                  value={form.RollingDays ?? ''}
                  onChange={e => setField('RollingDays', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                  inputProps={{ min: 1 }}
                  helperText={t('goals.rollingDaysHelp')}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>

            {/* Rules section */}
            <Divider>
              <Typography variant="caption" color="text.secondary">{t('goals.filtersSection')}</Typography>
            </Divider>
            {form.Rules.map((rule, i) => renderRuleRow(rule, i))}
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addRule}
              sx={{ alignSelf: 'flex-start' }}
            >
              {t('goals.addRule')}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={isSaving}>{t('common:actions.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={isSaving}>
            {isSaving ? t('settings.saving') : t('common:actions.save')}
          </Button>
        </DialogActions>
      </AppModal>

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

      {/* Mark complete confirmation */}
      <AppModal
        open={Boolean(completeConfirmTarget)}
        onClose={() => setCompleteConfirmTarget(null)}
        title={t('goals.markCompleteConfirmTitle')}
        maxWidth="xs"
        actions={
          <>
            <Button onClick={() => setCompleteConfirmTarget(null)}>{t('common:actions.cancel')}</Button>
            <Button variant="contained" color="success"
              disabled={completingId === completeConfirmTarget?.Id}
              onClick={() => { if (completeConfirmTarget) { setCompleteConfirmTarget(null); handleMarkComplete(completeConfirmTarget); } }}>
              {t('goals.markComplete')}
            </Button>
          </>
        }
      >
        <DialogContent>
          <Typography>{t('goals.markCompleteConfirmMessage', { label: completeConfirmTarget?.Label })}</Typography>
        </DialogContent>
      </AppModal>
    </>
  );
};

export default SettingsGoalsTab;
