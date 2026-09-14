import React, { useState, useEffect } from "react";
import { CanyonListEntry } from "../../types/Canyon";
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { t } from "i18next";
import { isUserCanyonKey } from "../../utils/canyonKey";
import CanyonRating from "../canyons/CanyonRating";
import RegionIcon from "../regions/RegionIcon";
import SourceIcon from "../SourceIcon";
import EditIcon from '@mui/icons-material/Edit';
import Loader from "../Loader";
import * as CanyonDataStore from "../../helpers/CanyonDataStore";

type RecordCanyonSelectorProps = {
    value: CanyonListEntry | null;
    setCanyon: (canyon: CanyonListEntry | null) => void;
    canyonError?: boolean;
    isLoading?: boolean;
}

const RecordCanyonSelector: React.FC<RecordCanyonSelectorProps> = ({ value, setCanyon, canyonError, isLoading }) => {

    const [isLoadingCanyons, setIsLoadingCanyons] = useState(false);
    const [searchFilter, setSearchFilter] = useState<string>('');
    const [canyons, setCanyons] = useState<CanyonListEntry[]>([]);

    function loadCanyons() {
        setIsLoadingCanyons(true);
        CanyonDataStore.getCanyonPage({
            page: 1,
            pageSize: 20,
            text: searchFilter,
            orderBy: 'Name',
        }).then(c => setCanyons(c.results))
            .finally(() => setIsLoadingCanyons(false))
    }

    useEffect(() => {
        // If we have a selected value, make sure we're not doing unnessessary searches
        if (value) {
            return;
        }
        const delayInputTimeoutId = setTimeout(() => {
            loadCanyons();
        }, 1000);
        return () => clearTimeout(delayInputTimeoutId);
    }, [value, searchFilter, 1000]);

    const handleCanyonSelect = (canyon: CanyonListEntry) => {
        setCanyon(canyon);
    };

    if (value) {
        return <>
            <Box border={1} borderColor="divider" borderRadius={1} p={2} mb={2} borderLeft={2} sx={{ borderLeftColor: 'secondary.main' }}>
                <Loader isLoading={isLoading || isLoadingCanyons || false}>
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
                        setCanyon(null);
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

                {canyons.map(canyon => (
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
                {canyons.length === 0 && <Box height={200} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Typography>No Canyons Found.</Typography>
                </Box>}
            </Loader>
        </List>
    </Paper>

}

export default RecordCanyonSelector