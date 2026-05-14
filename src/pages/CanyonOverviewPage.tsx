import React, { useEffect, useState } from 'react'
import { Canyon } from '../types/Canyon';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { useParams } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import { Typography } from '@mui/material';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import CanyonPageHeader from '../components/CanyonPageHeader';
import { useFavourite } from '../hooks/useFavourite';
import { useTranslation } from 'react-i18next';

const CanyonOverviewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const canyonId = id ? parseInt(id, 10) : undefined;
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canyonData, setCanyonData] = useState<Canyon>();
  const [canyonRecords, setCanyonVisitData] = useState<CanyonRecord[]>([]);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  const { isFavourite, toggleFavourite } = useFavourite({ canyonId });

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(prev => prev === id ? null : id);
  }

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      const fetchMeta = apiFetch<Canyon>(`/api/canyons/${canyonId}`).then(setCanyonData);
      const fetchUser = apiFetch<{ records: CanyonRecord[] }>(`/api/record?canyon=${canyonId}`).then((res) => setCanyonVisitData(res.records));

      Promise.all([fetchMeta, fetchUser]).finally(() => setIsLoading(false))
    }
  }, [canyonId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <PageTemplate pageTitle={canyonData?.Name ?? t('common:terms.canyon.upper', { count: 1 })} isLoading={isLoading} isAuthRequired>
    <CanyonPageHeader
      isFavourite={isFavourite}
      onToggleFavourite={toggleFavourite}
      region={canyonData?.Region}
      verticalRating={canyonData?.VerticalRating}
      aquaticRating={canyonData?.AquaticRating}
      commitmentRating={canyonData?.CommitmentRating}
      starRating={canyonData?.StarRating}
      recordUrl={`/journal/record?canyonId=${canyonId}`}
      url={canyonData?.Url}
      isVerified={canyonData?.IsVerified}
      canyonType={canyonData?.CanyonType}
      sourceName={canyonData?.SourceName}
      sourceLogoUrl={canyonData?.SourceLogoUrl}
    />
    
    <Typography variant='h4' my={2} fontSize={24}>
      {`${t('canyon.yourDescents')} (${canyonRecords.length})`}
    </Typography>
    {canyonRecords.length === 0 ? (<div>{t('journal.noRecords')}</div>) : (
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
