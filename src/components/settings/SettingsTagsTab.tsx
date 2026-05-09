import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, IconButton, InputAdornment, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { apiFetch } from '../../utils/api';
import * as TagsDataStore from '../../helpers/TagsDataStore';
import { Tag } from '../../helpers/TagsDataStore';

const SettingsTagsTab: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLoading(true);
    TagsDataStore.invalidate();
    TagsDataStore.load()
      .then(setTags)
      .finally(() => setIsLoading(false));
  }, []);

  const startEdit = (tag: Tag) => {
    setEditingId(tag.Id);
    setEditName(tag.Name);
    setRenameError(null);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setRenameError(null);
  };

  const commitEdit = async () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    const original = tags.find(t => t.Id === editingId);
    if (!trimmed || trimmed === original?.Name) { cancelEdit(); return; }

    setIsSaving(true);
    setRenameError(null);
    try {
      const updated = await apiFetch<Tag>(`/api/tags/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name: trimmed }),
      });
      setTags(prev => prev.map(t => t.Id === editingId ? { ...t, Name: updated.Name } : t));
      TagsDataStore.invalidate();
      setEditingId(null);
    } catch (err: any) {
      setRenameError(err.message || 'Failed to rename tag');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/api/tags/${deleteTarget.Id}`, { method: 'DELETE' });
      setTags(prev => prev.filter(t => t.Id !== deleteTarget.Id));
      TagsDataStore.invalidate();
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete tag');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tags are created inline when logging a trip. Deleting a tag removes it from all records.
      </Typography>
      {tags.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No tags yet. Add tags when logging a trip.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Usage Count</TableCell>
                <TableCell>Last Used</TableCell>
                <TableCell sx={{ width: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tags.map(tag => (
                <TableRow key={tag.Id}>
                  <TableCell sx={{ py: 0.5 }}>
                    {editingId === tag.Id ? (
                      <TextField
                        inputRef={inputRef}
                        size="small"
                        value={editName}
                        onChange={e => { setEditName(e.target.value); setRenameError(null); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        error={Boolean(renameError)}
                        helperText={renameError}
                        disabled={isSaving}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" onClick={commitEdit} disabled={isSaving}><CheckIcon fontSize="small" /></IconButton>
                              <IconButton size="small" onClick={cancelEdit} disabled={isSaving}><CloseIcon fontSize="small" /></IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ minWidth: 200 }}
                      />
                    ) : (
                      tag.Name
                    )}
                  </TableCell>
                  <TableCell>{tag.UsageCount ?? 0}</TableCell>
                  <TableCell>
                    {tag.LastUsed
                      ? new Date(tag.LastUsed).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Rename">
                      <IconButton size="small" onClick={() => startEdit(tag)} disabled={editingId !== null}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(tag)} disabled={editingId !== null}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={Boolean(deleteTarget)} onClose={() => !isDeleting && setDeleteTarget(null)}>
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete <strong>{deleteTarget?.Name}</strong>?
            {(deleteTarget?.UsageCount ?? 0) > 0 && (
              <> This tag is used on <strong>{deleteTarget?.UsageCount}</strong> record{deleteTarget?.UsageCount !== 1 ? 's' : ''} and will be removed from all of them.</>
            )}
            {' '}This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsTagsTab;
