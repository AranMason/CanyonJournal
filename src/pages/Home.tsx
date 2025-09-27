import React, { useEffect, useState } from 'react';
import PageTemplate from './PageTemplate';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { CanyonRecord } from '../types/CanyonRecord';
import { useUser } from '../App';

// Column size definitions
const COLUMN_WIDTHS = {
  date: 120,
  name: 120, // auto
  teamSize: 80,
  comments: undefined, // auto
};

const Home: React.FC = () => {
  const { user, loading } = useUser();
  const [records, setRecords] = useState<CanyonRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('/api/record');
        if (!res.ok) throw new Error('Failed to fetch records');
        const data = await res.json();
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
    <PageTemplate pageTitle="Canyon Journal">
      {(!user && !loading) ? (
        <Typography>Please log in to view your canyon records.</Typography>
      ) : loading ? (
        <Typography>Loading records...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Canyons Descended
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: COLUMN_WIDTHS.date, fontSize: 13 }}>Date Descended</TableCell>
                  <TableCell>Canyon Name</TableCell>
                  <TableCell sx={{ width: COLUMN_WIDTHS.teamSize, fontSize: 13 }}>Team Size</TableCell>
                  <TableCell>Comments</TableCell>
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
                      <TableCell sx={{ width: COLUMN_WIDTHS.date, fontSize: 13 }}>{rec.date}</TableCell>
                      <TableCell>
                        {rec.url ? (
                          <a href={rec.url} target="_blank" rel="noopener noreferrer">{rec.name}</a>
                        ) : (
                          rec.name
                        )}
                      </TableCell>
                      <TableCell sx={{ width: COLUMN_WIDTHS.teamSize, fontSize: 13 }}>{rec.teamSize}</TableCell>
                      <TableCell>{rec.comments || '-'}</TableCell>
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

export default Home;
