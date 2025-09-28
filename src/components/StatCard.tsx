import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface StatCardProps {
  title: string;
  children: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, children }) => (
  <Box sx={{ flex: 1 }}>
    <Typography variant="subtitle1" sx={{ mb: 1 }}>{title}</Typography>
    <Paper elevation={3} sx={{ p: 3, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </Paper>
  </Box>
);

export default StatCard;
