import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { Canyon } from '../../types/Canyon';
import { Table, TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, Stack, TextField, FormControl, InputLabel, Select, MenuItem, Button, ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import CanyonRating from '../CanyonRating';
import AddCanyonModal from '../AddCanyonModal';
import RowActions from '../RowActions';
import { GetRegionDisplayName } from '../../helpers/EnumMapper';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import CanyonTypeTableCell from '../table/CanyonTypeCell';
import CanyonNameTableCell from '../table/CanyonNameCell';
import RegionType, { RegionTypeList } from '../../types/RegionEnum';

const EditCanyons: React.FC = () => {

    const [editCanyon, setEditCanyon] = useState<Canyon | null>(null);
    const [addOpen, setAddOpen] = useState(false);
    const [canyons, setCanyons] = useState<Canyon[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [regionFilter, setRegionFilter] = useState<RegionType | ''>('');
    const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');

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

    const filteredCanyons = useMemo(() => {
        return canyons.filter(c => {
            if (searchText && !c.Name.toLowerCase().includes(searchText.toLowerCase())) return false;
            if (regionFilter !== '' && c.Region !== regionFilter) return false;
            if (verifiedFilter === 'verified' && !c.IsVerified) return false;
            if (verifiedFilter === 'unverified' && c.IsVerified) return false;
            return true;
        });
    }, [canyons, searchText, regionFilter, verifiedFilter]);

    const clearFilters = () => {
        setSearchText('');
        setRegionFilter('');
        setVerifiedFilter('all');
    };

    const hasActiveFilters = searchText !== '' || regionFilter !== '' || verifiedFilter !== 'all';

    return <>
    <AddCanyonModal canyon={null} open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} title="Add New Canyon" />
    <AddCanyonModal canyon={editCanyon} open={editCanyon != null} onClose={() => {setEditCanyon(null)}} onSuccess={refresh} />
    <Stack spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <TextField
                label="Search by name"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                size="small"
                sx={{ minWidth: 220 }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel id="region-filter-label">Region</InputLabel>
                <Select
                    labelId="region-filter-label"
                    label="Region"
                    value={regionFilter}
                    onChange={e => setRegionFilter(e.target.value as RegionType | '')}
                >
                    <MenuItem value="">All Regions</MenuItem>
                    {RegionTypeList.map(r => (
                        <MenuItem key={r} value={r}>{GetRegionDisplayName(r)}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <ToggleButtonGroup
                value={verifiedFilter}
                exclusive
                size="small"
                onChange={(_, val) => val && setVerifiedFilter(val)}
            >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="verified">Verified</ToggleButton>
                <ToggleButton value="unverified">Unverified</ToggleButton>
            </ToggleButtonGroup>
            {hasActiveFilters && (
                <Button size="small" onClick={clearFilters}>Clear</Button>
            )}
            <Box flex={1} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
                Add Canyon
            </Button>
        </Stack>
    </Stack>
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Edit</TableCell>
                    <TableCell>Is Verified</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredCanyons.map(canyon => (
                    <TableRow key={canyon.Id}>
                        <CanyonNameTableCell name={canyon.Name} detailUrl={canyon.Id ? `/canyons/${canyon.Id}` : null} />
                        <TableCell>
                            <CanyonRating
                                aquaticRating={canyon.AquaticRating}
                                verticalRating={canyon.VerticalRating}
                                commitmentRating={canyon.CommitmentRating}
                                starRating={canyon.StarRating}
                                isUnrated={canyon.IsUnrated}
                            />
                        </TableCell>
                        <TableCell>
                            {GetRegionDisplayName(canyon.Region)}
                        </TableCell>
                        <CanyonTypeTableCell type={canyon.CanyonType} />
                        <TableCell>
                            <RowActions onEdit={() => setEditCanyon(canyon)} /> 
                        </TableCell>
                        <TableCell>
                            {canyon.IsVerified ? <CheckIcon color='success'/> : <CloseIcon color='error'/>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer></>;
}

export default EditCanyons;