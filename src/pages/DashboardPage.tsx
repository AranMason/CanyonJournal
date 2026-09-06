import React, { useEffect, useState } from 'react';
import PageTemplate from './PageTemplate';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useUser } from '../App';
import CanyonRecordAccordion from '../components/canyons/CanyonRecordAccordion';
import DashboardStats from '../components/dashboard/DashboardStats';
import GoalsWidget from '../components/goals/GoalsWidget';
import CreateIcon from '@mui/icons-material/Create';
import { useNavigate } from 'react-router-dom';
import { useCanyonRecords } from '../hooks/useCanyonRecords';
import { useTranslation } from 'react-i18next';
import { getRecordsForDashboard } from '../helpers/RecordDataStore';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ChangeLogModal from '../components/ChangeLogModal';
import DashboardGearServiceWidget from '../components/dashboard/DashboardGearServiceWidget ';
import EmptyCellCta from '../components/EmptyCellCta';

const DashboardPage: React.FC = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading } = useUser();
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);

  const { records, canyonsById, userCanyonsById, isLoading } = useCanyonRecords(
    getRecordsForDashboard,
    !loading && Boolean(user)
  );

  function handleAccordionToggle(id: number | null) {
    setSectionOpen(prev => prev === id ? null : id);
  }

  useEffect(() => {
    if (!user?.id && !isLoading && !loading) {
      navigate('/login');
    }
  }, [user, isLoading, loading, navigate]);

  if (!user?.id && !isLoading && !loading) {
    return null;
  }

  return (
    <PageTemplate pageTitle={t('dashboard.title')} isLoading={loading || isLoading}>
      <ChangeLogModal open={isChangeLogOpen} onClose={() => setIsChangeLogOpen(false)} />
      <Box sx={{ mb: 3, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/journal/record")} startIcon={<CreateIcon />}>{t('common:actions.recordDescent')}</Button>
        <Button startIcon={<NotificationsActiveIcon />} onClick={() => setIsChangeLogOpen(true)}>Change Log</Button>
      </Box>
      <DashboardStats />
      <GoalsWidget />
      <DashboardGearServiceWidget />
      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        {t('dashboard.recentDescents')}
      </Typography>

      {records.length === 0 ? (<Paper sx={{ borderLeft: 2, borderColor: 'secondary.main' }}>
        <EmptyCellCta
          description={t('journal.noRecords')}
          cta={t('common:actions.recordDescent')}
          ctaIcon={<CreateIcon />}
          ctaAction={() => navigate("/journal/record")} />
      </Paper>) : (

        records.map(rec => {
          const canyon = rec.CanyonId ? canyonsById[rec.CanyonId] : rec.UserCanyonId ? userCanyonsById[rec.UserCanyonId] : undefined

          if (!canyon) return null;

          return <CanyonRecordAccordion
            key={rec.Id}
            isOpen={sectionOpen === rec.Id}
            onChange={() => handleAccordionToggle(rec.Id ?? null)}
            record={rec}
            canyon={canyon} />
        })
      )}
    </PageTemplate>
  );
};

export default DashboardPage;


