import React from "react";
import { apiFetch } from "../utils/api";
import { DashboardWidget } from "../types/Widgets";
import StatCard from "./StatCard";
import { Box, Typography } from "@mui/material";

const DashboardStats: React.FC = () => {

    const loadTotalDescents = async (): Promise<number> => {
        return await apiFetch<number>(`/api/dashboard/${DashboardWidget.TotalDescents}`);
      }
    
      const loadUniqueDescents = async (): Promise<number> => {
        return await apiFetch<number>(`/api/dashboard/${DashboardWidget.UniqueDescents}`);
      }
    
      const loadRecentDescents = async (): Promise<number> => {
        return await apiFetch<number>(`/api/dashboard/${DashboardWidget.RecentDescents}`);
      }

    return <Box sx={{ display: "flex", gap: 2, mb: 4 }} className="hide-md">
        <StatCard title="Total Descents" getData={loadTotalDescents}>
          {(data) => <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {data}
          </Typography>}
        </StatCard>
        <StatCard title="Unique Canyons Descended" getData={loadUniqueDescents}>
          {(data) => <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {data}
          </Typography>}
        </StatCard>
        <StatCard title="Last 6 Months" getData={loadRecentDescents}>
          {(data) => <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {data}
          </Typography>}
        </StatCard>
      </Box>;
} 

export default DashboardStats;