import React, { useEffect, useState } from 'react'
import { Canyon } from '../types/Canyon';
import PageTemplate from './PageTemplate';
import { apiFetch } from '../utils/api';
import { useParams } from 'react-router-dom';
import { CanyonRecord } from '../types/CanyonRecord';
import CanyonRating from '../components/CanyonRating';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import WaterLevelTableCell from '../components/table/WaterLevelTableCell';
import TeamSizeTableCell from '../components/table/TeamSizeTableCell';
import DateTableCell from '../components/table/DateTableCell';
import EditRecordTableCell from '../components/table/EditRecordTableCell';
import { GetRegionDisplayName } from '../heleprs/EnumMapper';
import RegionType from '../types/RegionEnum';
import CanyonTypeDisplay from '../components/CanyonTypeDisplay';
import { CanyonTypeEnum } from '../types/CanyonTypeEnum';

const CanyonOverviewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const canyonId = id ? parseInt(id, 10) : undefined;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canyonData, setCanyonData] = useState<Canyon>();
  const [canyonRecords, setCanyonVisitData] = useState<CanyonRecord[]>([]);

  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      const fetchMeta = apiFetch<Canyon>(`/api/canyons/${canyonId}`).then(setCanyonData);
      const fetchUser = apiFetch<{ records: CanyonRecord[] }>(`/api/record?canyon=${canyonId}`).then((res) => setCanyonVisitData(res.records));

      Promise.all([fetchMeta, fetchUser]).finally(() => setIsLoading(false))
    }
  }, [canyonId]) // eslint-disable-line react-hooks/exhaustive-deps

  return <PageTemplate pageTitle={canyonData?.Name ?? 'Canyon'} isLoading={isLoading} isAuthRequired>
    <Typography variant="h5">
      <Box display="flex" alignContent="center" gap={2} py={2} justifyContent="space-between">
        <Box>
          <div>
            {GetRegionDisplayName(canyonData?.Region ?? RegionType.Unknown)}
          </div>
          <CanyonTypeDisplay type={canyonData?.CanyonType ?? CanyonTypeEnum.Unknown}/>
          <CanyonRating verticalRating={canyonData?.VerticalRating} aquaticRating={canyonData?.AquaticRating} commitmentRating={canyonData?.CommitmentRating} starRating={canyonData?.StarRating} />
        </Box>
        <div>
          {canyonData?.Url ? <Button type='button' variant="outlined" href={canyonData?.Url} target="_blank" rel="noopener noreferrer">
            More Details
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
            <TableCell>Date Descended</TableCell>
            <TableCell>Team Size</TableCell>
            <TableCell>Water Level</TableCell>
            <TableCell>Comments</TableCell>
            <TableCell>Actions</TableCell>
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
                <DateTableCell date={rec.Date}/>
                <TeamSizeTableCell teamSize={rec.TeamSize} />
                <WaterLevelTableCell waterLevelRating={rec.WaterLevel}/>
                <TableCell>{rec.Comments || '-'}</TableCell>
                <EditRecordTableCell recordId={rec.Id} />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </PageTemplate>;
}

export default CanyonOverviewPage;