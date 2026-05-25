import React, { ReactNode } from 'react';
import { Box, Chip, CircularProgress, IconButton, LinearProgress, Link, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Goal } from '../types/Goal';
import CanyonRating from './CanyonRating';
import { useTranslation } from 'react-i18next';
import { GetCanyonTypeDisplayName } from '../helpers/EnumMapper';

interface GoalProgressBarProps {
  requirement: Goal;
  /** Human-readable names for tag rules, resolved by parent from goal.Rules */
  tagNames?: string[];
  /** Region name lookup: regionId → display name, resolved by parent from goal.Rules */
  regionNames?: Record<number, string>;
  onMarkComplete?: () => void;
  isCompleting?: boolean;
  onTitleClick?: () => void;
}

const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  requirement,
  tagNames,
  regionNames,
  onMarkComplete,
  isCompleting,
  onTitleClick,
}) => {
  const { t } = useTranslation();

  const target = requirement.TargetCount ?? requirement.MinCount ?? 0;
  const progress = target > 0 ? Math.min(((requirement.CurrentCount ?? 0) / target) * 100, 100) : 0;
  const isComplete = progress >= 100;

  let unitLabel: string;
  if (requirement.CountMode === 'days') unitLabel = t('goals.daysLabel');
  else if (requirement.CountMode === 'distinct_canyons') unitLabel = t('common:terms.canyon.lower', { count: 2 });
  else if (requirement.CountMode === 'distinct_regions') unitLabel = t('goals.regionsLabel');
  else if (requirement.CountMode === 'all_in_region') unitLabel = t('common:terms.canyon.lower', { count: 2 });
  else unitLabel = t('goals.tripsLabel');

  // Criteria items derived from Rules
  const criteriaItems: { key: string; node: ReactNode }[] = [];

  // Count mode label
  if (requirement.CountMode === 'days') criteriaItems.push({ key: 'mode', node: t('goals.countModeDays') });
  else if (requirement.CountMode === 'distinct_canyons') criteriaItems.push({ key: 'mode', node: t('goals.countModeDistinctCanyons') });
  else if (requirement.CountMode === 'distinct_regions') criteriaItems.push({ key: 'mode', node: t('goals.countModeDistinctRegions') });
  else if (requirement.CountMode === 'all_in_region') criteriaItems.push({ key: 'mode', node: t('goals.countModeAllCanyonsInRegion') });
  else criteriaItems.push({ key: 'mode', node: t('goals.countModeRecords') });

  const rules = requirement.Rules ?? [];

  // Derive ratings from rules
  const minV = rules.find(r => r.RuleType === 'min_vertical' && !r.IsExclusion)?.IntValue;
  const minA = rules.find(r => r.RuleType === 'min_aquatic' && !r.IsExclusion)?.IntValue;
  const minC = rules.find(r => r.RuleType === 'min_commitment' && !r.IsExclusion)?.IntValue;
  if (minV || minA || minC) {
    criteriaItems.push({
      key: 'rating',
      node: (
        <>
          <CanyonRating
            verticalRating={minV ?? undefined}
            aquaticRating={minA ?? undefined}
            commitmentRating={minC ?? undefined}
            hideUnknown
          />+
        </>
      ),
    });
  }

  // Canyon type rules
  const typeRule = rules.find(r => r.RuleType === 'canyon_type' && !r.IsExclusion);
  if (typeRule?.IntValues) {
    const types = typeRule.IntValues.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    const label = types.map(n => GetCanyonTypeDisplayName(n as any)).join(', ');
    criteriaItems.push({ key: 'type', node: label });
  }

  // First-time rule
  if (rules.some(r => r.RuleType === 'first_time' && !r.IsExclusion)) {
    criteriaItems.push({ key: 'firsttime', node: t('goals.firstTimeOnly') });
  }

  // Region scope (from Goals.RegionId, not rules)
  if (requirement.RegionId != null) {
    const name = regionNames?.[requirement.RegionId] ?? `Region ${requirement.RegionId}`;
    criteriaItems.push({ key: 'region', node: name });
  }

  // Time window
  if (requirement.RollingDays) {
    criteriaItems.push({ key: 'rolling', node: t('goals.lastNDays', { days: requirement.RollingDays }) });
  } else if (requirement.StartDate) {
    criteriaItems.push({
      key: 'date',
      node: t('goals.dateFrom', { date: new Date(requirement.StartDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) }),
    });
  }

  const hasCriteria = criteriaItems.length > 0 || (tagNames?.length ?? 0) > 0;

  return (
    <Box display="flex" alignItems="center" gap={1.5} sx={{ flexWrap: 'wrap' }}>
      {/* Label + criteria */}
      <Box sx={{ flex: '1 1 140px', minWidth: 0 }}>
        {onTitleClick ? (
          <Link
            component="button"
            variant="body2"
            fontWeight={500}
            onClick={onTitleClick}
            underline="always"
            noWrap
            title={requirement.Label}
            sx={{ display: 'block', maxWidth: '100%', textAlign: 'left' }}
          >
            {requirement.Label}
          </Link>
        ) : (
          <Typography variant="body2" fontWeight={500} noWrap title={requirement.Label}>
            {requirement.Label}
          </Typography>
        )}
        {hasCriteria && (
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5} mt={0.25}>
            {criteriaItems.map((item, i) => (
              <Typography key={item.key} variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {i > 0 && <span style={{ marginRight: 4 }}>·</span>}
                {item.node}
              </Typography>
            ))}
            {tagNames?.map(name => (
              <Chip key={name} label={name} size="small" sx={{ height: 16, fontSize: '0.65rem' }} />
            ))}
          </Box>
        )}
      </Box>

      {/* Progress bar with checkmark badge at the end */}
      <Box
        display="flex"
        alignItems="center"
        sx={{ flex: '0 0 auto', width: { xs: '100%', sm: 220 }, position: 'relative' }}
      >
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ width: '100%', height: 8, borderRadius: 4 }}
          color={isComplete ? 'success' : 'info'}
        />
        {onMarkComplete && isComplete && (
          <Tooltip title={t('goals.markComplete')}>
            <IconButton
              size="small"
              color="success"
              onClick={onMarkComplete}
              disabled={isCompleting}
              sx={{
                position: 'absolute',
                right: -14,
                top: '50%',
                transform: 'translateY(-50%)',
                p: 0,
                border: '2px solid',
                borderColor: 'background.paper',
                borderRadius: '50%',
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.paper' },
              }}
            >
              {isCompleting ? <CircularProgress size={16} /> : <CheckCircleIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Count */}
      <Typography variant="caption" color="text.secondary" sx={{ flex: '0 0 auto', width: 100, textAlign: 'right', whiteSpace: 'nowrap', textAlign: 'left', marginLeft: 1 }}>
        {requirement.CurrentCount ?? 0} / {target} {unitLabel}
      </Typography>
    </Box>
  );
};

export default GoalProgressBar;
