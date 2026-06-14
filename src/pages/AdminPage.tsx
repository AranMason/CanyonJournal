import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import PageTemplate from './PageTemplate';
import EditCanyons from '../components/admin/EditCanyons';
import SourcesTab from '../components/admin/SourcesTab';
import ReportsTab from '../components/admin/ReportsTab';
import RegionsTab from '../components/admin/RegionsTab';
import { useTranslation } from 'react-i18next';

const AdminPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const { t } = useTranslation();

  return (
    <PageTemplate pageTitle={t('admin.title')} isAuthRequired>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} indicatorColor='secondary' onChange={(_, v) => setTab(v)}>
          <Tab label={t('admin.canyons')} />
          <Tab label={t('admin.sources')} />
          <Tab label={t('admin.reports')} />
          <Tab label="Regions" />
        </Tabs>
      </Box>
      {tab === 0 && <EditCanyons />}
      {tab === 1 && <SourcesTab />}
      {tab === 2 && <ReportsTab />}
      {tab === 3 && <RegionsTab />}
    </PageTemplate>
  );
};

export default AdminPage;


