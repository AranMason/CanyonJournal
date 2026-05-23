import React, { useState } from 'react';
import PageTemplate from './PageTemplate';
import { Button, Typography } from '@mui/material';
import { useUser } from '../App';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import DashboardStats from '../components/DashboardStats';
import GoalsWidget from '../components/GoalsWidget';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';
import { useCanyonRecords } from '../hooks/useCanyonRecords';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading } = useUser();
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);

  const { records, canyonsById, userCanyonsById, isLoading } = useCanyonRecords(
    '/api/record?max=10',
    !loading && Boolean(user)
  );

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(prev => prev === id ? null : id);
  }

  return (
    <PageTemplate pageTitle={t('dashboard.title')} isLoading={loading || isLoading}>

      <Button variant="contained" color="tertiary" onClick={() => navigate("/journal/record")} sx={{ mb: 3 }} startIcon={<EditNoteIcon/>}>{t('common:actions.recordDescent')}</Button>
      <DashboardStats />
      <GoalsWidget />
      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        {t('dashboard.recentDescents')}
      </Typography>
      {records.length === 0 ? (<div>{t('journal.noRecords')}</div>) : (

        records.map(rec => (
          <CanyonRecordAccordion
            key={rec.Id}
            isOpen={sectionOpen === rec.Id}
            onChange={() => handleAccordionToggle(rec.Id ?? null)}
            record={rec}
            canyon={rec.CanyonId ? canyonsById[rec.CanyonId] : rec.UserCanyonId ? userCanyonsById[rec.UserCanyonId] : undefined} />
        ))
      )}
    </PageTemplate>
  );
};

export default DashboardPage;


