import React, { useEffect, useState } from 'react';
import Loader from '../Loader';
import { Box, Button, Chip, Paper, Popover, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { GearItem, GearItemSet } from '../../types/types';
import * as EquipmentDataStore from "../../helpers/EquipmentDataStore";
import RowActions from '../RowActions';
import GearSetModal from './GearSetModal';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDeleteModal from '../ConfirmDeleteModal';

function sortGearSets(a: GearItemSet, b: GearItemSet) {
    return a.Name.localeCompare(b.Name)
}

const GearSetTable: React.FC = () => {
    const { t } = useTranslation('translation');
    const [isLoading, setIsLoading] = useState(true);

    const [gearSetToDelete, setGearSetToDelete] = useState<GearItemSet | null>(null);
    const [gearSetModalIsOpen, setGearSetModalIsOpen] = useState(false);
    const [gearSetModal, setGearSetModal] = useState<GearItemSet | null>(null);
    const [gearData, setGearSetData] = useState<GearItemSet[]>()
    const [gearItemById, setGearItemsById] = useState<{ [key in number]: GearItem }>({});


    useEffect(() => {
        setIsLoading(true);
        Promise.all([EquipmentDataStore.load(), EquipmentDataStore.loadGearSets()])
            .then(([equipment, sets]) => {
                setGearSetData(sets.sort(sortGearSets));
                const equipmentById: { [key in number]: GearItem } = {}
                equipment.gear.forEach(element => {
                    equipmentById[element.Id] = element;
                });
                setGearItemsById(equipmentById)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [])

    function openModal(gearSet: GearItemSet | null) {
        setGearSetModal(gearSet);
        setGearSetModalIsOpen(true);
    }

    function closeModal() {
        setGearSetModal(null);
        setGearSetModalIsOpen(false);
    }

    async function saveGearSet(gearSet: GearItemSet) {
        gearSet.Id > 0 ?
            await EquipmentDataStore.updateGearSet(gearSet) :
            await EquipmentDataStore.createGearSet(gearSet);
        closeModal();

        // Reload Gear Sets
        EquipmentDataStore.invalidateGearSets();
        EquipmentDataStore.loadGearSets().then(g => setGearSetData(g.sort(sortGearSets)))
    }

    async function deleteGearSet() {
        if (gearSetToDelete === null) return;
        await EquipmentDataStore.deleteGearSet(gearSetToDelete.Id);

        setGearSetToDelete(null);
        EquipmentDataStore.invalidateGearSets();
        EquipmentDataStore.loadGearSets().then(g => setGearSetData(g))
    }

    return <Box>
        <ConfirmDeleteModal
            open={gearSetToDelete != null}
            title={t('gear.gearSet.confirmDeleteTitle', { gearSet: gearSetToDelete?.Name })}
            message={t('gear.gearSet.confirmDeleteMessage', { gearSet: gearSetToDelete?.Name })}
            onConfirm={() => deleteGearSet()}
            onCancel={() => setGearSetToDelete(null)} />
        <GearSetModal isOpen={gearSetModalIsOpen} gearSet={gearSetModal} actionLabel={gearSetModal ? t('common:actions.save') : t('common:actions.create')} onSave={saveGearSet} onClose={closeModal} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Button sx={{ ml: 'auto' }} variant="contained" color="primary" onClick={() => openModal(null)} startIcon={<AddIcon />}>{t('common:actions.create')}</Button>
        </Box>
        <Loader isLoading={isLoading}>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {t('gear.gearSet.title')}
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                {t('gear.gearSet.setItems')}
                            </TableCell>
                            <TableCell>
                                {t('gear.gearSet.totalWeight')}
                            </TableCell>
                            <TableCell>
                                {t('common:actions.edit')}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(gearData?.length ?? 0) > 0 ? gearData?.map(i => {
                            const gearItems = i.Items.map(gearId => gearItemById[gearId]).sort((a, b) => a.Name.localeCompare(b.Name));

                            let gearWeight = 0;
                            let notIncludedItems: string[] = [];

                            gearItems.forEach(item => {
                                gearWeight += item.WeightGrams ?? 0;
                                if (!gearWeight) {
                                    notIncludedItems.push(item.Name);
                                }
                            })

                            return (<TableRow key={i.Id}>
                                <TableCell sx={{ minWidth: 150 }}>
                                    {i.Name}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    <Box display={'flex'} gap={1} flexWrap={'wrap'}>
                                        {gearItems.map(g => <Chip key={g.Id} label={g.Name} size='small' />)}
                                    </Box>
                                </TableCell>
                                <TableCell width={'100px'}>
                                    <Box display="flex" flexDirection="column">
                                        {t('gear.gearSet.weight', { value: gearWeight })}

                                        {notIncludedItems.length > 0 &&
                                            <Tooltip title={notIncludedItems.join('; ')} describeChild>
                                                <Typography variant='caption' color='textSecondary'>{t('gear.gearSet.weightNotIncluded', { count: notIncludedItems.length })}</Typography>
                                            </Tooltip>}

                                    </Box>
                                </TableCell>
                                <TableCell sx={{ minWidth: 100 }}>
                                    <RowActions onEdit={() => openModal(i)} onDelete={() => setGearSetToDelete(i)} />
                                </TableCell>
                            </TableRow>
                            )
                        }
                        ) :
                            <TableRow>
                                <TableCell sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                                    {t('gear.gearSet.emptyTable')}
                                    <Button variant='contained' onClick={() => openModal(null)}>
                                        {t('common:actions.create')}
                                    </Button>
                                </TableCell>
                            </TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>
        </Loader>
    </Box>
}

export default GearSetTable;