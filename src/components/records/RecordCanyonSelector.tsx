import React, { useMemo, useState } from "react";
import { CanyonListEntry } from "../../types/Canyon";
import { Box, Button, List, ListItem, ListItemButton, ListItemText, ListSubheader, Paper, TextField, Typography } from "@mui/material";
import { t } from "i18next";
import { isUserCanyonKey, parseCanyonKey } from "../../utils/canyonKey";
import CanyonRating from "../canyons/CanyonRating";
import RegionIcon from "../regions/RegionIcon";
import SourceIcon from "../SourceIcon";
import EditIcon from '@mui/icons-material/Edit';
import Loader from "../Loader";

type RecordCanyonSelectorProps = {
    canyons: CanyonListEntry[];
    value: CanyonListEntry | undefined;
    setCanyon: (canyonId: number | undefined, userCanyonId: number | undefined) => void;
    canyonError?: boolean;
    isLoading?: boolean;
}


const RecordCanyonSelector: React.FC<RecordCanyonSelectorProps> = ({ canyons, value, setCanyon, canyonError, isLoading }) => {

    const [searchFilter, setSearchFilter] = useState<string>('');

    const lowerFilter = useMemo(() => searchFilter.trim().toLowerCase(), [searchFilter]);
    const matchesFilter = (name: string, url?: string) =>
        !lowerFilter || name.toLowerCase().includes(lowerFilter) || (url || '').toLowerCase().includes(lowerFilter);


    const favouriteCanyons = useMemo(() => canyons
        .filter(c => c.IsFavourite && matchesFilter(c.Name, c.Url))
        .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' })), [canyons, lowerFilter]);

    const otherCanyons = useMemo(() => canyons
        .filter(c => !c.IsFavourite && (c.IsVerified) && matchesFilter(c.Name, c.Url))
        .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' })), [canyons, lowerFilter]);

    const handleCanyonSelect = (canyon: CanyonListEntry) => {
        const { canyonId, userCanyonId } = parseCanyonKey(canyon.Key);
        setCanyon(canyonId, userCanyonId);
        setSearchFilter('');
    };

    if (value) {
        return <>
            <Box border={1} borderColor="divider" borderRadius={1} p={2} mb={2} borderLeft={2} sx={{ borderLeftColor: 'secondary.main' }}>
                <Loader isLoading={isLoading ?? false}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={0.5}>
                            <RegionIcon regionSlug={value?.RegionSlug ?? ''} regionSymbol={value?.RegionSymbol} size={16} />
                            <Typography variant="subtitle1" fontWeight={600}>{value.Name}</Typography>
                        </Box>
                        <Typography variant="body2">
                            <SourceIcon sourceLogoUrl={value?.SourceLogoUrl} isUserCanyon={isUserCanyonKey(value?.Key)} size={20} />
                        </Typography>
                    </Box>
                    <Box sx={{ color: 'text.secondary' }}>
                        <CanyonRating
                            aquaticRating={value.AquaticRating}
                            verticalRating={value.VerticalRating}
                            commitmentRating={value.CommitmentRating}
                            starRating={value.StarRating}
                            isUnrated={value.IsUnrated}
                        />
                    </Box>
                </Loader>

            </Box>
            <Box display="flex" gap={1} mt={1}>
                <Button
                    size="small" startIcon={<EditIcon />} onClick={() => {
                        setCanyon(undefined, undefined);
                        setSearchFilter('');
                    }}>
                    {t('record.changeCanyon')}
                </Button>
            </Box>
        </>
    }

    return <Paper sx={{ p: 2, borderLeft: 2, borderColor: 'secondary.main' }}>
        <TextField
            fullWidth
            placeholder={t('record.searchByName')}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            size="small"
            slotProps={{
                "htmlInput": {
                    "data-test": "record-search-canyon"
                }
            }}
            sx={{ mb: 1 }}
            error={canyonError}
            helperText={canyonError ? t('record.canyonRequired') : ''}
        />
        <List component={Paper} elevation={0} sx={{ maxHeight: 320, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'grey.50' }}>
            <Loader isLoading={isLoading ?? false}>
                {favouriteCanyons.length > 0 && (
                    <ListSubheader disableSticky sx={{ lineHeight: '36px', fontWeight: 600 }}>{t('record.favourites')}</ListSubheader>
                )}
                {favouriteCanyons.map((canyon) => (
                    <ListItem key={canyon.Key} disablePadding >
                        <ListItemButton
                            onClick={() => handleCanyonSelect(canyon)}
                            data-test={`record-canyon-search--item-${canyon.Key}`}>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <RegionIcon regionSlug={canyon.RegionSlug ?? ''} regionSymbol={canyon.RegionSymbol} size={16} />
                                            <span>{canyon.Name}</span>
                                        </Box>

                                        <span><SourceIcon sourceLogoUrl={canyon.SourceLogoUrl} isUserCanyon={isUserCanyonKey(canyon.Key)} /></span>
                                    </Box>
                                }
                                secondary={
                                    <CanyonRating aquaticRating={canyon.AquaticRating} verticalRating={canyon.VerticalRating} commitmentRating={canyon.CommitmentRating} starRating={canyon.StarRating} isUnrated={canyon.IsUnrated} />
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
                {otherCanyons.length > 0 && (
                    <ListSubheader disableSticky sx={{ lineHeight: '36px', fontWeight: 600 }}>{t('record.allCanyons')}</ListSubheader>
                )}
                {otherCanyons.map(canyon => (
                    <ListItem key={canyon.Key} disablePadding>
                        <ListItemButton
                            onClick={() => handleCanyonSelect(canyon)}
                            data-test={`record-canyon-search--item-${canyon.Key}`}>
                            <ListItemText
                                primary={
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <RegionIcon regionSlug={canyon.RegionSlug ?? ''} regionSymbol={canyon.RegionSymbol} size={16} />

                                            <span>{canyon.Name}</span>
                                        </Box>
                                        <span><SourceIcon sourceLogoUrl={canyon.SourceLogoUrl} isUserCanyon={isUserCanyonKey(canyon.Key)} /></span>
                                    </Box>
                                }
                                secondary={
                                    <CanyonRating aquaticRating={canyon.AquaticRating} verticalRating={canyon.VerticalRating} commitmentRating={canyon.CommitmentRating} starRating={canyon.StarRating} isUnrated={canyon.IsUnrated} />
                                }
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </Loader>
        </List>
    </Paper>

}

export default RecordCanyonSelector