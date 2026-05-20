import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, TextField, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiFetch } from '../../utils/api';
import { Region, RegionAdmin } from '../../types/Region';
import RegionTreePicker from '../RegionTreePicker';
import RegionTreeView from '../RegionTreeView';
import * as RegionDataStore from '../../helpers/RegionDataStore';

interface RegionFormValues {
  parentId: number | null;
  slug: string;
  symbol: string;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm: RegionFormValues = {
  parentId: null,
  slug: '',
  symbol: '',
  sortOrder: 0,
  isActive: true,
};

const RegionsTab: React.FC = () => {
  const [tree, setTree] = useState<Region[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<RegionFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    RegionDataStore.invalidate();
    RegionDataStore.loadTree().then(setTree).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  }

  async function openEdit(id: number) {
    setError(null);
    try {
      const region = await apiFetch<RegionAdmin>(`/api/regions/${id}`);
      setEditingId(id);
      setForm({
        parentId: region.ParentId,
        slug: region.Slug,
        symbol: region.Symbol ?? '',
        sortOrder: region.SortOrder,
        isActive: region.IsActive ?? true,
      });
      setDialogOpen(true);
    } catch (e: any) {
      alert(e.message || 'Failed to load region');
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete region "${name}"?`)) return;
    try {
      await apiFetch(`/api/regions/${id}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      const body = e.responseBody;
      if (body?.children || body?.canyons || body?.userCanyons) {
        alert(`Cannot delete: ${body.children ?? 0} child regions, ${body.canyons ?? 0} canyons, ${body.userCanyons ?? 0} user canyons assigned.`);
      } else {
        alert(e.message || 'Could not delete region');
      }
    }
  }

  async function handleSave() {
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    setError(null);
    const body = JSON.stringify({
      parentId: form.parentId,
      slug: form.slug.trim(),
      symbol: form.symbol.trim() || null,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
    });
    try {
      if (editingId !== null) {
        await apiFetch(`/api/regions/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body });
      } else {
        await apiFetch('/api/regions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      }
      setDialogOpen(false);
      load();
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Regions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Region</Button>
      </Box>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Region display names are managed via <code>src/locales/*/regions.json</code>, keyed by slug.
      </Typography>

      <RegionTreeView
        nodes={tree}
        renderActions={node => (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>{node.Slug}</Typography>
            <IconButton size="small" onClick={e => { e.stopPropagation(); openEdit(node.Id); }}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={e => { e.stopPropagation(); handleDelete(node.Id, node.Name); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}
        sx={{ '& .MuiTreeItem-root': { mb: 0.5 } }}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit Region' : 'Add Region'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <RegionTreePicker
              value={form.parentId}
              onChange={v => setForm(f => ({ ...f, parentId: v }))}
              label="Parent Region"
              placeholder="None (top-level)"
              allowClear
            />
            <TextField
              label="Slug"
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              fullWidth required
              helperText="Unique key matching the regions.json locale file entry"
            />
            <TextField
              label="Symbol (emoji)"
              value={form.symbol}
              onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
              fullWidth
              helperText="Optional flag emoji, e.g. 🏴󠁧󠁢󠁳󠁣󠁴󠁿"
            />
            <TextField
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
              fullWidth
            />
            {error && <Typography color="error" variant="body2">{error}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegionsTab;

