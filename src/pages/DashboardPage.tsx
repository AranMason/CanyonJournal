import React, { useState } from 'react';
import PageTemplate from './PageTemplate';
import { Button, Typography } from '@mui/material';
import { useUser } from '../App';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import DashboardStats from '../components/DashboardStats';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';
import { useCanyonRecords } from '../hooks/useCanyonRecords';

const DashboardPage: React.FC = () => {

  const navigate = useNavigate();
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
    <PageTemplate pageTitle="Dashboard" isLoading={loading || isLoading}>

      <Button variant="contained" color="primary" onClick={() => navigate("/journal/record")} sx={{ mb: 3 }} startIcon={<EditNoteIcon/>}>Record Descent</Button>
      <DashboardStats />
      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Recent Descents
      </Typography>
      {records.length === 0 ? (<div>No Records</div>) : (

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
