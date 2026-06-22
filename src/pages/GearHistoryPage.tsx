import Typography from "@mui/material/Typography";
import PageTemplate from "./PageTemplate";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import GearServiceHistory from "../components/gear/GearServiceHistory";
import { Box, Button, Divider, Paper, Stack, Tab, Tabs } from "@mui/material";
import GearServiceModal from "../components/gear/GearServiceModal";
import AddIcon from '@mui/icons-material/Add';
import GearServiceDescents from "../components/gear/GearServiceDescents";
import { load as loadGear } from "../helpers/EquipmentDataStore";
import { GearItem } from "../types/types";


const GearHistoryPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id?: string }>();
    const idParam = id ? parseInt(id) : undefined;

    const [activeTab, setActiveTab] = useState(0);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gear, setGear] = useState<GearItem | null>(null);

    const gearSummary = useMemo(() => {
        if (!gear) {
            return [];
        }

        const fields = [
            gear.Manufacturer ? { label: t('gear.manufacturer'), value: gear.Manufacturer } : null,
            gear.Model ? { label: t('gear.model'), value: gear.Model } : null,
            gear.SerialNumber ? { label: t('gear.serialNumber'), value: gear.SerialNumber } : null,
            gear.WeightGrams != null ? { label: t('gear.weightGrams'), value: `${gear.WeightGrams}` } : null,
            gear.ManufactureDate ? { label: t('gear.manufactureDate'), value: new Date(gear.ManufactureDate).toLocaleDateString() } : null,
            gear.InServiceDate ? { label: t('gear.inServiceDate'), value: new Date(gear.InServiceDate).toLocaleDateString() } : null,
            gear.RetirementDate ? { label: t('gear.retirementDate'), value: new Date(gear.RetirementDate).toLocaleDateString() } : null,
        ];

        return fields.filter((field): field is { label: string; value: string } => field !== null);
    }, [gear, t]);

    useEffect(() => {
        if (!idParam) {
            setGear(null);
            return;
        }

        setIsLoading(true);
        loadGear().then(data => {
            var gear = data.gear.find(s => s.Id === idParam) ?? null;
            setGear(gear);
        }).catch(err => {
            console.error("Error loading gear:", err);
            setGear(null);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [idParam]);

    return <PageTemplate pageTitle={t('gear.itemPage.title', {context: 'gear'})} isAuthRequired={true} isLoading={isLoading}>
        <GearServiceModal gearId={idParam ?? 0} open={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} />

        <Box sx={{ mb: 3 }}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                    <Box>
                        <Typography variant="overline" color="text.secondary">
                            {gear?.Category}
                        </Typography>
                        <Typography variant="h5" component="h1">
                            {gear?.Name ?? t('gear.itemPage.title')}
                        </Typography>
                    </Box>

                    {gearSummary.length > 0 && (
                        <>
                            <Divider />
                            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" flexGrow={1} flexShrink={1}>
                                {gearSummary.map(field => (
                                    <Box key={field.label} minWidth={120} flexGrow={1} flexShrink={1}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {field.label}
                                        </Typography>
                                        <Typography variant="body2">{field.value}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </>
                    )}
                </Stack>
            </Paper>
        </Box>

        <Button variant="contained" color="primary" onClick={() => setIsServiceModalOpen(true)} sx={{ mb: 2 }} startIcon={<AddIcon />}>
            {t('gear.itemPage.addServiceButton')}
        </Button>
        <Tabs value={activeTab} indicatorColor='secondary' onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>

            <Tab label={t('gear.itemPage.canyonHistoryTab')} />
            <Tab label={t('gear.itemPage.serviceHistoryTab')} />
        </Tabs>
        {activeTab === 0 && <GearServiceDescents gearId={idParam ?? 0} />}
        {activeTab === 1 && <GearServiceHistory gearId={idParam ?? 0} />}
    </PageTemplate>
}

export default GearHistoryPage;