import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Chip, CircularProgress, DialogActions,
  DialogContent, Divider, FormControl, FormControlLabel, IconButton,
  InputLabel, MenuItem, Radio, RadioGroup, Select, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { Goal, GoalRule, GoalRuleType } from '../../types/Goal';
import * as GoalsDataStore from '../../helpers/GoalsDataStore';
import GoalCard from '../goals/GoalCard';
import RegionTreePicker from '../RegionTreePicker';
import { useTranslation } from 'react-i18next';
import * as TagsDataStore from '../../helpers/TagsDataStore';
import * as RegionDataStore from '../../helpers/RegionDataStore';
import { Tag } from '../../helpers/TagsDataStore';
import { Region } from '../../types/Region';
import { GetCanyonTypeDisplayName } from '../../helpers/EnumMapper';
import { CanyonTypeEnum, CanyonTypeList } from '../../types/CanyonTypeEnum';
import AppModal from '../AppModal';

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
      } else {
        await apiFetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      GoalsDataStore.invalidate();
      await loadGoals();
      setDialogOpen(false);
    } catch (err: any) {
      setErrors({ general: err.message || t('goals.errors.saveFailed') });
    } finally {
      setIsSaving(false);
    }
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

  const goalRegionNames = useMemo((): Record<number, string> => {
    const map: Record<number, string> = {};
    flatRegions.forEach(r => { map[r.Id] = r.Name; });
    return map;
  }, [flatRegions]);

  const renderRuleRow = (rule: GoalRule, index: number) => {
    const ruleTypes: GoalRuleType[] = [
      'canyon_type', 'min_vertical', 'min_aquatic', 'min_commitment', 'min_star', 'tag', 'first_time',
    ];
    const ruleTypeLabel: Record<GoalRuleType, string> = {
      canyon_type: t('goals.ruleTypeCanyonType'),
      min_vertical: t('goals.ruleTypeMinVertical'),
      min_aquatic: t('goals.ruleTypeMinAquatic'),
      min_commitment: t('goals.ruleTypeMinCommitment'),
      min_star: t('goals.ruleTypeMinStars'),
      tag: t('goals.ruleTypeTag'),
      first_time: t('goals.ruleTypeFirstTime'),
    };

    return (
      <Box key={index} display="flex" gap={1} width={'100%'} flexWrap={'wrap'} alignItems="flex-start" sx={{ mt: 1 }}>
        {/* Rule type */}
        <FormControl size="small">
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
          {rule.RuleType === 'min_star' && (
            <TextField
              size="small"
              fullWidth
              type="number"
              label={t('goals.minRating')}
              value={rule.IntValue ?? ''}
              inputProps={{ min: 0, max: 5 }}
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

    </>
  );
};

export default SettingsGoalsTab;
