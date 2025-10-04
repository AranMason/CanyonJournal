import React, { useEffect, useState } from 'react'
import { Canyon } from '../types/Canyon';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { useNavigate, useParams } from 'react-router-dom';
import { CanyonRecord, WaterLevel } from '../types/CanyonRecord';
import CanyonRating from '../components/CanyonRating';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import RowActions from '../components/RowActions';

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

const CanyonOverviewPage: React.FC = () => {
    const { id } = useParams<{id?: string}>();
    const canyonId = id ? parseInt(id, 10) : undefined;

    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [canyonData, setCanyonData] = useState<Canyon>();
    const [canyonRecords, setCanyonVisitData] = useState<CanyonRecord[]>([]);

    useEffect(() => {
        if(!isLoading) {
            setIsLoading(true);
            const fetchMeta = apiFetch<Canyon>(`/api/canyons/${canyonId}`).then(setCanyonData);
            const fetchUser = apiFetch<{records: CanyonRecord[]}>(`/api/record?canyon=${canyonId}`).then((res) => setCanyonVisitData(res.records));

            Promise.all([fetchMeta, fetchUser]).finally(() => setIsLoading(false))
        }
    }, [canyonId])

    return <PageTemplate pageTitle={canyonData?.Name ?? 'Canyon'} isLoading={isLoading} isAuthRequired>
        <Typography variant="h5">
        <Box display="flex" alignContent="center" gap={2} py={2} justifyContent="space-between">
    
            <CanyonRating verticalRating={canyonData?.VerticalRating} aquaticRating={canyonData?.AquaticRating} commitmentRating={canyonData?.CommitmentRating} starRating={canyonData?.StarRating} />
 

        <div>
            {canyonData?.Url ? <Button type='button' variant="outlined" href={canyonData?.Url} target="_blank" rel="noopener noreferrer">
                    Visit Canyon Log
                  </Button> : '-'}
        </div>
        </Box>
        </Typography>
        <Typography variant='h4' my={2}>
            {`Your Trips (${canyonRecords.length})`}
        </Typography>
        <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: COLUMN_WIDTHS.date, fontSize: 13 }}>Date Descended</TableCell>
                  <TableCell sx={{ width: COLUMN_WIDTHS.teamSize, fontSize: 13 }}>Team Size</TableCell>
                  <TableCell sx={{ width: COLUMN_WIDTHS.waterLevel, fontSize: 13 }}>Water Level</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {canyonRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No canyon records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  canyonRecords.map((rec, idx) => (
                    <TableRow key={idx}>
                      <TableCell sx={{ width: COLUMN_WIDTHS.date, fontSize: 13 }}>
                        {rec.Date ? (
                          <Box sx={{ fontWeight: 500, color: 'primary.main', letterSpacing: 1 }}>
                            {new Date(rec.Date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell sx={{ width: COLUMN_WIDTHS.teamSize, fontSize: 13 }}>{rec.TeamSize}</TableCell>
                      <TableCell sx={{ width: COLUMN_WIDTHS.waterLevel, fontSize: 13 }}>{WaterLevelDisplay[rec.WaterLevel ?? 0]}</TableCell>
                      <TableCell>{rec.Comments || '-'}</TableCell>
                      <TableCell align="center" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
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
    </PageTemplate>;
}

export default CanyonOverviewPage;