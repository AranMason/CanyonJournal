import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, CircularProgress, DialogContent,
  DialogContentText, IconButton, InputAdornment, Paper,
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
import { useTranslation } from 'react-i18next';
import AppModal from '../AppModal';

const SettingsTagsTab: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

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
        {t('settings.tagsDescription')}
      </Typography>
      {tags.length === 0 ? (
        <Typography variant="body2" color="text.secondary">{t('settings.noTags')}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common:fields.name')}</TableCell>
                <TableCell>{t('settings.tagUsageCount')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('settings.tagLastUsed')}</TableCell>
                <TableCell sx={{ width: 120 }}>{t('common:actions.edit')}</TableCell>
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
                        sx={{ minWidth: { xs: 140, sm: 200 } }}
                      />
                    ) : (
                      tag.Name
                    )}
                  </TableCell>
                  <TableCell>{tag.UsageCount ?? 0}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {tag.LastUsed
                      ? new Date(tag.LastUsed).toLocaleDateString(undefined, { dateStyle: 'medium' })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={t('common:actions.edit')}>
                      <IconButton size="small" onClick={() => startEdit(tag)} disabled={editingId !== null} sx={{ p: { xs: 1.5, sm: 1 } }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common:actions.delete')}>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(tag)} disabled={editingId !== null} sx={{ p: { xs: 1.5, sm: 1 } }}>
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

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        title={t('settings.deleteTag')}
        disableClose={isDeleting}
        maxWidth="xs"
        actions={
          <>
            <Button onClick={() => setDeleteTarget(null)} disabled={isDeleting}>{t('common:actions.cancel')}</Button>
            <Button onClick={handleDelete} color="error" variant="contained" disabled={isDeleting}>
              {isDeleting ? t('settings.deleting') : t('common:actions.delete')}
            </Button>
          </>
        }
      >
        <DialogContent>
          <DialogContentText>
            {t('settings.deleteTagConfirm', { name: deleteTarget?.Name })}
            {(deleteTarget?.UsageCount ?? 0) > 0 && (
              <> {t('settings.deleteTagWarning', { count: deleteTarget?.UsageCount })}</>
            )}
            {' '}{t('settings.cannotUndo')}
          </DialogContentText>
        </DialogContent>
      </AppModal>
    </>
  );
};

export default SettingsTagsTab;

