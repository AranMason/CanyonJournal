import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Typography } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { UserCanyonWithDescents } from '../types/UserCanyon';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRating from '../components/CanyonRating';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import { GetRegionDisplayName } from '../heleprs/EnumMapper';
import RegionType from '../types/RegionEnum';

const UserCanyonOverviewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const userCanyonId = id ? parseInt(id, 10) : undefined;
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [canyonData, setCanyonData] = useState<UserCanyonWithDescents>();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(sectionOpen === id ? null : id);
  }

  useEffect(() => {
    if (!userCanyonId) return;
    setIsLoading(true);
    Promise.all([
      apiFetch<UserCanyonWithDescents>(`/api/user-canyons/${userCanyonId}`).then(setCanyonData),
      apiFetch<{ records: CanyonRecord[] }>(`/api/record?userCanyon=${userCanyonId}`).then(res => setRecords(res.records))
    ]).finally(() => setIsLoading(false));
  }, [userCanyonId]);

  return (
    <PageTemplate pageTitle={canyonData?.Name ?? 'Canyon'} isLoading={isLoading} isAuthRequired>
      <Typography variant="h5">
        <Box display="flex" alignContent="center" gap={2} py={2} justifyContent="space-between">
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              <Chip label="Custom Canyon" size="small" variant="outlined" />
            </Box>
            <div>{GetRegionDisplayName(canyonData?.Region ?? RegionType.Unknown)}</div>
            <CanyonRating
              verticalRating={canyonData?.VerticalRating}
              aquaticRating={canyonData?.AquaticRating}
              commitmentRating={canyonData?.CommitmentRating}
              starRating={canyonData?.StarRating}
              isUnrated={canyonData?.IsUnrated ?? true}
            />
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <Button type="button" variant="contained" onClick={() => navigate(`/journal/record?userCanyonId=${userCanyonId}`)} startIcon={<EditNoteIcon />}>
              Record Descent
            </Button>
            {canyonData?.Url && (
              <Button type="button" variant="outlined" href={canyonData.Url} target="_blank" rel="noopener noreferrer" startIcon={<LocationPinIcon />}>
                Reference
              </Button>
            )}
          </Box>
        </Box>
      </Typography>
      {canyonData?.Notes && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Notes</Typography>
          <Typography variant="body2" whiteSpace="pre-line" fontStyle="italic" pl={1}>
            {canyonData.Notes}
          </Typography>
        </Box>
      )}
      <Typography variant="h4" my={2}>
        {`Your Trips (${records.length})`}
      </Typography>
      {records.length === 0 ? (
        <div>No Records</div>
      ) : (
        records.map(rec => (
          <CanyonRecordAccordion
            key={rec.Id}
            isOpen={sectionOpen === rec.Id}
            onChange={() => handleAccordionToggle(rec.Id ?? null)}
            record={rec}
          />
        ))
      )}
    </PageTemplate>
  );
};

export default UserCanyonOverviewPage;
