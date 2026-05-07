import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Alert, IconButton, Link, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { UserCanyonWithDescents } from '../../types/UserCanyon';
import RegionType from '../../types/RegionEnum';
import { GetRegionDisplayName } from '../../heleprs/EnumMapper';
import CanyonRating from '../CanyonRating';
import CanyonTypeDisplay from '../CanyonTypeDisplay';
import { CanyonTypeEnum } from '../../types/CanyonTypeEnum';
import AddCanyonModal, { CanyonModalFormValues } from '../AddCanyonModal';

const SettingsCanyonsTab: React.FC = () => {
  const navigate = useNavigate();
  const [canyons, setCanyons] = useState<UserCanyonWithDescents[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCanyon, setEditingCanyon] = useState<UserCanyonWithDescents | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserCanyonWithDescents | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = () => {
    setIsLoading(true);
    apiFetch<UserCanyonWithDescents[]>('/api/user-canyons')
      .then(setCanyons)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const openCreate = () => { setEditingCanyon(null); setDialogOpen(true); };
  const openEdit = (canyon: UserCanyonWithDescents) => { setEditingCanyon(canyon); setDialogOpen(true); };

  const handleSave = async (values: CanyonModalFormValues) => {
    const body = {
      Name: values.name,
      Url: values.url || null,
      Region: values.canyonRegion,
      CanyonType: values.canyonType,
      AquaticRating: Number(values.aquaticRating),
      VerticalRating: Number(values.verticalRating),
      CommitmentRating: Number(values.commitmentRating),
      StarRating: Number(values.starRating),
      IsUnrated: values.isUnrated,
      Notes: values.notes,
    };
    if (values.id) {
      await apiFetch(`/api/user-canyons/${values.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      await apiFetch('/api/user-canyons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/user-canyons/${deleteTarget.Id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Your Canyons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New Canyon
        </Button>
      </Box>

      <AddCanyonModal
        canyon={editingCanyon}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={refresh}
        title={editingCanyon ? 'Edit Canyon' : 'New Canyon'}
        showNotes
        onSubmit={handleSave}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Custom Canyon</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.Name}</strong>?
          </Typography>
          {(deleteTarget?.Descents ?? 0) > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This canyon has <strong>{deleteTarget?.Descents}</strong> journal{' '}
              {deleteTarget?.Descents === 1 ? 'entry' : 'entries'} linked to it.
              They will be unlinked but not deleted.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Descents</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {canyons.map(canyon => (
              <TableRow key={canyon.Id}>
                <TableCell>
                  <Link component="a" color="textPrimary" onClick={() => navigate(`/canyons/users/${canyon.Id}`)} sx={{ cursor: 'pointer', fontWeight: 500 }}>
                    {canyon.Name}
                  </Link>
                </TableCell>
                <TableCell>{GetRegionDisplayName(canyon.Region ?? RegionType.Unknown)}</TableCell>
                <TableCell>
                  <CanyonTypeDisplay type={canyon.CanyonType ?? CanyonTypeEnum.Unknown} />
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
                <TableCell>{canyon.Descents}</TableCell>
                <TableCell>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(canyon)} sx={{ color: 'grey.500' }}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => setDeleteTarget(canyon)} sx={{ color: 'grey.500' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {canyons.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" py={2}>
                    No custom canyons yet. Create one to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SettingsCanyonsTab;
