import React, { useEffect, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link } from '@mui/material';
import CanyonRating from '../components/CanyonRating';
import { apiFetch } from '../utils/api';
import { Canyon } from '../types/Canyon';
import { useUser } from '../App';
import PageTemplate from './PageTemplate';
import AddCanyonModal from '../components/AddCanyonModal';

interface CanyonWithDescents extends Canyon {
  Descents: number;
  LastDescentDate?: string | null;
}

const CanyonList: React.FC = () => {
  const { user, loading } = useUser();
  const [canyons, setCanyons] = useState<CanyonWithDescents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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
      {/* <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>
          Add Canyon
        </Button>
      </Box> */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell align="center">Your Descents</TableCell>
              <TableCell align="center">Last Descent</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {canyons.map(canyon => (
              <TableRow key={canyon.Id}>
                <TableCell>
                  <Link href={canyon.Url} target="_blank" rel="noopener noreferrer">{canyon.Name}</Link>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddCanyonModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} />
    </PageTemplate>
  );
};

export default CanyonList;
