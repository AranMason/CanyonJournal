import React, { ReactNode } from 'react';
import { Box, Chip, CircularProgress, IconButton, LinearProgress, Link, Tooltip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Goal } from '../types/Goal';
import CanyonRating from './CanyonRating';
import { useTranslation } from 'react-i18next';

interface GoalProgressBarProps {
  requirement: Goal;
  tagNames?: string[];
  onMarkComplete?: () => void;
  isCompleting?: boolean;
  onTitleClick?: () => void;
}

const GoalProgressBar: React.FC<GoalProgressBarProps> = ({ requirement, tagNames, onMarkComplete, isCompleting, onTitleClick }) => {
  const { t } = useTranslation();

  const progress = Math.min(((requirement.CurrentCount ?? 0) / requirement.MinCount) * 100, 100);
  const isComplete = progress >= 100;

  let unitLabel: string;
  if (requirement.CountMode === 'days') unitLabel = t('goals.daysLabel');
  else if (requirement.CountMode === 'distinct_canyons') unitLabel = t('common:terms.canyon.lower', { count: 2 });
  else unitLabel = t('goals.tripsLabel');

  // Criteria items — each is a ReactNode rendered inline with ' · ' separators
  const criteriaItems: { key: string; node: ReactNode }[] = [];

  // Count mode label
  if (requirement.CountMode === 'days') criteriaItems.push({ key: 'mode', node: t('goals.countModeDays') });
  else if (requirement.CountMode === 'distinct_canyons') criteriaItems.push({ key: 'mode', node: t('goals.countModeDistinctCanyons') });
  else criteriaItems.push({ key: 'mode', node: t('goals.countModeRecords') });

  // Rating — use CanyonRating with hideUnknown so only set minimums appear
  const hasRating = requirement.MinVerticalRating || requirement.MinAquaticRating || requirement.MinCommitmentRating;
  if (hasRating) {
    criteriaItems.push({
      key: 'rating',
      node: (
        <>
          <CanyonRating
            verticalRating={requirement.MinVerticalRating ?? undefined}
            aquaticRating={requirement.MinAquaticRating ?? undefined}
            commitmentRating={requirement.MinCommitmentRating ?? undefined}
            hideUnknown
          />+
        </>
      ),
    });
  }

  if (requirement.StartDate) {
    criteriaItems.push({
      key: 'date',
      node: `from ${new Date(requirement.StartDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}`,
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
      <Typography variant="caption" color="text.secondary" sx={{ flex: '0 0 auto', minWidth: 80, textAlign: 'right', whiteSpace: 'nowrap' }}>
        {requirement.CurrentCount ?? 0} / {requirement.MinCount} {unitLabel}
      </Typography>
    </Box>
  );
};

export default GoalProgressBar;
