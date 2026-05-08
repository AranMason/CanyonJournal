import React from 'react';
import { Box, Button, Chip, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import FavouriteButton from './FavouriteButton';
import CanyonRating from './CanyonRating';
import CanyonTypeDisplay from './CanyonTypeDisplay';
import { GetRegionDisplayName } from '../helpers/EnumMapper';
import { CanyonTypeEnum } from '../types/CanyonTypeEnum';
import RegionType from '../types/RegionEnum';
import { useNavigate } from 'react-router-dom';

interface CanyonPageHeaderProps {
  isFavourite: boolean;
  onToggleFavourite: () => void;
  region?: RegionType;
  /** Canyon grade fields */
  verticalRating?: number;
  aquaticRating?: number;
  commitmentRating?: number;
  starRating?: number;
  isUnrated?: boolean;
  /** URL to navigate to when "Record Descent" is clicked */
  recordUrl: string;
  /** External reference URL (Canyon Log, etc.) */
  url?: string | null;
  /** Label for the external link button */
  urlLabel?: string;
  /** Show the "Verified" chip */
  isVerified?: boolean;
  /** Show the "Custom Canyon" chip */
  isCustom?: boolean;
  /** Optional canyon type (shown for verified canyons) */
  canyonType?: CanyonTypeEnum;
  /** Optional notes block (shown for custom canyons) */
  notes?: string | null;
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
  urlLabel = 'Reference',
  isVerified,
  isCustom,
  canyonType,
  notes,
}) => {
  const navigate = useNavigate();

  return (
  <>
    <Typography variant="h5">
      <Box display="flex" alignContent="center" gap={2} py={2} justifyContent="space-between">
        <Box>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
            <FavouriteButton isFavourite={isFavourite} onToggle={onToggleFavourite} />
            {isVerified && (
              <Chip icon={<CheckCircleIcon />} label="Verified" size="small" color="success" variant="outlined" />
            )}
            {isCustom && (
              <Chip label="Custom Canyon" size="small" variant="outlined" />
            )}
          </Box>
          <div>{GetRegionDisplayName(region ?? RegionType.Unknown)}</div>
          {canyonType !== undefined && (
            <CanyonTypeDisplay type={canyonType} />
          )}
          <CanyonRating
            verticalRating={verticalRating}
            aquaticRating={aquaticRating}
            commitmentRating={commitmentRating}
            starRating={starRating}
            isUnrated={isUnrated}
          />
        </Box>
        <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
          <Button type="button" variant="contained" onClick={() => navigate(recordUrl)} startIcon={<EditNoteIcon />}>
            Record Descent
          </Button>
          {url && (
            <Button type="button" variant="outlined" href={url} target="_blank" rel="noopener noreferrer" startIcon={<LocationPinIcon />}>
              {urlLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Typography>
    {notes && (
      <Box mb={2}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notes</Typography>
        <Typography variant="body2" whiteSpace="pre-line" fontStyle="italic" pl={1}>
          {notes}
        </Typography>
      </Box>
    )}
  </>
  );
};

export default CanyonPageHeader;
