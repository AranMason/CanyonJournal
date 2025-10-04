import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Button } from '@mui/material';
import CanyonRating from '../components/CanyonRating';
import { apiFetch } from '../utils/api';
import { Canyon } from '../types/Canyon';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import { useNavigate } from 'react-router-dom';

interface CanyonWithDescents extends Canyon {
  Descents: number;
  LastDescentDate?: string | null;
}

const CanyonList: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const [canyons, setCanyons] = useState<CanyonWithDescents[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell align="center">Your Descents</TableCell>
              <TableCell align="center">Last Descent</TableCell>
              <TableCell align="center">Canyon Log</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {canyons.map(canyon => (
              <TableRow key={canyon.Id}>
                <TableCell>
                  <Link component="a" onClick={() => navigate(`/canyons/${canyon.Id}`)} sx={{cursor: 'pointer'}}>{canyon.Name}</Link>
                </TableCell>
                <TableCell>
                  <CanyonRating
                    aquaticRating={canyon.AquaticRating}
                    verticalRating={canyon.VerticalRating}
                    commitmentRating={canyon.CommitmentRating}
                    starRating={canyon.StarRating}
                  />
                </TableCell>
                <TableCell align="center">{canyon.Descents}</TableCell>
                <TableCell align="center">
                  {canyon.LastDescentDate ? (
                    <Box sx={{ fontWeight: 500, color: 'primary.main', letterSpacing: 1 }}>
                      {new Date(canyon.LastDescentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell align="center">
                  {canyon.Url ? <Button type='button' variant="outlined" href={canyon.Url} target="_blank" rel="noopener noreferrer" startIcon={<img height="16px" alt="Canyon Log" src="https://i0.wp.com/canyonlog.org/wp-content/uploads/2025/01/logo-.png?fit=192%2C192&ssl=1"></img>} >
                    Visit
                  </Button> : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageTemplate>
  );
};

export default CanyonList;
