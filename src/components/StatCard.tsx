import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  getData: () => any;
  icon?: SvgIconComponent;
  color?: string;
  children?: (data?: any) => React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, getData, icon: Icon, color = 'primary.main', children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  function refresh() {
    setIsLoading(true);
    getData().then(setData).finally(() => setIsLoading(false));
  }

  useEffect(() => {
    if (isLoading || data) return;
    refresh();
  }, [getData]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Paper elevation={3} sx={{ p: 3, minHeight: 160, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        {Icon && (
          <Box sx={{
            bgcolor: color,
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.85,
            flexShrink: 0,
          }}>
            <Icon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLoading ? <CircularProgress /> : (children && children(data))}
      </Box>
    </Paper>
  );
};

export default StatCard;

