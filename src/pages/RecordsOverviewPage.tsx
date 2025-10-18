import React, { useEffect, useState } from 'react';
import {  Box, Button } from '@mui/material';
import { apiFetch } from '../utils/api';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRecordAccordion from '../components/CanyonRecordAccordion/CanyonRecordAccordion';
import { Canyon } from '../types/Canyon';
import { loadById } from '../heleprs/CanyonDataStore';

type CanyonDict = {[n: number]: Canyon};

const RecordsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: loadingUser } = useUser();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [canyonsById, setCanyonsById] = useState<CanyonDict>({});
  const [isLoading, setIsLoading] = useState(false);
  const [sectionOpen, setSectionOpen] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)

      const [data, canyons] = await Promise.all([
          apiFetch<{ records: CanyonRecord[] }>('/api/record'),
          loadById()
      ])
      setRecords(data.records || []);

      setCanyonsById(canyons);

      setIsLoading(false);
    };

    if (user && (!isLoading || !loadingUser)) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleAccordionToggle(id: number | null) {

    if(!id || sectionOpen === id) {
      setSectionOpen(null);
    } else {
      setSectionOpen(id);
    }
  }


  return (
    <PageTemplate pageTitle="Your Journal" isAuthRequired isLoading={isLoading}>
      <Box>
        <Button sx={{my: 2}} variant='contained' onClick={() => navigate('/journal/record')}>Add Entry</Button>

        {records.length === 0 ? (<div>No Records</div>) : (

          records.map(rec => (
            <CanyonRecordAccordion 
                isOpen={sectionOpen === rec.Id}
                onChange={() => handleAccordionToggle(rec.Id ?? null)}
                record={rec}
                canyon={rec.CanyonId ? canyonsById[rec.CanyonId] : undefined} />
          ))
        )}
      </Box>
    </PageTemplate>
  );
};

export default RecordsOverviewPage;
