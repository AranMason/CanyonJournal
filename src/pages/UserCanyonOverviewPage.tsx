import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { UserCanyonWithDescents } from '../types/UserCanyon';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import CanyonPageHeader from '../components/CanyonPageHeader';
import { useFavourite } from '../hooks/useFavourite';

const UserCanyonOverviewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const userCanyonId = id ? parseInt(id, 10) : undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [canyonData, setCanyonData] = useState<UserCanyonWithDescents>();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  const { isFavourite, toggleFavourite } = useFavourite({ userCanyonId });

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(sectionOpen === id ? null : id);
  }

  useEffect(() => {
    if (!userCanyonId) return;
    setIsLoading(true);
    Promise.all([
      apiFetch<UserCanyonWithDescents>(`/api/user-canyons/${userCanyonId}`).then(setCanyonData),
      apiFetch<{ records: CanyonRecord[] }>(`/api/record?userCanyon=${userCanyonId}`).then(res => setRecords(res.records)),
    ]).finally(() => setIsLoading(false));
  }, [userCanyonId]);

  return (
    <PageTemplate pageTitle={canyonData?.Name ?? 'Canyon'} isLoading={isLoading} isAuthRequired>
      <CanyonPageHeader
        isFavourite={isFavourite}
        onToggleFavourite={toggleFavourite}
        region={canyonData?.Region}
        verticalRating={canyonData?.VerticalRating}
        aquaticRating={canyonData?.AquaticRating}
        commitmentRating={canyonData?.CommitmentRating}
        starRating={canyonData?.StarRating}
        isUnrated={canyonData?.IsUnrated ?? true}
        recordUrl={`/journal/record?userCanyonId=${userCanyonId}`}
        url={canyonData?.Url}
        isCustom
        notes={canyonData?.Notes}
      />
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
