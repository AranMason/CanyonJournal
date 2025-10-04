import React, { useEffect, useState } from 'react';
import PageTemplate from './PageTemplate';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import { CanyonRecord, WaterLevel } from '../types/CanyonRecord';
import { useUser } from '../App';
import StatCard from '../components/StatCard';
import { apiFetch } from '../utils/api';
import RowActions from '../components/RowActions';
import { useNavigate } from 'react-router-dom';

// Column size definitions
const COLUMN_WIDTHS = {
  date: 120,
  name: 120, // auto
  teamSize: 80,
  waterLevel: 80,
  comments: undefined, // auto
};

const WaterLevelDisplay: { [key in WaterLevel | 0]: string } = {
  // eslint-disable-next-line
  [0]: '-',
  [WaterLevel.VeryLow]: 'Very Low',
  [WaterLevel.Low]: 'Low',
  [WaterLevel.Medium]: 'Medium',
  [WaterLevel.High]: 'High',
  [WaterLevel.VeryHigh]: 'Very High'
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

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
            <StatCard title="Total Descents">
              <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {records.length}
              </Typography>
            </StatCard>
            <StatCard title="Unique Canyons Descended">
              <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {Array.from(new Set(records.map(r => r.Name))).length}
              </Typography>
            </StatCard>
            <StatCard title="Last 6 Months">
              <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
                {records.filter(r => {
                  const sixMonthsAgo = new Date();
                  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                  return new Date(r.Date) >= sixMonthsAgo;
                }).length}
              </Typography>
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
                    <TableRow key={idx}>
                      <TableCell sx={{ width: COLUMN_WIDTHS.date, fontSize: 13 }}>
                        {rec.Date ? (
                          <Box sx={{ fontWeight: 500, color: 'primary.main', letterSpacing: 1 }}>
                            {new Date(rec.Date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {rec.Name}
                      </TableCell>
                      <TableCell align="center" sx={{ width: COLUMN_WIDTHS.teamSize, fontSize: 13 }}>{rec.TeamSize}</TableCell>
                      <TableCell sx={{ width: COLUMN_WIDTHS.waterLevel, fontSize: 13 }}>{WaterLevelDisplay[rec.WaterLevel ?? 0]}</TableCell>
                      <TableCell>{rec.Comments || '-'}</TableCell>
                      <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
                        <RowActions
                          onEdit={() => navigate(`/record/${rec.Id} `)}
                        />
                      </TableCell>
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
