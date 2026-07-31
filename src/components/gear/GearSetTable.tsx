import React, { useEffect, useState } from 'react';
import Loader from '../Loader';
import { Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { GearItem, GearItemSet } from '../../types/types';
import * as EquipmentDataStore from "../../helpers/EquipmentDataStore";
import RowActions from '../RowActions';
import GearSetModal from './GearSetModal';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';

const GearSetTable: React.FC = () => {
    const { t } = useTranslation('translation');
    const [isLoading, setIsLoading] = useState(true);

    const [gearSetModalIsOpen, setGearSetModalIsOpen] = useState(false);
    const [gearSetModal, setGearSetModal] = useState<GearItemSet | null>(null);
    const [gearData, setGearSetData] = useState<GearItemSet[]>()
    const [gearItemById, setGearItemsById] = useState<{ [key in number]: GearItem }>({});


    useEffect(() => {
        setIsLoading(true);
        Promise.all([EquipmentDataStore.load(), EquipmentDataStore.loadGearSets()])
            .then(([equipment, sets]) => {
                setGearSetData(sets);
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
        EquipmentDataStore.loadGearSets().then(g => setGearSetData(g))
    }

    async function deleteGearSet(gearSet: GearItemSet) {
        await EquipmentDataStore.deleteGearSet(gearSet);

        EquipmentDataStore.invalidateGearSets();
        EquipmentDataStore.loadGearSets().then(g => setGearSetData(g))
    }

    return <Box>
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
                            <TableCell>
                                {t('gear.gearSet.setItems')}
                            </TableCell>
                            <TableCell>
                                {t('common:actions.edit')}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {gearData?.length ?? 0 > 0 ? gearData?.map(i => <TableRow key={i.Id}>
                            <TableCell sx={{ minWidth: 200 }}>
                                {i.Name}
                            </TableCell>
                            <TableCell>
                                <Box display={'flex'} gap={1} flexWrap={'wrap'}>
                                    {i.Items.map(gearId => gearItemById[gearId]).sort((a, b) => a.Name.localeCompare(b.Name)).map(g => <Chip key={g.Id} label={g.Name} size='small' />)}
                                </Box>
                            </TableCell>
                            <TableCell sx={{ minWidth: 100 }}>
                                {/* onDelete={() => deleteGearSet(i)} */}
                                <RowActions onEdit={() => openModal(i)} />
                            </TableCell>
                        </TableRow>) :
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