import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Button, Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getRopeWeightInGrams } from "../../helpers/UnitConverter";
import { apiFetch } from "../../utils/api";
import RowActions from "../RowActions";
import RopeModal from "./RopeModal";
import { useCallback, useEffect, useMemo, useState } from "react";
import SuccessSnackbar from "../SuccessSnackbar";
import * as EquipmentDataStore from "../../helpers/EquipmentDataStore";
import { RopeItem } from "../../types/types";
import Loader from "../Loader";
import ServiceStatusIndicator from "./ServiceStatusIndicator";
import FilterPanel, { FilterConfig, FilterValues } from "../FilterPanel";
import { GearServiceStatus } from "../../types/GearStatusType";
import RopeServiceModal from "./RopeServiceModal";
import AddIcon from '@mui/icons-material/Add';

type RopeStatusFilter = '' | 'good' | 'watch' | 'bad' | 'retired' | 'unknown';
type RopeServiceAgeFilter = '' | 'gt3m' | 'gt6m' | 'gt1y';
type RopeOrderBy = 'name' | 'lastServiceDate' | 'weight';

const getResolvedStatus = (item: RopeItem): GearServiceStatus | null => {
  if (item.IsRetired) {
    return GearServiceStatus.Retired;
  }

  return item.LatestStatusCode ?? null;
};

