import React, { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { Canyon } from '../../types/Canyon';
import { Table, TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, Button, Box } from '@mui/material';
import CanyonRating from '../CanyonRating';
import AddCanyonModal from '../AddCanyonModal';
import RowActions from '../RowActions';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import CanyonTypeTableCell from '../table/CanyonTypeCell';
import CanyonNameTableCell from '../table/CanyonNameCell';
import FilterPanel, { FilterValues } from '../FilterPanel';
import {
  getCanyonNameFilterConfig, getDataSourceConfig, getRegionFilterConfig, getVerifiedFilterConfig,
} from '../../helpers/filterConfigs';
import { useTranslation } from 'react-i18next';
import { GetRegionDisplayName } from '../../helpers/RegionHelper';
import RegionIcon from '../RegionIcon';

const EditCanyons: React.FC = () => {

    const [editCanyon, setEditCanyon] = useState<Canyon | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [canyons, setCanyons] = useState<Canyon[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation();

    const refresh = () => {
        setIsLoading(true);
        apiFetch<Canyon[]>('/api/canyons/verify')
            .then(setCanyons)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (!isLoading) {
            refresh();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const filterFn = useCallback((canyon: Canyon, values: FilterValues) => {
        if (values.name && !canyon.Name.toLowerCase().includes((values.name as string).toLowerCase())) return false;
        if (values.region !== null && canyon.RegionId !== values.region) return false;
        if (values.verified === 'verified' && !canyon.IsVerified) return false;
        if (values.verified === 'unverified' && canyon.IsVerified) return false;
        if (values.dataSource?.length > 0 && !values.dataSource.includes(canyon.SourceId)) {
            return false;
        };
        return true;
    }, []);

    return <>
    <AddCanyonModal canyon={null} open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} title={t('admin.addCanyon')} showSource />
    <AddCanyonModal canyon={editCanyon} open={editCanyon != null} onClose={() => {setEditCanyon(null)}} onSuccess={refresh} title={t('settings.editCanyon')} showSource />
    <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            {t('admin.addCanyon')}
        </Button>
    </Box>
    <FilterPanel<Canyon>
        items={canyons}
        config={[getCanyonNameFilterConfig(), getRegionFilterConfig(),  getDataSourceConfig(), getVerifiedFilterConfig(),]}
        filterFn={filterFn}
    >
        {(filteredCanyons) => <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>{t('common:fields.name')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('common:fields.grade')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('common:fields.region')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('common:canyon.canyonType')}</TableCell>
                    <TableCell>{t('common:actions.edit')}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('common:fields.verified')}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredCanyons.map(canyon => (
                    <TableRow key={canyon.Id}>
                        <CanyonNameTableCell name={canyon.Name} detailUrl={canyon.Id ? `/canyons/${canyon.Id}` : null} />
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            <CanyonRating
                                aquaticRating={canyon.AquaticRating}
                                verticalRating={canyon.VerticalRating}
                                commitmentRating={canyon.CommitmentRating}
                                starRating={canyon.StarRating}
                                isUnrated={canyon.IsUnrated}
                            />
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            <RegionIcon regionSlug={canyon.RegionSlug ?? ''} regionSymbol={canyon.RegionSymbol} size={16} />&nbsp;{GetRegionDisplayName(canyon.RegionSlug)}
                        </TableCell>
                        <CanyonTypeTableCell type={canyon.CanyonType} sx={{ display: { xs: 'none', sm: 'table-cell' } }} />
                        <TableCell>
                            <RowActions onEdit={() => setEditCanyon(canyon)} /> 
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                            {canyon.IsVerified ? <CheckIcon color='success'/> : <CloseIcon color='error'/>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>}
    </FilterPanel></>;
}

export default EditCanyons;

