import React, { useEffect, useState } from 'react';
import PageTemplate from './PageTemplate';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { CanyonRecord } from '../types/CanyonRecord';
import { useUser } from '../App';

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
      ) : records.length === 0 ? (
        <Typography>No canyon records found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Team Size</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((rec, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {rec.url ? (
                      <a href={rec.url} target="_blank" rel="noopener noreferrer">{rec.name}</a>
                    ) : (
                      rec.name
                    )}
                  </TableCell>
                  <TableCell>{rec.date}</TableCell>
                  <TableCell>{rec.teamSize}</TableCell>
                  <TableCell>{rec.comments || '-'}</TableCell>
                  <TableCell>{rec.timestamp ? new Date(rec.timestamp).toLocaleString() : '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageTemplate>
  );
};

export default Home;
