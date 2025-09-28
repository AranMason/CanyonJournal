import React, { useEffect } from 'react';
import { useUser } from '../App';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import PageTemplate from './PageTemplate';
import RopeModal from '../components/RopeModal';
import GearModal from '../components/GearModal';
import SuccessSnackbar from '../components/SuccessSnackbar';
import RowActions from '../components/RowActions';

const SectionTable: React.FC<{ title: string }> = ({ title }) => (
  <Box sx={{ mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="h6">{title}</Typography>
      <Button variant="outlined" color="primary">Add Gear</Button>
    </Box>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Empty for now */}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

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
  const [ropes, setRopes] = React.useState<any[]>([]);
  const [gear, setGear] = React.useState<any[]>([]);
  const ropeIdRef = React.useRef(1);
  const gearIdRef = React.useRef(1);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [editRopeId, setEditRopeId] = React.useState<string | null>(null);
  const [editGearId, setEditGearId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && user) {
      axios.get('/api/gear').then(res => {
        setGear(res.data.gear || []);
        setRopes(res.data.ropes || []);
        // Set id refs to max+1 for new items
        if (res.data.gear?.length) gearIdRef.current = Math.max(...res.data.gear.map((g: any) => g.id)) + 1;
        if (res.data.ropes?.length) ropeIdRef.current = Math.max(...res.data.ropes.map((r: any) => r.id)) + 1;
      });
    }
  }, [loading, user]);

  const handleAddRope = async (data: any) => {
    const item = { ...data, id: ropeIdRef.current++ };
    await axios.post('/api/gear/rope', item);
    setRopes(prev => [...prev, item]);
    setSnackbarOpen(true);
  };
  const handleAddGear = async (data: any) => {
    const item = { ...data, id: gearIdRef.current++ };
    await axios.post('/api/gear/gear', item);
    setGear(prev => [...prev, item]);
    setSnackbarOpen(true);
  };

  return (
    <PageTemplate pageTitle="Gear">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">Rope</Typography>
          <Button variant="outlined" color="primary" onClick={() => setRopeModalOpen(true)}>Add Gear</Button>
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
                <TableRow key={row.id}>
                  {/* Hidden ID: <TableCell style={{ display: 'none' }}>{row.id}</TableCell> */}
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.diameter}</TableCell>
                  <TableCell>{row.length}</TableCell>
                  <TableCell>{row.unit}</TableCell>
                  <TableCell>{row.notes}</TableCell>
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
                    <RowActions
                      onEdit={() => setEditRopeId(row.id)}
                      onDelete={() => {
                        axios.delete(`/api/gear/rope/${row.id}`);
                        setRopes(prev => prev.filter((r) => r.id !== row.id));
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
              await axios.put(`/api/gear/rope/${editRopeId}`, { ...data, id: editRopeId });
              setRopes(prev => prev.map((r) => r.id === editRopeId ? { ...data, id: editRopeId } : r));
              setEditRopeId(null);
            } else {
              await handleAddRope(data);
            }
          }}
          initialValues={editRopeId !== null ? ropes.find(r => r.id === editRopeId) : undefined}
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
                <TableRow key={row.id}>
                  {/* Hidden ID: <TableCell style={{ display: 'none' }}>{row.id}</TableCell> */}
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.notes}</TableCell>
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
                    <RowActions
                      onEdit={() => setEditGearId(row.id)}
                      onDelete={() => {
                        axios.delete(`/api/gear/gear/${row.id}`);
                        setGear(prev => prev.filter((g) => g.id !== row.id));
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
              await axios.put(`/api/gear/gear/${editGearId}`, { ...data, id: editGearId });
              setGear(prev => prev.map((g) => g.id === editGearId ? { ...data, id: editGearId } : g));
              setEditGearId(null);
            } else {
              await handleAddGear(data);
            }
          }}
          initialValues={editGearId !== null ? gear.find(g => g.id === editGearId) : undefined}
        />
      </Box>
      <SuccessSnackbar open={snackbarOpen} message="Added successfully!" onClose={() => setSnackbarOpen(false)} />
    </PageTemplate>
  );
};

export default Gear;
