import React from "react";
import { apiFetch } from "../utils/api";
import { DashboardWidget } from "../types/Widgets";
import StatCard from "./StatCard";
import { Box, Typography } from "@mui/material";
import TerrainIcon from "@mui/icons-material/Terrain";
import ExploreIcon from "@mui/icons-material/Explore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useTranslation } from "react-i18next";

const DashboardStats: React.FC = () => {
    const { t } = useTranslation();

    const loadTotalDescents = async (): Promise<{ total: number; regions: number }> => {
        return await apiFetch<{ total: number; regions: number }>(`/api/dashboard/${DashboardWidget.TotalDescents}`);
    };

    const loadUniqueDescents = async (): Promise<{ total: number; thisYear: number }> => {
        return await apiFetch<{ total: number; thisYear: number }>(`/api/dashboard/${DashboardWidget.UniqueDescents}`);
    };

    const loadRecentDescents = async (): Promise<{ currentYear: number, priorYear: number }> => {
        return await apiFetch<{ currentYear: number, priorYear: number }>(`/api/dashboard/${DashboardWidget.RecentDescents}`);
    };

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 4 }}>
            <StatCard title={t('dashboard.totalDescents')} getData={loadTotalDescents} icon={TerrainIcon} color="primary.main">
                {(data) => (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {data?.total}
                        </Typography>
                        {data?.regions > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {t('dashboard.acrossCountry', { count: data.regions })}
                            </Typography>
                        )}
                    </Box>
                )}
            </StatCard>
            <StatCard title={t('dashboard.uniqueCanyons')} getData={loadUniqueDescents} icon={ExploreIcon} color="info.main">
                {(data) => (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {data?.total}
                        </Typography>
                        {data?.thisYear > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {t('dashboard.newThisYear', { count: data.thisYear })}
                            </Typography>
                        )}
                    </Box>
                )}
            </StatCard>
            <StatCard title={t('dashboard.descentsThisYear')} getData={loadRecentDescents} icon={CalendarMonthIcon} color="success.main">
                {(data) => (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {data?.currentYear}
                        </Typography>
                        {data?.priorYear > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {t('dashboard.priorYear', { year: new Date().getFullYear() - 1, count: data.priorYear })}
                            </Typography>
                        )}
                    </Box>
                )}
            </StatCard>
        </Box>
    );
};

export default DashboardStats;
