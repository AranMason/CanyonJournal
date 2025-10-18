import React, { useEffect, useState } from 'react';
import PageTemplate from './PageTemplate';
import { Typography } from '@mui/material';
import { CanyonRecord } from '../types/CanyonRecord';
import { useUser } from '../App';
import { apiFetch } from '../utils/api';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import { loadById } from '../heleprs/CanyonDataStore';
import { Canyon } from '../types/Canyon';
import DashboardStats from '../components/DashboardStats';

const DashboardPage: React.FC = () => {

  const { user, loading } = useUser();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);
  const [canyonsById, setCanyonsById] = useState<{ [key: number]: Canyon }>({})

  useEffect(() => {
    const fetchRecords = async () => {
    
        const [data, dataCanyonsById] = await Promise.all([
          apiFetch<{ records: CanyonRecord[] }>('/api/record?max=10'),
          loadById()
        ])

        setRecords(data.records || []);
        setCanyonsById(dataCanyonsById)
      
    };
    if (user && !loading) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [user, loading]);

  function handleAccordionToggle(id: number | null) {

    if (!id || sectionOpen === id) {
      setSectionOpen(null);
    } else {
      setSectionOpen(id);
    }
  }

  return (
    <PageTemplate pageTitle="Canyon Journal" isLoading={loading}>

      <DashboardStats />
      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Recent Descents
      </Typography>
      {records.length === 0 ? (<div>No Records</div>) : (

        records.map(rec => (
          <CanyonRecordAccordion
            isOpen={sectionOpen === rec.Id}
            onChange={() => handleAccordionToggle(rec.Id ?? null)}
            record={rec}
            canyon={rec.CanyonId ? canyonsById[rec.CanyonId] : undefined} />
        ))
      )}
    </PageTemplate>
  );
};

export default DashboardPage;
