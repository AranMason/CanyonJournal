import React, { useEffect, useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiFetch } from '../../utils/api';
import { CanyonSource } from '../../types/Canyon';

interface SourceFormValues {
  displayName: string;
  logoUrl: string;
  websiteUrl: string;
}

const emptyForm: SourceFormValues = { displayName: '', logoUrl: '', websiteUrl: '' };

const SourcesTab: React.FC = () => {
  const [sources, setSources] = useState<CanyonSource[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SourceFormValues>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    apiFetch<CanyonSource[]>('/api/sources').then(setSources).catch(() => {});

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(s: CanyonSource) {
    setEditingId(s.Id);
    setForm({ displayName: s.DisplayName, logoUrl: s.LogoUrl ?? '', websiteUrl: s.WebsiteUrl ?? '' });
    setError(null);
    setDialogOpen(true);
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this source?')) return;
    try {
      await apiFetch(`/api/sources/${id}`, { method: 'DELETE' });
      load();
    } catch (e: any) {
      alert(e.message || 'Could not delete — canyons may still reference this source.');
    }
  }

  async function handleSave() {
    if (!form.displayName.trim()) { setError('Display name is required'); return; }
    setError(null);
    try {
      const body = JSON.stringify({
        displayName: form.displayName.trim(),
        logoUrl: form.logoUrl.trim() || null,
        websiteUrl: form.websiteUrl.trim() || null,
      });
      if (editingId !== null) {
        await apiFetch(`/api/sources/${editingId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body });
      } else {
        await apiFetch('/api/sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
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
        <Typography variant="h6">Canyon Sources</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Source</Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Logo</TableCell>
            <TableCell>Display Name</TableCell>
            <TableCell>Website</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sources.map(s => (
            <TableRow key={s.Id}>
              <TableCell>
                {s.LogoUrl
                  ? <img src={s.LogoUrl} alt={s.DisplayName} style={{ height: 24, objectFit: 'contain' }} />
                  : '—'}
              </TableCell>
              <TableCell>{s.DisplayName}</TableCell>
              <TableCell>
                {s.WebsiteUrl
                  ? <a href={s.WebsiteUrl} target="_blank" rel="noopener noreferrer">{s.WebsiteUrl}</a>
                  : '—'}
              </TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => openEdit(s)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(s.Id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
          {sources.length === 0 && (
            <TableRow><TableCell colSpan={4} align="center">No sources</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingId ? 'Edit Source' : 'Add Source'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Display Name"
              value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
              fullWidth required
            />
            <TextField
              label="Logo URL"
              value={form.logoUrl}
              onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
              fullWidth
            />
            {form.logoUrl && (
              <Box>
                <img src={form.logoUrl} alt="preview" style={{ height: 32, objectFit: 'contain' }} />
              </Box>
            )}
            <TextField
              label="Website URL"
              value={form.websiteUrl}
              onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))}
              fullWidth
            />
            {error && <Typography color="error">{error}</Typography>}
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

export default SourcesTab;
