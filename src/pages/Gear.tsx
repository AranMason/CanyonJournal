import React from 'react';

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
  const [ropeModalOpen, setRopeModalOpen] = React.useState(false);
  const [gearModalOpen, setGearModalOpen] = React.useState(false);
  const [ropes, setRopes] = React.useState<any[]>([]);
  const [gear, setGear] = React.useState<any[]>([]);
  const ropeIdRef = React.useRef(1);
  const gearIdRef = React.useRef(1);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [editRopeId, setEditRopeId] = React.useState<string | null>(null);
  const [editGearId, setEditGearId] = React.useState<string | null>(null);

  const handleAddRope = (data: any) => {
    setRopes(prev => [...prev, { ...data, id: ropeIdRef.current++ }]);
    setSnackbarOpen(true);
  };
  const handleAddGear = (data: any) => {
    setGear(prev => [...prev, { ...data, id: gearIdRef.current++ }]);
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
                      onDelete={() => setRopes(prev => prev.filter((r) => r.id !== row.id))}
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
          onSubmit={data => {
            if (editRopeId !== null) {
              setRopes(prev => prev.map((r) => r.id === editRopeId ? { ...data, id: editRopeId } : r));
              setEditRopeId(null);
            } else {
              handleAddRope(data);
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
                      onDelete={() => setGear(prev => prev.filter((g) => g.id !== row.id))}
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
          onSubmit={data => {
            if (editGearId !== null) {
              setGear(prev => prev.map((g) => g.id === editGearId ? { ...data, id: editGearId } : g));
              setEditGearId(null);
            } else {
              handleAddGear(data);
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
