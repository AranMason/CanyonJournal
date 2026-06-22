import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, Link, Box, Button } from "@mui/material";
import { t } from "i18next";
import { apiFetch } from "../../utils/api";
import RowActions from "../RowActions";
import GearModal from "./GearModal";
import GearServiceModal from "./GearServiceModal";
import { useNavigate } from "react-router-dom";
import * as EquipmentDataStore from "../../helpers/EquipmentDataStore";
import { useEffect, useState } from "react";
import { GearItem } from "../../types/types";
import SuccessSnackbar from "../SuccessSnackbar";
import Loader from "../Loader";

const GearTable: React.FC = () => {
    const navigate = useNavigate();

    const [gear, setGear] = useState<GearItem[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [editGearId, setEditGearId] = useState<number | null>(null);
    const [gearModalOpen, setGearModalOpen] = useState(false);
    const [serviceModalForGearId, setServiceModalForGearId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadGear = () => {
        setIsLoading(true); EquipmentDataStore.load().then(equipment => {
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
        setIsLoading(true);
        try {
            await EquipmentDataStore.addGear(data);
            EquipmentDataStore.invalidate();
            await loadGear();
            setSnackbarOpen(true);
        } catch (err: any) {
            if (err.message === 'Unauthorized') navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    return <Loader isLoading={isLoading}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Button sx={{ ml: 'auto' }} variant="contained" color="primary" onClick={() => setGearModalOpen(true)}>{t('gear.addGear')}</Button>
        </Box>
        <TableContainer component={Paper}>
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
                    {gear.map(row => (
                        <TableRow key={row.Id}>
                            <TableCell>
                                <Link component="a" color="textPrimary" onClick={() => navigate(`/settings/gear/${row.Id}`)} sx={{ cursor: 'pointer' }}>{row.Name}</Link><br/>
                                <Typography variant="caption" color="textSecondary">{row.Manufacturer} {row.Model}</Typography>
                            </TableCell>
                            <TableCell>{row.Category}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.WeightGrams ? t(`gear.table.weight.cell`, { weight: row.WeightGrams }) : t('common:blank')}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.InServiceDate ? new Date(row.InServiceDate).toLocaleDateString() : t('common:blank')}</TableCell>

                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{row.Notes}</TableCell>
                            <TableCell align="right" sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 120 }}>
                                <RowActions
                                    onEdit={async () => setEditGearId(row.Id)}
                                    onService={async () => setServiceModalForGearId(row.Id)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <GearServiceModal gearId={serviceModalForGearId} open={serviceModalForGearId !== null} onClose={() => setServiceModalForGearId(null)} />
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