import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Link
} from '@mui/material';
import { apiFetch } from '../../utils/api';
import * as EquipmentDataStore from '../../helpers/EquipmentDataStore';
import { GearItem, RopeItem } from '../../types/types';
import RopeModal from '../RopeModal';
import GearModal from '../GearModal';
import SuccessSnackbar from '../SuccessSnackbar';
import RowActions from '../RowActions';
import { useTranslation } from 'react-i18next';

const SettingsGearTab: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ropeModalOpen, setRopeModalOpen] = useState(false);
  const [gearModalOpen, setGearModalOpen] = useState(false);
  const [ropes, setRopes] = useState<RopeItem[]>([]);
  const [gear, setGear] = useState<GearItem[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [editRopeId, setEditRopeId] = useState<Number | null>(null);
  const [editGearId, setEditGearId] = useState<Number | null>(null);

  useEffect(() => {
    EquipmentDataStore.load()
      .then(data => {
        setGear(data.gear || []);
        setRopes(data.ropes || []);
      })
      .catch((err: any) => {
        if (err.message === 'Unauthorized') navigate('/');
      });
  }, [navigate]);

  const handleAddRope = async (data: any) => {
    try {
      const response = await apiFetch<any>('/api/equipment/rope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setRopes(prev => [...prev, response]);
      EquipmentDataStore.invalidate();
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
      EquipmentDataStore.invalidate();
      setSnackbarOpen(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') navigate('/');
    }
  };

  return (
    <>
      {/* Rope */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{t('common:terms.rope.upper', { count: 1 })}</Typography>
          <Button variant="contained" color="tertiary" onClick={() => setRopeModalOpen(true)}>{t('gear.addRope')}</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common:fields.name')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.item.title')}</TableCell>
                <TableCell sx={{ display: { sm: 'table-cell' } }}>{t('gear.table.rope_size.title')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.date_acquired.title')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.notes.title')}</TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ropes.map(row => (
                <TableRow key={row.Id}>
                  <TableCell><Link component="a" color="textPrimary" onClick={() => navigate(`/journal?ropeId=${row.Id}`)} sx={{ cursor: 'pointer' }}>{row.Name}</Link></TableCell>
                  {/* TODO: We can probably find a better way of handling this */}
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.Manufacturer} {row.Model}</TableCell>
                  <TableCell sx={{ display: { sm: 'table-cell' } }}>{t(`gear.table.rope_size.cell_${row.Unit.toLowerCase()}`, { diameter: row.Diameter, length: row.Length })}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.InServiceDate ? new Date(row.InServiceDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.Notes}</TableCell>
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 120 }}>
                    <RowActions
                      onEdit={async () => setEditRopeId(row.Id)}
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
                setRopes(prev => prev.map(r => r.Id === editRopeId ? response : r));
                setEditRopeId(null);
                EquipmentDataStore.invalidate();
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

      {/* Gear */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">{t('common:terms.gear.upper', { count: 1 })}</Typography>
          <Button variant="contained" color="tertiary" onClick={() => setGearModalOpen(true)}>{t('gear.addGear')}</Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('common:fields.name')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.item.title')}</TableCell>
                <TableCell>{t('gear.category')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.date_acquired.title')}</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('common:fields.notes')}</TableCell>
                <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gear.map(row => (
                <TableRow key={row.Id}>
                  <TableCell><Link component="a" color="textPrimary" onClick={() => navigate(`/journal?gearId=${row.Id}`)} sx={{ cursor: 'pointer' }}>{row.Name}</Link></TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.Manufacturer} {row.Model}</TableCell>
                  <TableCell>{row.Category}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.InServiceDate ? new Date(row.InServiceDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.Notes}</TableCell>
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 120 }}>
                    <RowActions
                      onEdit={async () => setEditGearId(row.Id)}
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
                setGear(prev => prev.map(g => g.Id === editGearId ? response : g));
                setEditGearId(null);
                EquipmentDataStore.invalidate();
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

      <SuccessSnackbar open={snackbarOpen} message={t('errors.addedSuccessfully')} onClose={() => setSnackbarOpen(false)} />
    </>
  );
};

export default SettingsGearTab;


