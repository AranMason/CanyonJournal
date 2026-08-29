import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Link, Box, Button } from "@mui/material";
import { t } from "i18next";
import { apiFetch } from "../../utils/api";
import RowActions from "../RowActions";
import GearModal from "./GearModal";
import GearServiceModal from "./GearServiceModal";
import { useNavigate } from "react-router-dom";
import * as EquipmentDataStore from "../../helpers/EquipmentDataStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GearItem } from "../../types/types";
import SuccessSnackbar from "../SuccessSnackbar";
import Loader from "../Loader";
import ServiceStatusIndicator from "./ServiceStatusIndicator";
import FilterPanel, { FilterConfig, FilterValues } from "../FilterPanel";
import { GearServiceStatus } from "../../types/GearStatusType";
import AddIcon from '@mui/icons-material/Add';
import EmptyCellCta from "../EmptyCellCta";

type GearStatusFilter = '' | 'good' | 'watch' | 'bad' | 'retired' | 'unknown';
type ServiceAgeFilter = '' | 'gt3m' | 'gt6m' | 'gt1y';
type GearOrderBy = 'category' | 'name' | 'lastServiceDate' | 'weight';

const getResolvedStatus = (item: GearItem): GearServiceStatus | null => {
    if (item.IsRetired) {
        return GearServiceStatus.Retired;
    }

    return item.LatestStatusCode ?? null;
};

const getLastServiceDate = (item: GearItem): Date | null => {
    const value = item.LastServiceDate ?? (item as any).LastServicedDate;
    if (!value) {
        return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const isOlderThanMonths = (date: Date, months: number): boolean => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);
    return date <= cutoff;
};