const getLastServiceDate = (item: RopeItem): Date | null => {
  if (!item.LastServiceDate) {
    return null;
  }

  const date = new Date(item.LastServiceDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isOlderThanMonths = (date: Date, months: number): boolean => {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return date <= cutoff;
};

const RopeTable: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ropes, setRopes] = useState<RopeItem[]>([]);
  const [editRopeId, setEditRopeId] = useState<number | null>(null);
  const [ropeModalOpen, setRopeModalOpen] = useState(false);
  const [serviceModalForRope, setServiceModalForRope] = useState<RopeItem | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadRopes = async () => {
    setIsLoading(true);
    await EquipmentDataStore.load().then(equipment => {
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
    try {
      await EquipmentDataStore.addRope(data);
      loadRopes();
      setSnackbarOpen(true);
    } catch (err: any) {
      if (err.message === 'Unauthorized') navigate('/');
    }
  };

  const filterConfig = useMemo((): FilterConfig[] => [
    {
      type: 'text',
      key: 'query',
      label: t('gear.filters.searchLabel'),
    },
    {
      type: 'single-select',
      key: 'serviceStatus',
      label: t('gear.filters.serviceStatusLabel'),
      labelId: 'rope-status-filter',
      placeholder: t('gear.filters.allServiceStatuses'),
      options: [
        { value: 'good', label: t('gear.serviceStatus.good') },
        { value: 'watch', label: t('gear.serviceStatus.watch') },
        { value: 'bad', label: t('gear.serviceStatus.bad') },
        { value: 'retired', label: t('gear.serviceStatus.retired') },
        { value: 'unknown', label: t('gear.serviceStatus.unknown') },
      ],
    },
    {
      type: 'single-select',
      key: 'serviceAge',
      label: t('gear.filters.lastServiceDateLabel'),
      labelId: 'rope-service-age-filter',
      placeholder: t('gear.filters.allServiceAges'),
      options: [
        { value: 'gt3m', label: t('gear.filters.lastServiceDate.over3Months') },
        { value: 'gt6m', label: t('gear.filters.lastServiceDate.over6Months') },
        { value: 'gt1y', label: t('gear.filters.lastServiceDate.over1Year') },
      ],
    },
    {
      type: 'single-select',
      key: 'orderBy',
      label: t('gear.filters.orderByLabel'),
      labelId: 'rope-order-by-filter',
      showEmptyOption: false,
      options: [
        { value: 'name', label: t('gear.filters.orderBy.name') },
        { value: 'lastServiceDate', label: t('gear.filters.orderBy.lastServiceDate') },
        { value: 'weight', label: t('gear.filters.orderBy.weight') },
      ],
    },
  ], []);

  const filterFn = useCallback((item: RopeItem, values: FilterValues) => {
    const query = String(values.query ?? '').trim().toLowerCase();
    if (query) {
      const searchParts = [item.Name, item.SerialNumber, item.Manufacturer, item.Model]
        .filter(Boolean)
        .map(v => String(v).toLowerCase());
      const matchesText = searchParts.some(v => v.includes(query));
      if (!matchesText) {
        return false;
      }
    }

    const statusFilter = (values.serviceStatus ?? '') as RopeStatusFilter;
    if (statusFilter) {
      const resolvedStatus = getResolvedStatus(item);
      const statusKey: RopeStatusFilter =
        resolvedStatus === GearServiceStatus.Good ? 'good' :
        resolvedStatus === GearServiceStatus.Watch ? 'watch' :
        resolvedStatus === GearServiceStatus.Bad ? 'bad' :
        resolvedStatus === GearServiceStatus.Retired ? 'retired' :
        'unknown';

      if (statusFilter !== statusKey) {
        return false;
      }
    }

    const serviceAge = (values.serviceAge ?? '') as RopeServiceAgeFilter;
    if (serviceAge) {
      const serviceDate = getLastServiceDate(item);
      if (!serviceDate) {
        return true;
      }

      if (serviceAge === 'gt3m' && !isOlderThanMonths(serviceDate, 3)) {
        return false;
      }
      if (serviceAge === 'gt6m' && !isOlderThanMonths(serviceDate, 6)) {
        return false;
      }
      if (serviceAge === 'gt1y' && !isOlderThanMonths(serviceDate, 12)) {
        return false;
      }
    }

    return true;
  }, []);

  return <Loader isLoading={isLoading}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Button sx={{ ml: 'auto' }} variant="contained" color="primary" onClick={() => setRopeModalOpen(true)} startIcon={<AddIcon />}>{t('gear.addRope')}</Button>
    </Box>
    <FilterPanel<RopeItem>
      items={ropes}
      config={filterConfig}
      filterFn={filterFn}
      initialValues={{ orderBy: 'name' }}
    >
      {(filteredRopes, values) => {
        const orderBy = (values.orderBy || 'name') as RopeOrderBy;
        const sortedFilteredRopes = [...filteredRopes].sort((a, b) => {
          if (orderBy === 'lastServiceDate') {
            const aDate = getLastServiceDate(a);
            const bDate = getLastServiceDate(b);
            if (!aDate && !bDate) return 0;
            if (!aDate) return 1;
            if (!bDate) return -1;
            return bDate.getTime() - aDate.getTime();
          }

          if (orderBy === 'weight') {
            const aWeight = getRopeWeightInGrams(a);
            const bWeight = getRopeWeightInGrams(b);
            return bWeight - aWeight;
          }

          return (a.Name || '').localeCompare(b.Name || '', undefined, { sensitivity: 'base' });
        });

        return <TableContainer component={Paper}>
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
              {sortedFilteredRopes.map(row => (
                <TableRow key={row.Id}>
                  <TableCell>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      <ServiceStatusIndicator isRetired={row.IsRetired} statusCode={row.LatestStatusCode} />
                      <Link component="a" color="textPrimary" onClick={() => navigate(`/settings/rope/${row.Id}`)} sx={{ cursor: 'pointer' }}>
                        {row.Name}
                      </Link>
                    </Box>
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
                      onService={async () => setServiceModalForRope(row)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>;
      }}
    </FilterPanel>
    <RopeServiceModal
      ropeId={serviceModalForRope?.Id ?? null}
      open={serviceModalForRope !== null}
      initialValues={{
        statusCode: serviceModalForRope?.LatestStatusCode ?? GearServiceStatus.Good,
      }}
      onSaved={() => {
        void loadRopes();
      }}
      onClose={() => setServiceModalForRope(null)}
    />
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