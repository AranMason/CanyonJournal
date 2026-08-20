import React, { useEffect, useState } from 'react';
import {
  Box, Button, Chip, DialogActions, DialogContent, Divider, FormControl,
  FormControlLabel, IconButton, InputLabel, MenuItem, Radio, RadioGroup,
  Select, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useTranslation } from 'react-i18next';
import { Goal, GoalRule, GoalRuleType } from '../../types/Goal';
import { Tag } from '../../helpers/TagsDataStore';
import { GetCanyonTypeDisplayName } from '../../helpers/EnumMapper';
import { CanyonTypeEnum, CanyonTypeList } from '../../types/CanyonTypeEnum';
import AppModal from '../AppModal';
import RegionTreePicker from '../RegionTreePicker';

type TimeWindowMode = 'alltime' | 'since' | 'rolling';

export interface GoalEditorPayload {
  Label: string;
  MinCount: number | null;
  CountMode: Goal['CountMode'];
  RegionId: number | null;
  StartDate: string | null;
  RollingDays: number | null;
  SortOrder: number;
  Rules: GoalRule[];
}

interface GoalEditorModalProps {
  open: boolean;
  goal: Goal | null;
  tags: Tag[];
  onClose: () => void;
  onSave: (payload: GoalEditorPayload) => Promise<void>;
}

const createEmptyForm = (): GoalEditorPayload => ({
  Label: '',
  MinCount: null,
  CountMode: 'records',
  RegionId: null,
  StartDate: null,
  RollingDays: null,
  SortOrder: 0,
  Rules: [],
});

const createEmptyRule = (): GoalRule => ({
  RuleType: 'min_vertical',
  IntValue: null,
  IntValues: null,
  IsExclusion: false,
});

