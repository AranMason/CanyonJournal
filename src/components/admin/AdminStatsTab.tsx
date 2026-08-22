import { Box, Typography } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import React, { useMemo } from "react";
import { apiFetch } from "../../utils/api";
import StatCard from "../StatCard";

type StatsData = {
    totalUsers: number;
    totalRecords: number;
    totalGoals: number;
    totalGoalsCompleted: number;
};

const AdminStatsTab: React.FC = () => {
    const loadPromise = useMemo(() => apiFetch<StatsData>("/api/admin/stats"), []);

    return <Box display={'flex'} gap={2} width={'100%'} justifyContent={'space-evenly'}>
        <StatCard
            title={"Total Users"}
            getData={() => loadPromise}
            icon={ExploreIcon}
            color="info.main"
        >
            {(data: StatsData) => (
                <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
                        {data?.totalUsers}
                    </Typography>
                </Box>
            )}
        </StatCard>
        <StatCard
            title={"Total Trips"}
            getData={() => loadPromise}
            icon={ExploreIcon}
            color="info.main"
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
            icon={ExploreIcon}
            color="info.main"
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
    </Box>;

};

export default AdminStatsTab;