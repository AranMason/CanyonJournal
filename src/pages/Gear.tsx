import React, { useEffect } from 'react';
import { useUser } from '../App';
import { useNavigate } from 'react-router-dom';

import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import PageTemplate from './PageTemplate';
import RopeModal from '../components/RopeModal';
import GearModal from '../components/GearModal';
import SuccessSnackbar from '../components/SuccessSnackbar';
import RowActions from '../components/RowActions';
import { apiFetch } from '../utils/api';
import { GearItem, RopeItem } from '../types/types';

const Gear: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  const [ropeModalOpen, setRopeModalOpen] = React.useState(false);
  const [gearModalOpen, setGearModalOpen] = React.useState(false);
  const [ropes, setRopes] = React.useState<RopeItem[]>([]);
  const [gear, setGear] = React.useState<GearItem[]>([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [editRopeId, setEditRopeId] = React.useState<Number | null>(null);
  const [editGearId, setEditGearId] = React.useState<Number | null>(null);

  React.useEffect(() => {
    if (!loading && user) {
      apiFetch<{ gear: any[]; ropes: any[] }>('/api/equipment')
        .then(res => {
          setGear(res.gear || []);
          setRopes(res.ropes || []);
        })
        .catch(err => {
          if (err.message === 'Unauthorized') navigate('/');
        });
    }
  }, [loading, user]);

  const handleAddRope = async (data: any) => {
    try {
      const response = await apiFetch<any>('/api/equipment/rope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setRopes(prev => [...prev, response]);
      setSnackbarOpen(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') navigate('/');
    }
  };
  const handleAddGear = async (data: any) => {
    try {
      const response = await apiFetch<any>('/api/equipment/gear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setGear(prev => [...prev, response]);
      setSnackbarOpen(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') navigate('/');
    }
  };

  return (
    <PageTemplate pageTitle="Gear" isAuthRequired>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">Rope</Typography>
          <Button variant="outlined" color="primary" onClick={() => setRopeModalOpen(true)}>Add Rope</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Diameter</TableCell>
                <TableCell>Length</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ropes.length === 0 ? null : ropes.map((row) => (
                <TableRow key={row.Id}>
                  <TableCell>{row.Name}</TableCell>
                  <TableCell>{row.Diameter}</TableCell>
                  <TableCell>{row.Length}</TableCell>
                  <TableCell>{row.Unit}</TableCell>
                  <TableCell>{row.Notes}</TableCell>
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
                    <RowActions
                      onEdit={async () => setEditRopeId(row.Id)}
                      onDelete={async () => {
                        await apiFetch(`/api/equipment/rope/${row.Id}`, { method: 'DELETE' });
                        setRopes(prev => prev.filter((r) => r.Id !== row.Id));
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <RopeModal
          open={ropeModalOpen || editRopeId !== null}
          onClose={() => { setRopeModalOpen(false); setEditRopeId(null); }}
          onSubmit={async data => {
            if (editRopeId !== null) {
              try {
                const response = await apiFetch<any>(`/api/equipment/rope/${editRopeId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                setRopes(prev => prev.map((r) => r.Id === editRopeId ? response : r));
                setEditRopeId(null);
              } catch (err: any) {
                if (err.message === 'Unauthorized') navigate('/');
              }
            } else {
              await handleAddRope(data);
            }
          }}
          initialValues={editRopeId !== null ? ropes.find(r => r.Id === editRopeId) : undefined}
        />
      </Box>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">Gear</Typography>
          <Button variant="outlined" color="primary" onClick={() => setGearModalOpen(true)}>Add Gear</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gear.length === 0 ? null : gear.map((row) => (
                <TableRow key={row.Id}>
                  <TableCell>{row.Name}</TableCell>
                  <TableCell>{row.Category}</TableCell>
                  <TableCell>{row.Notes}</TableCell>
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
                    <RowActions
                      onEdit={async () => setEditGearId(row.Id)}
                      onDelete={async () => {
                        await apiFetch(`/api/equipment/gear/${row.Id}`, { method: 'DELETE' });
                        setGear(prev => prev.filter((g) => g.Id !== row.Id));
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <GearModal
          open={gearModalOpen || editGearId !== null}
          onClose={() => { setGearModalOpen(false); setEditGearId(null); }}
          onSubmit={async data => {
            if (editGearId !== null) {
              try {
                const response = await apiFetch<any>(`/api/equipment/gear/${editGearId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                setGear(prev => prev.map((g) => g.Id === editGearId ? response : g));
                setEditGearId(null);
              } catch (err: any) {
                if (err.message === 'Unauthorized') navigate('/');
              }
            } else {
              await handleAddGear(data);
            }
          }}
          initialValues={editGearId !== null ? gear.find(g => g.Id === editGearId) : undefined}
        />
      </Box>
      <SuccessSnackbar open={snackbarOpen} message="Added successfully!" onClose={() => setSnackbarOpen(false)} />
    </PageTemplate>
  );
};

export default Gear;
