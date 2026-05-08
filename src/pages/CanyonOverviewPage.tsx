import React, { useEffect, useState } from 'react'
import { Canyon } from '../types/Canyon';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRating from '../components/CanyonRating';
import { Box, Button, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import { GetRegionDisplayName } from '../helpers/EnumMapper';
import RegionType from '../types/RegionEnum';
import CanyonTypeDisplay from '../components/CanyonTypeDisplay';
import { CanyonTypeEnum } from '../types/CanyonTypeEnum';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const CanyonOverviewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const canyonId = id ? parseInt(id, 10) : undefined;

  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canyonData, setCanyonData] = useState<Canyon>();
  const [canyonRecords, setCanyonVisitData] = useState<CanyonRecord[]>([]);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);

  function handleAccordionToggle(id: number | null) {

    if (!id || sectionOpen === id) {
      setSectionOpen(null);
    } else {
      setSectionOpen(id);
    }
  }

  const toggleFavourite = async () => {
    const next = !isFavourite;
    setIsFavourite(next);
    try {
      await apiFetch('/api/favourites', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ CanyonId: canyonId }),
      });
    } catch {
      setIsFavourite(!next);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      const fetchMeta = apiFetch<Canyon>(`/api/canyons/${canyonId}`).then(setCanyonData);
      const fetchUser = apiFetch<{ records: CanyonRecord[] }>(`/api/record?canyon=${canyonId}`).then((res) => setCanyonVisitData(res.records));
      const fetchFavourites = apiFetch<{ CanyonId: number | null; UserCanyonId: number | null }[]>('/api/favourites')
        .then(favs => setIsFavourite(favs.some(f => f.CanyonId === canyonId)));

      Promise.all([fetchMeta, fetchUser, fetchFavourites]).finally(() => setIsLoading(false))
    }
  }, [canyonId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <PageTemplate pageTitle={canyonData?.Name ?? 'Canyon'} isLoading={isLoading} isAuthRequired>
    <Typography variant="h5">
      <Box display="flex" alignContent="center" gap={2} py={2} justifyContent="space-between">
        <Box>
          <Box display="flex" alignItems="center" gap={0.5} sx={{ mb: 1 }}>
            <Tooltip title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}>
              <IconButton onClick={toggleFavourite} color="error" size="small" sx={{ p: 0.25 }}>
                {isFavourite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            {canyonData?.IsVerified && (
              <Chip icon={<CheckCircleIcon />} label="Verified" size="small" color="success" variant="outlined" />
            )}
          </Box>
          <div>
            {GetRegionDisplayName(canyonData?.Region ?? RegionType.Unknown)}
          </div>
          <CanyonTypeDisplay type={canyonData?.CanyonType ?? CanyonTypeEnum.Unknown} />
          <CanyonRating verticalRating={canyonData?.VerticalRating} aquaticRating={canyonData?.AquaticRating} commitmentRating={canyonData?.CommitmentRating} starRating={canyonData?.StarRating} />
        </Box>
        <Box display="flex" flexDirection="column" gap={1} alignItems="flex-end">
          <Button type="button" variant='contained' onClick={() => navigate(`/journal/record?canyonId=${canyonId}`)} startIcon={<EditNoteIcon/>}>Record Descent</Button>
          {canyonData?.Url ? <Button type='button' variant="outlined" href={canyonData?.Url} target="_blank" rel="noopener noreferrer" startIcon={<LocationPinIcon/>}>
            Canyon Log
          </Button> : null}
        </Box>
      </Box>
    </Typography>
    <Typography variant='h4' my={2}>
      {`Your Trips (${canyonRecords.length})`}
    </Typography>
    {canyonRecords.length === 0 ? (<div>No Records</div>) : (

      canyonRecords.map(rec => (
        <CanyonRecordAccordion
          isOpen={sectionOpen === rec.Id}
          onChange={() => handleAccordionToggle(rec.Id ?? null)}
          record={rec}
          canyon={canyonData} />
      ))
    )}
  </PageTemplate>;
}

export default CanyonOverviewPage;