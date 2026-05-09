import React from "react";
import { apiFetch } from "../utils/api";
import { DashboardWidget } from "../types/Widgets";
import StatCard from "./StatCard";
import { Box, Typography } from "@mui/material";
import TerrainIcon from "@mui/icons-material/Terrain";
import ExploreIcon from "@mui/icons-material/Explore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const DashboardStats: React.FC = () => {

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
            <StatCard title="Total Descents" getData={loadTotalDescents} icon={TerrainIcon} color="primary.main">
                {(data) => (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {data?.total}
                        </Typography>
                        {data?.regions > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                Across {data.regions} {data.regions === 1 ? 'country' : 'countries'}
                            </Typography>
                        )}
                    </Box>
                )}
            </StatCard>
            <StatCard title="Unique Canyons" getData={loadUniqueDescents} icon={ExploreIcon} color="info.main">
                {(data) => (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {data?.total}
                        </Typography>
                        {data?.thisYear > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                +{data.thisYear} this year
                            </Typography>
                        )}
                    </Box>
                )}
            </StatCard>
            <StatCard title="Descents This Year" getData={loadRecentDescents} icon={CalendarMonthIcon} color="success.main">
                {(data) => (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            {data?.currentYear}
                        </Typography>
                        {data?.priorYear > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {new Date().getFullYear() - 1}: {data.priorYear}
                            </Typography>
                        )}
                    </Box>
                )}
            </StatCard>
        </Box>
    );
};

export default DashboardStats;
