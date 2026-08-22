import React, { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";
import { Box, Card, IconButton, Link, List, ListItem, ListItemText, Tooltip, Typography } from "@mui/material";
import Loader from "../Loader";
import { GearItem } from "../../types/types";
import { useTranslation } from "react-i18next";
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import GearServiceModal from "../gear/GearServiceModal";
import ServiceStatusIndicator from "../gear/ServiceStatusIndicator";
import { useNavigate } from "react-router-dom";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

const DashboardGearServiceWidget: React.FC = () => {

    const navigate = useNavigate()

    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [gearToService, setGearToService] = useState<GearItem[]>([]);
    const [gearServiceModalId, setGearServiceModalId] = useState<number | null>(null);

    const loadGear = () => {
        setIsLoading(true)
        apiFetch<GearItem[]>('/api/equipment/gear/widget').then(gear => {
            setGearToService(gear);

        }).finally(() => setIsLoading(false))
    }

    useEffect(() => {
        loadGear();
    }, [])

    if (!isLoading && gearToService.length === 0) {
        return null
    }

    function displayDate(date: string): string {
        return new Date(date).toLocaleDateString(undefined, { dateStyle: "medium" });
    }

    // Checks if an item has reached/passed its retirement date
    function isRetiredOrDue(retirementDate: string | null | undefined): boolean {
        if (!retirementDate) return false;
        return new Date(retirementDate) <= new Date();
    }

    function renderServiceText(item: GearItem): React.ReactNode {
        // Priority 1: Retired / Approaching Retirement
        if (isRetiredOrDue(item.RetirementDate)) {
            return <Tooltip title={t('translation:dashboard.retirementDateTooltip', { date: displayDate(item.RetirementDate!) })} >
                <ErrorOutlineOutlinedIcon color="error" />
            </Tooltip >


        }

        return null;
    }

    return <><Typography variant="h6" mb={2}>
        {t('translation:dashboard.gearToService')}
    </Typography>
        <Typography component="p" color="textSecondary" fontSize={12}>
            {t('translation:dashboard.gearToServiceInfo')}
        </Typography>
        <Card>
            <Loader isLoading={isLoading}>
                <GearServiceModal open={gearServiceModalId !== null} gearId={gearServiceModalId}
                    initialValues={{
                        statusCode: gearToService.find(s => s.Id === gearServiceModalId)?.LatestStatusCode,
                    }}
                    onClose={() => {
                        setGearServiceModalId(null);
                    }} onSaved={() => {
                        setGearServiceModalId(null);
                        loadGear()
                    }} />

                <List dense>
                    {gearToService.length > 0 ? gearToService.map(i => {

                        return <ListItem
                            key={i.Id}
                            secondaryAction={
                                <IconButton onClick={() => setGearServiceModalId(i.Id)}>
                                    <HomeRepairServiceIcon />
                                </IconButton>
                            }>
                            <ListItemText
                                primary={<Link display='flex' gap={1} onClick={() => navigate(`/settings/gear/${i.Id}`)} sx={{ cursor: 'pointer' }}>
                                    <ServiceStatusIndicator isRetired={i.IsRetired} statusCode={i.LatestStatusCode} />{i.Name}
                                </Link>}
                                secondary={t('translation:gear.makeAndModel', { make: i.Manufacturer, model: i.Model })}
                            />
                            <Typography
                                mr={2}
                                variant='caption'
                                color='textSecondary'
                                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}
                            >
                                {renderServiceText(i)}
                            </Typography>
                        </ListItem>
                    }) : <Box display={'flex'} height={'100px'} alignItems={'center'} justifyContent={'center'}><Typography variant="body2" color="textSecondary">{t('translation:dashboard.noGearToMonitor')}</Typography></Box>}
                </List>
            </Loader>
        </Card >
    </>;
}

export default DashboardGearServiceWidget;