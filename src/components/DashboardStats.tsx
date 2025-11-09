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
    
      const loadRecentDescents = async (): Promise<{ currentYear: number, priorYear: number}> => {
        return await apiFetch<{ currentYear: number, priorYear: number}>(`/api/dashboard/${DashboardWidget.RecentDescents}`);
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
        <StatCard title="Total Canyons this year" getData={loadRecentDescents}>
          {(data) => <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center' }} display="flex" flexDirection={"column"}>
            {data?.currentYear} {data?.priorYear > 0 && <Typography variant="subtitle1" color="textSecondary"> (Last year: {data.priorYear})</Typography>}
          </Typography>}
        </StatCard>
      </Box>;
} 

export default DashboardStats;