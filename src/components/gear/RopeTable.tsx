import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Button, Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getRopeWeightInGrams } from "../../helpers/UnitConverter";
import { apiFetch } from "../../utils/api";
import RowActions from "../RowActions";
import RopeModal from "./RopeModal";
import { useEffect, useState } from "react";
import SuccessSnackbar from "../SuccessSnackbar";
import * as EquipmentDataStore from "../../helpers/EquipmentDataStore";
import { RopeItem } from "../../types/types";
import Loader from "../Loader";

const RopeTable: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ropes, setRopes] = useState<RopeItem[]>([]);
  const [editRopeId, setEditRopeId] = useState<number | null>(null);
  const [ropeModalOpen, setRopeModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadRopes = () => {
    setIsLoading(true);
    EquipmentDataStore.load().then(equipment => {
      setRopes(equipment.ropes);
    }).catch(err => {
      if (err.message === 'Unauthorized') navigate('/');
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadRopes();
  }, []);

  const handleAddRope = async (data: RopeItem) => {
    setIsLoading(true);
    try {
      await EquipmentDataStore.addRope(data);
      loadRopes();
      setSnackbarOpen(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return <Loader isLoading={isLoading}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Button sx={{ ml: 'auto' }} variant="contained" color="primary" onClick={() => setRopeModalOpen(true)}>{t('gear.addRope')}</Button>
    </Box>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('common:fields.name')}</TableCell>
            <TableCell sx={{ display: { sm: 'table-cell' } }}>{t('gear.table.rope_size.title')}</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.weight.title')}</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.date_acquired.title')}</TableCell>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.notes.title')}</TableCell>
            <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ropes.map(row => (
            <TableRow key={row.Id}>
              <TableCell>
                <Link component="a" color="textPrimary" onClick={() => navigate(`/settings/rope/${row.Id}`)} sx={{ cursor: 'pointer' }}>
                  {row.Name}
                </Link>
                <br />
                <Typography variant="caption" color="textSecondary">{row.Manufacturer} {row.Model}</Typography>
              </TableCell>
              <TableCell sx={{ display: { sm: 'table-cell' } }}>
                {t(`gear.table.rope_size.cell_${row.Unit.toLowerCase()}`, { diameter: row.Diameter, length: row.Length })}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {row.WeightGrams ? t(`gear.table.weight.cell`, { weight: getRopeWeightInGrams(row) }) : t('common:blank')}
                <br />
                <Typography variant="caption" color="textSecondary">{row.WeightGrams ? t(`gear.table.weight.cellSubtext`, { weightPerUnit: row.WeightGrams }) : ''}</Typography></TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {row.InServiceDate ? new Date(row.InServiceDate).toLocaleDateString() : t('common:blank')}
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {row.Notes}
              </TableCell>
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
    <SuccessSnackbar open={snackbarOpen} message={t('errors.addedSuccessfully')} onClose={() => setSnackbarOpen(false)} />
  </Loader>;
}

export default RopeTable