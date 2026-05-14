import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Alert, Link, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import * as UserCanyonDataStore from '../../helpers/UserCanyonDataStore';
import { UserCanyonWithDescents } from '../../types/UserCanyon';
import RegionType from '../../types/RegionEnum';
import { GetRegionDisplayName } from '../../helpers/EnumMapper';
import CanyonRating from '../CanyonRating';
import CanyonTypeDisplay from '../CanyonTypeDisplay';
import { CanyonTypeEnum } from '../../types/CanyonTypeEnum';
import AddCanyonModal, { CanyonModalFormValues } from '../AddCanyonModal';
import { mapCanyonFormToApiBody } from '../../utils/canyonForm';
import RowActions from '../RowActions';
import { useTranslation } from 'react-i18next';

const SettingsCanyonsTab: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [canyons, setCanyons] = useState<UserCanyonWithDescents[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCanyon, setEditingCanyon] = useState<UserCanyonWithDescents | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserCanyonWithDescents | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const refresh = () => {
    UserCanyonDataStore.invalidate();
    setIsLoading(true);
    UserCanyonDataStore.load()
      .then(setCanyons)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const openCreate = () => { setEditingCanyon(null); setDialogOpen(true); };
  const openEdit = (canyon: UserCanyonWithDescents) => { setEditingCanyon(canyon); setDialogOpen(true); };

  const handleSave = async (values: CanyonModalFormValues) => {
    const body = mapCanyonFormToApiBody(values);
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
        <Typography variant="h5">{t('settings.canyons')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          {t('settings.newCanyon')}
        </Button>
      </Box>

      <AddCanyonModal
        canyon={editingCanyon}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={refresh}
        title={editingCanyon ? t('settings.editCanyon') : t('settings.newCanyon')}
        showNotes
        onSubmit={handleSave}
      />

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>{t('settings.deleteCanyon')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('settings.deleteCanyonConfirm', { name: deleteTarget?.Name })}
          </Typography>
          {(deleteTarget?.Descents ?? 0) > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {t('settings.deleteCanyonWarning', { count: deleteTarget?.Descents })}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t('common:actions.cancel')}</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : t('common:actions.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common:fields.name')}</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('common:fields.region')}</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('common:canyon.canyonType')}</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('common:fields.grade')}</TableCell>
              <TableCell>{t('canyon.totalDescents')}</TableCell>
              <TableCell>{t('common:actions.edit')}</TableCell>
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
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{GetRegionDisplayName(canyon.Region ?? RegionType.Unknown)}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <CanyonTypeDisplay type={canyon.CanyonType ?? CanyonTypeEnum.Unknown} />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
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
                  <RowActions
                    onEdit={() => openEdit(canyon)}
                    onDelete={() => setDeleteTarget(canyon)}
                  />
                </TableCell>
              </TableRow>
            ))}
            {canyons.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" py={2}>
                    {t('settings.noCustomCanyons')}
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


