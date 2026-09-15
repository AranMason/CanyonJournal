import React, { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../utils/api';
import { Table, TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, Button, Box, Pagination, MenuItem, FormControl, InputLabel, Select, TextField } from '@mui/material';
import CanyonRating from './CanyonRating';
import AddCanyonModal from './AddCanyonModal';
import RowActions from '../RowActions';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import CanyonTypeTableCell from '../table/CanyonTypeCell';
import CanyonNameTableCell from '../table/CanyonNameCell';
import { FilterValues } from '../FilterPanel';
import { useTranslation } from 'react-i18next';
import { AdminFilter, AdminFilterResults } from '../../types/Admin';
import { CanyonData } from '../../../routes/types/Canyon.type';
import { DataSource } from '../../types/DataSource';

const EditCanyons: React.FC = () => {

    const [editCanyon, setEditCanyon] = useState<CanyonData | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [canyons, setCanyonsOnPage] = useState<AdminFilterResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState<AdminFilter>({
        page: 1,
        pageSize: 50,
        text: '',
        isVerified: null,
        dataSourceId: null
    })
    const [dataSource, setDataSources] = useState<DataSource[]>()
    const { t } = useTranslation();

    const refresh = () => {
        setIsLoading(true);
        apiPost<AdminFilterResults, AdminFilter>('/api/canyons/verify', filter)
            .then(setCanyonsOnPage)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (!isLoading) {
            refresh();
        }
    }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        apiGet<DataSource[]>('/api/sources').then(setDataSources)
    }, [])

    return <>
        <AddCanyonModal canyon={null} open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} title={t('admin.addCanyon')} showSource />
        <AddCanyonModal canyon={editCanyon} open={editCanyon != null} onClose={() => { setEditCanyon(null) }} onSuccess={refresh} title={t('settings.editCanyon')} showSource />
        <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
                {t('admin.addCanyon')}
            </Button>
        </Box>

        <Box display="flex" gap={2} mb={2}>

            {/* Name filter */}
            <TextField
                label="Name"
                variant="outlined"
                value={filter.text}
                sx={{ flex: 1 }}
                onChange={(e) =>
                    setFilter({ ...filter, text: e.target.value })
                }
            />

            {/* Verified dropdown */}
            <FormControl sx={{ flex: 1 }}>
                <InputLabel>Verified</InputLabel>
                <Select
                    label="Verified"
                    value={
                        filter.isVerified === null
                            ? ""
                            : filter.isVerified === true
                                ? "true"
                                : "false"
                    }
                    onChange={(e) => {
                        const val = e.target.value;

                        setFilter({
                            ...filter,
                            isVerified:
                                val === "" ? null :
                                    val === "true" ? true :
                                        false
                        });
                    }}
                >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="true">Verified</MenuItem>
                    <MenuItem value="false">Not Verified</MenuItem>
                </Select>

            </FormControl>

            {/* Data source dropdown */}
            <FormControl sx={{ flex: 1, minWidth: 180 }}>
                <InputLabel>Data Source</InputLabel>
                <Select
                    label="Data Source"
                    value={filter.dataSourceId}
                    onChange={(e) => {
                        let val = Number(e.target.value);
                        setFilter({
                            ...filter,
                            dataSourceId: val === 0 ? null : val
                        })
                    }
                    }
                >
                    <MenuItem value={0}>All</MenuItem>
                    {dataSource?.map(ds => <MenuItem key={ds.Id} value={ds.Id}>{ds.DisplayName}</MenuItem>)}
                </Select>
            </FormControl>

        </Box>
        <TableContainer component={Paper} sx={{ borderLeft: 2, borderColor: 'secondary.main' }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>{t('common:fields.name')}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{t('common:canyon.canyonType')}</TableCell>
                        <TableCell>{t('common:actions.edit')}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{t('common:fields.verified')}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {canyons?.results.map(canyon => (
                        <TableRow key={canyon.Id}>
                            <TableCell>
                                <CanyonNameTableCell
                                    canyon={canyon} detailUrl={canyon.Id ? `/canyons/${canyon.Id}` : null} subtitle={<CanyonRating
                                        aquaticRating={canyon.AquaticRating}
                                        verticalRating={canyon.VerticalRating}
                                        commitmentRating={canyon.CommitmentRating}
                                        starRating={canyon.StarRating}
                                        isUnrated={canyon.IsUnrated}
                                    />} />
                            </TableCell>
                            <CanyonTypeTableCell type={canyon.CanyonType} sx={{ display: { xs: 'none', sm: 'table-cell' } }} />
                            <TableCell>
                                <RowActions onEdit={() => setEditCanyon(canyon)} />
                            </TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                {canyon.IsVerified ? <CheckIcon color='success' /> : <CloseIcon color='error' />}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <Box my={2} display="flex" justifyContent="center">
            <Pagination
                page={filter.page}
                onChange={(e, page) => {
                    e.preventDefault();
                    setFilter({
                        ...filter,
                        page
                    });
                }}
                count={canyons?.totalPages ?? 1} />
        </Box>
    </>;
}

export default EditCanyons;

