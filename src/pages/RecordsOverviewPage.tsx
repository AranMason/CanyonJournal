import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { apiFetch } from '../utils/api';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import DateTableCell from '../components/table/DateTableCell';
import TeamSizeTableCell from '../components/table/TeamSizeTableCell';
import EditRecordTableCell from '../components/table/EditRecordTableCell';
import CanyonNameTableCell from '../components/table/CanyonNameCell';
import WaterLevelTableCell from '../components/table/WaterLevelTableCell';

const RecordsOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: loadingUser } = useUser();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      setIsLoading(true)
      const data = await apiFetch<{ records: CanyonRecord[] }>('/api/record');
      setRecords(data.records || []);
      setIsLoading(false);
    };

    if (user && (!isLoading || !loadingUser)) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [user]);


  return (
    <PageTemplate pageTitle="Your Journal" isAuthRequired isLoading={isLoading}>
      <Button sx={{my: 2}} variant='contained' onClick={() => navigate('/journal/record')}>Add Entry</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date Descended</TableCell>
              <TableCell>Canyon</TableCell>
              <TableCell>Team Size</TableCell>
              <TableCell>Water Level</TableCell>
              <TableCell>Comments</TableCell>
              <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No canyon records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((rec, idx) => (
                <TableRow key={idx} >
                  <DateTableCell date={rec.Date}/>
                  <CanyonNameTableCell name={rec.Name} canyonId={rec.Id}/>
                  <TeamSizeTableCell teamSize={rec.TeamSize}/>
                  <WaterLevelTableCell waterLevelRating={rec.WaterLevel}/>
                  <TableCell>{rec.Comments || '-'}</TableCell>
                  <EditRecordTableCell recordId={rec.Id}/>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </PageTemplate>
  );
};

export default RecordsOverviewPage;
