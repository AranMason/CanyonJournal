import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FavouriteButton from './FavouriteButton';
import CanyonRating from './CanyonRating';
import CanyonTypeDisplay from './CanyonTypeDisplay';
import { GetRegionDisplayName } from '../helpers/EnumMapper';
import { CanyonTypeEnum } from '../types/CanyonTypeEnum';
import RegionType from '../types/RegionEnum';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface CanyonPageHeaderProps {
  isFavourite: boolean;
  onToggleFavourite: () => void;
  region?: RegionType;
  verticalRating?: number;
  aquaticRating?: number;
  commitmentRating?: number;
  starRating?: number;
  isUnrated?: boolean;
  recordUrl: string;
  url?: string | null;
  urlLabel?: string;
  isVerified?: boolean;
  isCustom?: boolean;
  canyonType?: CanyonTypeEnum;
  notes?: string | null;
  sourceName?: string | null;
  sourceLogoUrl?: string | null;
}

const CanyonPageHeader: React.FC<CanyonPageHeaderProps> = ({
  isFavourite,
  onToggleFavourite,
  region,
  verticalRating,
  aquaticRating,
  commitmentRating,
  starRating,
  isUnrated,
  recordUrl,
  url,
  urlLabel,
  sourceName,
  sourceLogoUrl,
  canyonType,
  notes,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const resolvedUrlLabel = urlLabel ?? sourceName ?? t('common:fields.source');

  return (
    <>
      <Box display="flex" alignContent="center" gap={2} justifyContent="space-between">
        <Box flex={1}>
          <Box display={'flex'} flexDirection={'row'}>
            <CanyonRating
              verticalRating={verticalRating}
              aquaticRating={aquaticRating}
              commitmentRating={commitmentRating}
              starRating={starRating}
              isUnrated={isUnrated}
            />
            &nbsp;|&nbsp;
            {canyonType !== undefined && (
              <CanyonTypeDisplay type={canyonType} />
            )}
            &nbsp;|&nbsp;
            <Typography variant="body1">{GetRegionDisplayName(region ?? RegionType.Unknown)}</Typography>
            
          </Box>

          <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ mb: 1, mt: 3 }}>
            <Box display={'flex'} flexDirection={'row'} alignItems={'center'} gap={1} justifyContent={'space-between'}>
            {url && (
              <Button
                type="button"
                variant="outlined"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={
                  sourceLogoUrl
                    ? <img src={sourceLogoUrl} alt={resolvedUrlLabel} style={{ height: 16, width: 16, objectFit: 'contain' }} />
                    : <OpenInNewIcon />
                }
              >
                {resolvedUrlLabel}
              </Button>
            )}
            <FavouriteButton isFavourite={isFavourite} onToggle={onToggleFavourite} />
            </Box>
            <Box display="flex" alignItems="flex-start">
              <Button type="button" variant="contained" onClick={() => navigate(recordUrl)} startIcon={<EditNoteIcon />}>
                {t('common:actions.recordDescent')}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
      {notes && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>{t('common:fields.notes')}</Typography>
          <Typography variant="body2" whiteSpace="pre-line" fontStyle="italic" pl={1}>
            {notes}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default CanyonPageHeader;