const GearTable: React.FC = () => {
    const navigate = useNavigate();

    const [gear, setGear] = useState<GearItem[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [editGearId, setEditGearId] = useState<number | null>(null);
    const [gearModalOpen, setGearModalOpen] = useState(false);
    const [serviceModalForGear, setServiceModalForGear] = useState<GearItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadGear = async () => {
        setIsLoading(true);
        await EquipmentDataStore.load().then(equipment => {
            setGear(equipment.gear);
        }).catch(err => {
            if (err.message === 'Unauthorized') navigate('/');
        }).finally(() => {
            setIsLoading(false);
        });
    };

    useEffect(() => {
        loadGear();
    }, []);

    const handleAddGear = async (data: GearItem) => {
        try {
            await EquipmentDataStore.addGear(data);
            EquipmentDataStore.invalidate();
            await loadGear();
            setSnackbarOpen(true);
        } catch (err: any) {
            if (err.message === 'Unauthorized') navigate('/');
        }
    };

    const categoryOptions = useMemo(() => {
        const uniqueCategories = Array.from(new Set(gear.map(g => (g.Category || '').trim()).filter(Boolean)));
        uniqueCategories.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        return uniqueCategories.map(category => ({ value: category, label: category }));
    }, [gear]);

    const filterConfig = useMemo((): FilterConfig[] => [
        {
            type: 'text',
            key: 'query',
            label: t('gear.filters.searchLabel'),
        },
        {
            type: 'single-select',
            key: 'category',
            label: t('gear.category'),
            labelId: 'gear-category-filter',
            placeholder: t('gear.filters.allCategories'),
            options: categoryOptions,
        },
        {
            type: 'single-select',
            key: 'serviceStatus',
            label: t('gear.filters.serviceStatusLabel'),
            labelId: 'gear-status-filter',
            placeholder: t('gear.filters.allServiceStatuses'),
            options: [GearServiceStatus.None, GearServiceStatus.Good, GearServiceStatus.Watch, GearServiceStatus.Bad, GearServiceStatus.Retired].map(s => {
                return { value: s, label: t('gear.serviceStatus', { context: s }) }
            })
        },
        {
            type: 'single-select',
            key: 'serviceAge',
            label: t('gear.filters.lastServiceDateLabel'),
            labelId: 'gear-service-age-filter',
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
            labelId: 'gear-order-by-filter',
            placeholder: t('gear.filters.orderByLabel'),
            showEmptyOption: false,
            options: [
                { value: 'category', label: t('gear.filters.orderBy.category') },
                { value: 'name', label: t('gear.filters.orderBy.name') },
                { value: 'lastServiceDate', label: t('gear.filters.orderBy.lastServiceDate') },
                { value: 'weight', label: t('gear.filters.orderBy.weight') },
            ],
        },
    ], [categoryOptions]);

    const filterFn = useCallback((item: GearItem, values: FilterValues) => {
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

        const category = String(values.category ?? '').trim();
        if (category && (item.Category || '').trim() !== category) {
            return false;
        }

        const statusFilter = (values.serviceStatus ?? '') as GearStatusFilter;
        if (statusFilter) {
            const resolvedStatus = getResolvedStatus(item);
            const statusKey: GearStatusFilter =
                resolvedStatus === GearServiceStatus.Good ? 'good' :
                    resolvedStatus === GearServiceStatus.Watch ? 'watch' :
                        resolvedStatus === GearServiceStatus.Bad ? 'bad' :
                            resolvedStatus === GearServiceStatus.Retired ? 'retired' :
                                'unknown';

            if (statusFilter !== statusKey) {
                return false;
            }
        }

        const serviceAge = (values.serviceAge ?? '') as ServiceAgeFilter;
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
            <Button sx={{ ml: 'auto' }} variant="contained" color="primary" onClick={() => setGearModalOpen(true)} startIcon={<AddIcon />}>{t('gear.addGear')}</Button>
        </Box>
        <FilterPanel<GearItem>
            items={gear}
            config={filterConfig}
            filterFn={filterFn}
            initialValues={{ orderBy: 'category' }}
        >
            {(filteredGear, values) => {
                const orderBy = (values.orderBy || 'category') as GearOrderBy;
                const sortedFilteredGear = [...filteredGear].sort((a, b) => {
                    if (orderBy === 'name') {
                        return (a.Name || '').localeCompare(b.Name || '', undefined, { sensitivity: 'base' });
                    }

                    if (orderBy === 'lastServiceDate') {
                        const aDate = getLastServiceDate(a);
                        const bDate = getLastServiceDate(b);
                        if (!aDate && !bDate) return 0;
                        if (!aDate) return 1;
                        if (!bDate) return -1;
                        return bDate.getTime() - aDate.getTime();
                    }

                    if (orderBy === 'weight') {
                        const aWeight = a.WeightGrams ?? Number.NEGATIVE_INFINITY;
                        const bWeight = b.WeightGrams ?? Number.NEGATIVE_INFINITY;
                        return bWeight - aWeight;
                    }

                    const categoryCompare = (a.Category || '').localeCompare(b.Category || '', undefined, { sensitivity: 'base' });
                    if (categoryCompare !== 0) {
                        return categoryCompare;
                    }
                    return (a.Name || '').localeCompare(b.Name || '', undefined, { sensitivity: 'base' });
                });

                return <TableContainer component={Paper} sx={{ borderLeft: 2, borderColor: 'secondary.main' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('common:fields.name')}</TableCell>
                                <TableCell>{t('gear.category')}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.weight.title')}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('gear.table.date_acquired.title')}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('common:fields.notes')}</TableCell>
                                <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {gear.length === 0 && <TableRow>
                                <TableCell colSpan={6}>
                                    <EmptyCellCta
                                        description={t('gear.addGearText')}
                                        cta={t('gear.addGear')}
                                        ctaIcon={<AddIcon />}
                                        ctaAction={() => {
                                            setGearModalOpen(true)
                                        }} />
                                </TableCell></TableRow>}
                            {sortedFilteredGear.map(row => (
                                <TableRow key={row.Id}>
                                    <TableCell>
                                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                                            <ServiceStatusIndicator isRetired={row.IsRetired} statusCode={row.LatestStatusCode} />
                                            <Link component="a" color="textPrimary" onClick={() => navigate(`/settings/gear/${row.Id}`)} sx={{ cursor: 'pointer' }}>{row.Name}</Link>
                                        </Box>
                                        <br />
                                        <Typography variant="caption" color="textSecondary">{t('gear.makeAndModel', { make: row.Manufacturer, model: row.Model })}</Typography>
                                    </TableCell>
                                    <TableCell>{row.Category}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.WeightGrams ? t(`gear.table.weight.cell`, { weight: row.WeightGrams }) : t('common:blank')}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.InServiceDate ? new Date(row.InServiceDate).toLocaleDateString() : t('common:blank')}</TableCell>

                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.Notes}</TableCell>
                                    <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 120 }}>
                                        <RowActions
                                            onEdit={async () => setEditGearId(row.Id)}
                                            onService={async () => setServiceModalForGear(row)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>;
            }}
        </FilterPanel>
        <GearServiceModal
            gearId={serviceModalForGear?.Id ?? null}
            open={serviceModalForGear !== null}
            initialValues={{
                statusCode: serviceModalForGear?.LatestStatusCode,
            }}
            onSaved={() => {
                EquipmentDataStore.load().then(equipment => {
                    setGear(equipment.gear);
                });
                serviceModalForGear?.Id && EquipmentDataStore.loadGearHistory(serviceModalForGear?.Id);
                setServiceModalForGear(null)
            }}
            onClose={() => setServiceModalForGear(null)}
        />
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
        <SuccessSnackbar open={snackbarOpen} message={t('errors.addedSuccessfully')} onClose={() => setSnackbarOpen(false)} />
    </Loader>
}

export default GearTable;