import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button } from '@mui/material';
import { apiFetch } from '../utils/api';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { CanyonRecord, WaterLevel } from '../types/CanyonRecord';
import RowActions from '../components/RowActions';
import GroupsIcon from '@mui/icons-material/Groups';
import WaterLevelRating from '../components/WaterLevelRating';


// Column size definitions
const COLUMN_WIDTHS = {
  date: 120,
  name: 120, // auto
  teamSize: 80,
  waterLevel: 80,
  comments: undefined, // auto
};




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
                  <TableCell sx={{ width: COLUMN_WIDTHS.date, fontSize: 13 }}>
                    {rec.Date ? (
                      <Box sx={{ fontWeight: 500, color: 'primary.main', letterSpacing: 1 }}>
                        {new Date(rec.Date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    {rec.CanyonId ? <Link onClick={() => navigate(`/canyons/${rec.CanyonId}`)} sx={{ cursor: 'pointer' }}>{rec.Name}</Link> : rec.Name}
                  </TableCell>
                  <TableCell align="center" sx={{ width: COLUMN_WIDTHS.teamSize, fontSize: 13 }}>
                    <Box display="flex" flexDirection="row" alignItems={"center"} gap={1}>
                      <GroupsIcon sx={{height: "1rem", width: "1rem"}}/>
                      {rec.TeamSize}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: COLUMN_WIDTHS.waterLevel, fontSize: 13 }}>
                    <WaterLevelRating waterLevel={rec.WaterLevel ?? WaterLevel.Unknown}/>
                  </TableCell>
                  <TableCell>{rec.Comments || '-'}</TableCell>
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
                    <RowActions
                      onEdit={() => navigate(`/journal/record/${rec.Id} `)}
                    />
                  </TableCell>
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
