import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button, Select, MenuItem, InputLabel, Typography } from '@mui/material';
import CanyonRating from '../components/CanyonRating';
import { apiFetch } from '../utils/api';
import { CanyonWithDescents } from '../types/Canyon';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';
import { GetCanyonTypeDisplayName, GetRegionDisplayName } from '../heleprs/EnumMapper';
import CanyonFilter from '../components/CanyonFilter';

const minDateString: string = '1900-01-01' 

enum SortOptionEnum {
  TotalDescents = 1,
  Name = 2,
  LastDescent = 3
}

const SortParams: { [key in SortOptionEnum]: {
  option: key,
  displayName: string,
  method: (c: CanyonWithDescents[]) => CanyonWithDescents[],
} } = {
  [SortOptionEnum.TotalDescents]: {
    option: SortOptionEnum.TotalDescents,
    displayName: 'Descents',
    method: c => c.sort((a, b) => b.Descents - a.Descents)
  },
  [SortOptionEnum.Name]: {
    option: SortOptionEnum.Name,
    displayName: 'Name',
    method: c => c.sort((a, b) => a.Name.localeCompare(b.Name))
  },
  [SortOptionEnum.LastDescent]: {
    option: SortOptionEnum.LastDescent,
    displayName: 'Last Descent',
    method: c => c.sort((a, b) => {
      // A little bit hacky, tbh we should probably parse the Date object first, so we are not doing a pile of repeat work
      return Date.parse(b.LastDescentDate ?? minDateString) - Date.parse(a.LastDescentDate??minDateString)
    })
  }
}

const CanyonList: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [canyons, setCanyons] = useState<CanyonWithDescents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<SortOptionEnum>(SortOptionEnum.TotalDescents);

  const refresh = () => {
    setIsLoading(true);
    apiFetch<CanyonWithDescents[]>('/api/canyons?withDescents=1')
      .then(setCanyons)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!loading && user) {
      refresh();
    }
  }, [user, loading]);

  return (
    <PageTemplate pageTitle="All Canyons" isAuthRequired isLoading={isLoading}>
      <Box my={2} alignContent="end" display="flex" flexDirection="row" alignItems="center" gap={1} justifyContent="space-between">
        <Typography component={"h2"} variant='h4'>
          Your Canyons
        </Typography>
        <Box>
          <Box alignContent="end" display="flex" flexDirection="row" alignItems="center" gap={1}>
            <InputLabel id="filter-sort-by" >Sort By</InputLabel>
            <Select
              size='small'
              labelId="filter-sort-by"
              label="Sort By"
              value={sort}
              onChange={e => {
                const sortVal = e.target.value as SortOptionEnum;
                setSort(sortVal)
              }}
            >
              {Object.values(SortParams).map(({ option, displayName }) => (
                <MenuItem key={option} value={option}>{displayName}</MenuItem>
              ))}
            </Select>
          </Box>

        </Box>
      </Box>
      <CanyonFilter canyons={canyons}>
        {(filteredCanyons: CanyonWithDescents[]) => <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="center">Your Descents</TableCell>
                <TableCell align="center">Last Descent</TableCell>
                <TableCell align="center">Canyon Log</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SortParams[sort].method(filteredCanyons).map(canyon => (
                <TableRow key={canyon.Id}>
                  <TableCell>
                    <Link component="a" onClick={() => navigate(`/canyons/${canyon.Id}`)} sx={{ cursor: 'pointer' }}>{canyon.Name}</Link>
                  </TableCell>
                  <TableCell>
                    <CanyonRating
                      aquaticRating={canyon.AquaticRating}
                      verticalRating={canyon.VerticalRating}
                      commitmentRating={canyon.CommitmentRating}
                      starRating={canyon.StarRating}
                      isUnrated={canyon.IsUnrated}
                    />
                  </TableCell>
                  <TableCell align="center">{GetRegionDisplayName(canyon.Region)}</TableCell>
                  <TableCell align="center">{GetCanyonTypeDisplayName(canyon.CanyonType)}</TableCell>
                  <TableCell align="center">{canyon.Descents}</TableCell>
                  <TableCell align="center">
                    {canyon.LastDescentDate ? (
                      <Box sx={{ fontWeight: 500, color: 'primary.main', letterSpacing: 1 }}>
                        {new Date(canyon.LastDescentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </Box>
                    ) : '-'}
                  </TableCell>
                  <TableCell align="center">
                    {canyon.Url ? <Button type='button' variant="outlined" href={canyon.Url} target="_blank" rel="noopener noreferrer" >
                      Visit Canyon Log
                    </Button> : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>}
      
        
      </CanyonFilter>
    </PageTemplate>
  );
};

export default CanyonList;
