import { Box, Typography } from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupIcon from "@mui/icons-material/Group";
import HikingIcon from "@mui/icons-material/Hiking";
import TerrainIcon from "@mui/icons-material/Terrain";
import React, { useMemo } from "react";
import { apiFetch } from "../../utils/api";
import StatCard from "../StatCard";

type PopularCanyon = {
    canyonName: string;
    tripCount: number;
};

type StatsData = {
    totalUsers: number;
    totalRecords: number;
    totalGoals: number;
    totalGoalsCompleted: number;
    activeUsersLast90Days: number;
    topCanyons: PopularCanyon[];
};

const AdminStatsTab: React.FC = () => {
    const loadPromise = useMemo(() => apiFetch<StatsData>("/api/admin/stats"), []);

    return <Box display={'flex'} gap={2} width={'100%'} justifyContent={'space-evenly'} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, mb: 4 }}>
        <StatCard
            title={"Total Users"}
            getData={() => loadPromise}
            icon={GroupIcon}
            color="primary.main"
        >
            {(data: StatsData) => (
                <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
                        {data?.totalUsers}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Active in last 3 months: {data?.activeUsersLast90Days ?? 0}
                    </Typography>
                </Box>
            )}
        </StatCard>
        <StatCard
            title={"Total Trips"}
            getData={() => loadPromise}
            icon={HikingIcon}
            color="primary.main"
        >
            {(data: StatsData) => (
                <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
                        {data?.totalRecords}
                    </Typography>
                </Box>
            )}
        </StatCard>
        <StatCard
            title={"Total Goals"}
            getData={() => loadPromise}
            icon={EmojiEventsIcon}
            color="primary.main"
        >
            {(data: StatsData) => (
                <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
                        {data?.totalGoals}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Completed: {data?.totalGoalsCompleted}
                    </Typography>
                </Box>
            )}
        </StatCard>
        <StatCard
            title={"Top 5 Popular Canyons"}
            getData={() => loadPromise}
            icon={TerrainIcon}
            color="primary.main"
        >
            {(data: StatsData) => (
                <Box sx={{ width: "100%" }}>
                    {(data?.topCanyons ?? []).length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
                            No trips logged yet
                        </Typography>
                    )}
                    {(data?.topCanyons ?? []).map((canyon, index) => (
                        <Box key={`${canyon.canyonName}-${index}`} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                            <Typography variant="body2" sx={{ pr: 1 }}>
                                {canyon.canyonName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {canyon.tripCount}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </StatCard>
    </Box>;

};

export default AdminStatsTab;