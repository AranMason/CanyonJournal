import Typography from "@mui/material/Typography";
import PageTemplate from "./PageTemplate";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { Box, Breadcrumbs, Button, Divider, Link, Paper, Stack, Tab, Tabs } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { load as loadRope } from "../helpers/EquipmentDataStore";
import { RopeItem } from "../types/types";
import RopeDescentHistory from "../components/gear/RopeDescentHistory";
import RopeServiceHistory from "../components/gear/RopeServiceHistory";
import RopeServiceModal from "../components/gear/RopeServiceModal";
import ServiceStatusIndicator from "../components/gear/ServiceStatusIndicator";
import { GearServiceStatus } from "../types/GearStatusType";


const GearHistoryPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const idParam = id ? parseInt(id) : undefined;

    const [activeTab, setActiveTab] = useState(0);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [rope, setRope] = useState<RopeItem | null>(null);

    const gearSummary = useMemo(() => {
        if (!rope) {
            return [];
        }

        const fields = [
            rope.Manufacturer ? { label: t('gear.manufacturer'), value: rope.Manufacturer } : null,
            rope.Model ? { label: t('gear.model'), value: rope.Model } : null,
            rope.SerialNumber ? { label: t('gear.serialNumber'), value: rope.SerialNumber } : null,
            rope.WeightGrams != null ? { label: t('gear.weightGrams'), value: `${rope.WeightGrams} g/m` } : null,
            rope.ManufactureDate ? { label: t('gear.manufactureDate'), value: new Date(rope.ManufactureDate).toLocaleDateString() } : null,
            rope.InServiceDate ? { label: t('gear.inServiceDate'), value: new Date(rope.InServiceDate).toLocaleDateString() } : null,
            rope.RetirementDate ? { label: t('gear.retirementDate'), value: new Date(rope.RetirementDate).toLocaleDateString() } : null,
        ];

        return fields.filter((field): field is { label: string; value: string } => field !== null);
    }, [rope, t]);

    useEffect(() => {
        if (!idParam) {
            setRope(null);
            return;
        }

        setIsLoading(true);
        loadRope().then(data => {
            var rope = data.ropes.find(s => s.Id === idParam) ?? null;
            setRope(rope);
        }).catch(err => {
            console.error("Error loading gear:", err);
            setRope(null);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [idParam]);

    return <PageTemplate pageTitle={t('gear.itemPage.title', { context: 'rope' })} isAuthRequired={true} isLoading={isLoading}>
        <RopeServiceModal
            ropeId={idParam ?? 0}
            open={isServiceModalOpen}
            initialValues={{ statusCode: rope?.LatestStatusCode ?? GearServiceStatus.Good }}
            onSaved={async () => {
                const data = await loadRope();
                const current = data.ropes.find(s => s.Id === idParam) ?? null;
                setRope(current);
            }}
            onClose={() => setIsServiceModalOpen(false)}
        />

        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <Link
                component="button"
                underline="hover"
                color="primary"
                onClick={() => navigate("/settings/gear?tab=2")}
                sx={{ cursor: 'pointer' }}
            >
                {t('gear.title')}
            </Link>
            <Typography sx={{ color: 'text.primary' }}>{rope?.Name}</Typography>
        </Breadcrumbs>

        <Box sx={{ mb: 3 }}>
            <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Stack spacing={1.5}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="h5" component="h1">
                                {rope?.Name ?? t('gear.itemPage.title')}
                            </Typography>
                            <ServiceStatusIndicator isRetired={rope?.IsRetired ?? false} statusCode={rope?.LatestStatusCode} />
                        </Stack>
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
        {activeTab === 0 && <RopeDescentHistory ropeId={idParam ?? 0} />}
        {activeTab === 1 && <RopeServiceHistory ropeId={idParam ?? 0} />}
    </PageTemplate>
}

export default GearHistoryPage;