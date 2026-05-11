import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import PageTemplate from './PageTemplate';
import EditCanyons from '../components/admin/EditCanyons';
import SourcesTab from '../components/admin/SourcesTab';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <PageTemplate pageTitle="Admin Panel" isAuthRequired>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Canyons" />
          <Tab label="Sources" />
        </Tabs>
      </Box>
      {tab === 0 && <EditCanyons />}
      {tab === 1 && <SourcesTab />}
    </PageTemplate>
  );
};

export default AdminPage;
