import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import PageTemplate from './PageTemplate';
import SettingsCanyonsTab from '../components/settings/SettingsCanyonsTab';
import SettingsTagsTab from '../components/settings/SettingsTagsTab';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const UserSettingsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    const tabIndex = parseInt(tabParam ?? '', 0);
    setActiveTab(isNaN(tabIndex) ? 0 : tabIndex);

    }, [searchParams]);
  

  return (
    <PageTemplate pageTitle={t('settings.title')} isAuthRequired>
      <Tabs value={activeTab} indicatorColor='secondary' onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>

        <Tab label={t('settings.canyons')} />
        <Tab label={t('settings.tags')} />
        
      </Tabs>
      <Box sx={{ mt: 4 }}>
        {activeTab === 0 && <SettingsCanyonsTab />}
      {activeTab === 1 && <SettingsTagsTab />}
      </Box>
      
    </PageTemplate>
  );
};

export default UserSettingsPage;

