import React, { useEffect, useState } from 'react';
import { CanyonFilterForm } from '../../types/Canyon';
import AppModal from '../AppModal';
import { Button, DialogActions, DialogContent, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RegionTreePicker from '../regions/RegionTreePicker';
import MultiSelectChipFilter from '../MultiSelectChipFilter';
import { CanyonTypeList } from '../../types/CanyonTypeEnum';
import { GetCanyonTypeDisplayName } from '../../helpers/EnumMapper';
import * as RegionDataStore from '../../helpers/data/RegionDataStore';

type CanyonFilterModalProps = {
    isOpen: boolean;
    initialFilterValues: CanyonFilterForm;
    onFilter: (filter: CanyonFilterForm) => void
    onClose: () => void;
}

const CanyonTypeFilters = CanyonTypeList.map(t => ({ value: t, label: GetCanyonTypeDisplayName(t) }));

const CanyonFilterModal: React.FC<CanyonFilterModalProps> = ({ isOpen, initialFilterValues, onClose, onFilter }) => {
    const { t } = useTranslation('translation');
    const [newFilterOptions, setNewFitlerOptions] = useState<CanyonFilterForm>(initialFilterValues);
    const [regionIds, setRegionIds] = useState<number[]>([]);
    // TODO: Set Default Region for Searching

    useEffect(() => {
        // Reset the initial values
        if (isOpen) {
            setNewFitlerOptions(initialFilterValues);
        }
    }, [isOpen, initialFilterValues])

    useEffect(() => {
        RegionDataStore.load().then(r => {
            setRegionIds(r.map(x => x.Id))
        });
    }, [])

    function getRatingValue(val: string): number {
        var intVal = parseInt(val);
        return Math.max(0, Math.min(7, intVal))
    }

    return <AppModal open={isOpen} onClose={onClose} title={t('translation:canyonFilterModal.title')}>
        <DialogContent sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <TextField
                label={t('translation:canyonFilterModal.canyonName')}
                variant="outlined"
                value={newFilterOptions.text}
                onChange={e => setNewFitlerOptions({ ...newFilterOptions, text: e.target.value })}
                fullWidth
            />
            <RegionTreePicker
                value={newFilterOptions.region}
                onChange={v => setNewFitlerOptions({ ...newFilterOptions, region: v })}
                label={t('translation:canyonFilterModal.region')}
                availableRegionIds={regionIds}
                allowClear
                size="medium"

            />
            <MultiSelectChipFilter
                label={t('translation:canyonFilterModal.canyonTypes')}
                labelId={'canyon-filter-type'}
                value={newFilterOptions.types ?? []}
                onChange={v => setNewFitlerOptions({ ...newFilterOptions, types: v })}
                options={CanyonTypeFilters}
            />
            <Typography>
                {t('translation:canyonFilterModal.canyonRating')}
            </Typography>
            {/* Vertical Rating */}
            <TextField
                label={t('translation:canyonFilterModal.minVerticalRating')}
                variant="outlined"
                value={newFilterOptions.minVerticalRating}
                onChange={e => setNewFitlerOptions({ ...newFilterOptions, minVerticalRating: getRatingValue(e.target.value) })}
                type='number'
                fullWidth
            />
            {/* Aquatic Rating */}
            <TextField
                label={t('translation:canyonFilterModal.minAquaticRating')}
                variant="outlined"
                value={newFilterOptions.minAquaticRating}
                onChange={e => setNewFitlerOptions({ ...newFilterOptions, minAquaticRating: getRatingValue(e.target.value) })}
                type='number'
                fullWidth
            />
            {/* Commitment Rating */}
            <TextField
                label={t('translation:canyonFilterModal.minCommitmentRating')}
                variant="outlined"
                value={newFilterOptions.minCommitmentRating}
                onChange={e => setNewFitlerOptions({ ...newFilterOptions, minCommitmentRating: getRatingValue(e.target.value) })}
                type='number'
                fullWidth
            />
            {/* Star Rating */}
            <TextField
                label={t('translation:canyonFilterModal.minStarRating')}
                variant="outlined"
                value={newFilterOptions.minStarRating}
                onChange={e => setNewFitlerOptions({ ...newFilterOptions, minStarRating: getRatingValue(e.target.value) })}
                type='number'
                fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button
                variant='outlined'
                onClick={() => {
                    onFilter({
                        region: null,
                        text: '',
                        types: []
                    });
                    onClose();
                }}>{t('common:actions.clear')}</Button>
            <Button
                variant='contained'
                onClick={() => {
                    onFilter(newFilterOptions);
                    onClose();
                }}>{t('common:actions.apply')}</Button>
        </DialogActions>
    </AppModal>;
}

export default CanyonFilterModal