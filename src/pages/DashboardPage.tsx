import React, { useEffect, useState } from 'react';
import PageTemplate from './PageTemplate';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { CanyonRecord } from '../types/CanyonRecord';
import { DashboardWidget } from '../types/Widgets';
import { useUser } from '../App';
import StatCard from '../components/StatCard';
import { apiFetch } from '../utils/api';
import TeamSizeTableCell from '../components/table/TeamSizeTableCell';
import WaterLevelTableCell from '../components/table/WaterLevelTableCell';
import DateTableCell from '../components/table/DateTableCell';
import EditRecordTableCell from '../components/table/EditRecordTableCell';
import CanyonNameTableCell from '../components/table/CanyonNameCell';

// Column size definitions
const COLUMN_WIDTHS = {
  date: 120,
  name: 120, // auto
  teamSize: 80,
  waterLevel: 80,
  comments: undefined, // auto
};

const DashboardPage: React.FC = () => {
  const { user, loading } = useUser();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadTotalDescents = async (): Promise<number> => {
    return await apiFetch<number>(`/api/dashboard/${DashboardWidget.TotalDescents}`);
  }

  const loadUniqueDescents = async (): Promise<number> => {
    return await apiFetch<number>(`/api/dashboard/${DashboardWidget.UniqueDescents}`);
  }

  const loadRecentDescents = async (): Promise<number> => {
    return await apiFetch<number>(`/api/dashboard/${DashboardWidget.RecentDescents}`);
  }

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await apiFetch<{ records: CanyonRecord[] }>('/api/record?max=10');
        setRecords(data.records || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching records');
      }
    };
    if (user && !loading) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [user, loading]);

  return (
    <PageTemplate pageTitle="Canyon Journal" isLoading={loading}>
      {(!user && !loading) ? (
        <Typography>Please log in to view your canyon records.</Typography>
      ) : loading ? (
        <Typography>Loading records...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <StatCard title="Total Descents" getData={loadTotalDescents}>
              {(data) => <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {data}
              </Typography>}
            </StatCard>
            <StatCard title="Unique Canyons Descended" getData={loadUniqueDescents}>
              {(data) => <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {data}
              </Typography>}
            </StatCard>
            <StatCard title="Last 6 Months" getData={loadRecentDescents}>
              {(data) => <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {data}
              </Typography>}
            </StatCard>
          </Box>
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Recent Descents
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: COLUMN_WIDTHS.date, fontSize: 13 }}>Date Descended</TableCell>
                  <TableCell>Canyon</TableCell>
                  <TableCell sx={{ width: COLUMN_WIDTHS.teamSize, fontSize: 13 }}>Team Size</TableCell>
                  <TableCell sx={{ width: COLUMN_WIDTHS.waterLevel, fontSize: 13 }}>Water Level</TableCell>
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
                      <DateTableCell date={rec.Date} />
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
        </>
      )}
    </PageTemplate>
  );
};

export default DashboardPage;