const GoalEditorModal: React.FC<GoalEditorModalProps> = ({ open, goal, tags, onClose, onSave }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<GoalEditorPayload>(createEmptyForm());
  const [timeWindowMode, setTimeWindowMode] = useState<TimeWindowMode>('alltime');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (goal) {
      setForm({
        Label: goal.Label,
        MinCount: goal.MinCount ?? null,
        CountMode: goal.CountMode,
        RegionId: goal.RegionId ?? null,
        StartDate: goal.StartDate ? goal.StartDate.substring(0, 10) : null,
        RollingDays: goal.RollingDays ?? null,
        SortOrder: goal.SortOrder ?? 0,
        Rules: (goal.Rules ?? []).map(rule => ({ ...rule })),
      });
      setTimeWindowMode(goal.RollingDays ? 'rolling' : goal.StartDate ? 'since' : 'alltime');
    } else {
      setForm(createEmptyForm());
      setTimeWindowMode('alltime');
    }
    setErrors({});
  }, [open, goal]);

  const setField = <K extends keyof GoalEditorPayload>(field: K, value: GoalEditorPayload[K]) => {
    setForm(previous => ({ ...previous, [field]: value }));
    setErrors(previous => { const next = { ...previous }; delete next[field]; return next; });
  };

  const updateRule = (index: number, changes: Partial<GoalRule>) =>
    setForm(previous => ({
      ...previous,
      Rules: previous.Rules.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, ...changes } : rule),
    }));

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!form.Label.trim()) nextErrors.Label = t('goals.errors.labelRequired');
    if (form.CountMode !== 'all_in_region' && (!form.MinCount || form.MinCount < 1)) {
      nextErrors.MinCount = t('goals.errors.targetRequired');
    }
    if (!form.CountMode) nextErrors.CountMode = t('common:required', 'Required');
    if (form.CountMode === 'all_in_region' && !form.RegionId) {
      nextErrors.RegionId = t('goals.errors.regionRequiredForMode');
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        ...form,
        StartDate: timeWindowMode === 'since' ? form.StartDate : null,
        RollingDays: timeWindowMode === 'rolling' ? form.RollingDays : null,
      });
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || t('goals.errors.saveFailed') });
    } finally {
      setIsSaving(false);
    }
  };

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
    <AppModal
      open={open}
      onClose={() => !isSaving && onClose()}
      title={goal ? t('goals.editRequirement') : t('goals.addRequirement')}
      maxWidth="sm"
      disableClose={isSaving}
    >
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} pt={1}>
          {errors.general && <Typography color="error" variant="body2">{errors.general}</Typography>}

          <FormControl size="small" fullWidth error={Boolean(errors.CountMode)}>
            <InputLabel>{t('goals.countMode')}</InputLabel>
            <Select
              value={form.CountMode}
              label={t('goals.countMode')}
              onChange={event => setField('CountMode', event.target.value as Goal['CountMode'])}
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
            onChange={event => setField('Label', event.target.value)}
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
              onChange={event => setField('MinCount', event.target.value === '' ? null : parseInt(event.target.value, 10))}
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
            onChange={id => setField('RegionId', id)}
            label={form.CountMode === 'all_in_region' ? t('goals.regionRequired') : t('goals.regionOptional')}
            allowClear
            error={Boolean(errors.RegionId)}
            helperText={errors.RegionId}
          />

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {t('goals.timeWindow')}
            </Typography>
            <RadioGroup row value={timeWindowMode} onChange={event => setTimeWindowMode(event.target.value as TimeWindowMode)}>
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
                onChange={event => setField('StartDate', event.target.value || null)}
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
                onChange={event => setField('RollingDays', event.target.value === '' ? null : parseInt(event.target.value, 10))}
                inputProps={{ min: 1 }}
                helperText={t('goals.rollingDaysHelp')}
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Divider><Typography variant="caption" color="text.secondary">{t('goals.filtersSection')}</Typography></Divider>
          {form.Rules.map((rule, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider sx={{ my: 1 }} />}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'minmax(150px, 0.9fr) minmax(0, 1fr) minmax(104px, 0.5fr) auto' },
                  gap: 1,
                  alignItems: 'start',
                  width: '100%',
                }}
              >
              <FormControl size="small" sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                <InputLabel>{t('common:canyon.canyonType')}</InputLabel>
                <Select
                  value={rule.RuleType}
                  label={t('common:canyon.canyonType')}
                  onChange={event => updateRule(index, { RuleType: event.target.value as GoalRuleType, IntValue: null, IntValues: null })}
                >
                  {ruleTypes.map(ruleType => <MenuItem key={ruleType} value={ruleType}>{ruleTypeLabel[ruleType]}</MenuItem>)}
                </Select>
              </FormControl>

              <Box minWidth={0} sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                {rule.RuleType === 'canyon_type' && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>{t('goals.ruleTypeCanyonType')}</InputLabel>
                    <Select
                      multiple
                      label={t('goals.ruleTypeCanyonType')}
                      value={(rule.IntValues ?? '').split(',').map(Number).filter(value => !isNaN(value) && value > 0)}
                      onChange={event => updateRule(index, { IntValues: (event.target.value as number[]).join(',') })}
                      renderValue={selected => (selected as number[]).map(value => GetCanyonTypeDisplayName(value as CanyonTypeEnum)).join(', ')}
                    >
                      {CanyonTypeList.filter(canyonType => canyonType !== CanyonTypeEnum.Unknown).map(canyonType => (
                        <MenuItem key={canyonType} value={canyonType}>{GetCanyonTypeDisplayName(canyonType)}</MenuItem>
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
                    onChange={event => updateRule(index, { IntValue: event.target.value === '' ? null : parseInt(event.target.value, 10) })}
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
                    onChange={event => updateRule(index, { IntValue: event.target.value === '' ? null : parseInt(event.target.value, 10) })}
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
                    onChange={event => updateRule(index, { IntValue: event.target.value === '' ? null : parseInt(event.target.value, 10) })}
                  />
                )}
                {rule.RuleType === 'tag' && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>{t('common:fields.tags')}</InputLabel>
                    <Select
                      multiple
                      label={t('common:fields.tags')}
                      value={(rule.IntValues ?? '').split(',').map(Number).filter(value => !isNaN(value) && value > 0)}
                      onChange={event => updateRule(index, { IntValues: (event.target.value as number[]).join(','), IntValue: null })}
                      renderValue={selected =>
                        (selected as number[])
                          .map(id => tags.find(tag => tag.Id === id)?.Name ?? id)
                          .map(name => <Chip key={name} label={name} size="small" sx={{ mr: 0.5 }} />)
                      }
                    >
                      {tags.map(tag => <MenuItem key={tag.Id} value={tag.Id}>{tag.Name}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
                {rule.RuleType === 'first_time' && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pt: 1 }}>
                    {t('goals.firstTimeDescription')}
                  </Typography>
                )}
              </Box>

              {rule.RuleType !== 'first_time' && (
                <FormControl size="small" sx={{ gridColumn: { xs: '1', sm: 'auto' } }}>
                  <InputLabel>{t('goals.ruleMode')}</InputLabel>
                  <Select
                    value={rule.IsExclusion ? 'exclude' : 'include'}
                    label={t('goals.ruleMode')}
                    onChange={event => updateRule(index, { IsExclusion: event.target.value === 'exclude' })}
                  >
                    <MenuItem value="include">{t('goals.ruleInclude')}</MenuItem>
                    <MenuItem value="exclude">{t('goals.ruleExclude')}</MenuItem>
                  </Select>
                </FormControl>
              )}

              <IconButton
                size="small"
                color="error"
                onClick={() => setForm(previous => ({ ...previous, Rules: previous.Rules.filter((_, ruleIndex) => ruleIndex !== index) }))}
                sx={{ gridColumn: { xs: '2', sm: 'auto' }, alignSelf: 'center' }}
              >
                <RemoveCircleOutlineIcon fontSize="small" />
              </IconButton>
              </Box>
            </React.Fragment>
          ))}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setForm(previous => ({ ...previous, Rules: [...previous.Rules, createEmptyRule()] }))}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('goals.addRule')}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>{t('common:actions.cancel')}</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? t('settings.saving') : t('common:actions.save')}
        </Button>
      </DialogActions>
    </AppModal>
  );
};

export default GoalEditorModal;
