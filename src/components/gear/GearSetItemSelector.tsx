import React from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import { GearItem } from '../../types/types';
import { useTranslation } from 'react-i18next';

type GearSetItemSelectorProps = {
    gear: GearItem[];
    value: number[];
    onChange: (value: number[]) => void;
};

function groupGearByCategory(gear: GearItem[]): [string, GearItem[]][] {
    const grouped = gear.reduce((acc, item) => {
        (acc[item.Category] ??= []).push(item);
        return acc;
    }, {} as Record<string, GearItem[]>);

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

const GearSetItemSelector: React.FC<GearSetItemSelectorProps> = ({ gear, value, onChange }) => {
    const { t } = useTranslation('translation');
    const selectedIds = new Set(value);

    function toggleItem(itemId: number) {
        onChange(selectedIds.has(itemId)
            ? value.filter(id => id !== itemId)
            : [...value, itemId]);
    }

    return (
        <Box display="flex" flexDirection="column" gap={2}>
            {groupGearByCategory(gear).map(([category, items]) => (
                <Box key={category} sx={{ mb: 2 }}>
                    <Typography mb={1} display="flex" alignItems="center" justifyContent="space-between">
                        {category}
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap" ml={1}>
                        {items.slice().sort((a, b) => a.Name.localeCompare(b.Name)).map(item => {
                            const isSelected = selectedIds.has(item.Id);

                            return (
                                <Tooltip title={t('gear.makeAndModel', { make: item.Manufacturer, model: item.Model })} enterDelay={250} >
                                    <Chip
                                        key={item.Id}
                                        size="small"
                                        label={item.Name}
                                        variant={isSelected ? 'filled' : 'outlined'}
                                        color={isSelected ? 'info' : 'primary'}
                                        onClick={() => toggleItem(item.Id)}
                                    />
                                </Tooltip>

                            );
                        })}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default GearSetItemSelector;