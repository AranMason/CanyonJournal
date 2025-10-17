import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

interface StatCardProps {
  title: string;
  getData: () => any,
  children?: (data?: any) => React.ReactNode
}

const StatCard: React.FC<StatCardProps> = ({ title, getData, children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);

  function refresh() {
setIsLoading(true);
    getData().then(setData).finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if(isLoading) return;
    refresh();
  }, [getData]) // eslint-disable-line react-hooks/exhaustive-deps


  return <Box sx={{ flex: 1 }}>
    
      <Typography variant="subtitle1" sx={{ mb: 1 }} textOverflow="ellipsis" display={'block'} whiteSpace="nowrap" flexGrow={0} flexShrink={0}>{title}</Typography>
      <Paper elevation={3} sx={{ p: 3, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isLoading ? <CircularProgress /> : (children && children(data))}
      </Paper>

  </Box>
};

export default StatCard;
