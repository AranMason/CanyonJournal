import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import PageTemplate from './PageTemplate';
import SettingsCanyonsTab from '../components/settings/SettingsCanyonsTab';
import SettingsGearTab from '../components/settings/SettingsGearTab';
import SettingsTagsTab from '../components/settings/SettingsTagsTab';
import { useTranslation } from 'react-i18next';

const UserSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  return (
    <PageTemplate pageTitle={t('settings.title')} isAuthRequired>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label={t('settings.canyons')} />
        <Tab label={t('settings.gear')} />
        <Tab label={t('settings.tags')} />
      </Tabs>
      {activeTab === 0 && <SettingsCanyonsTab />}
      {activeTab === 1 && <SettingsGearTab />}
      {activeTab === 2 && <SettingsTagsTab />}
    </PageTemplate>
  );
};

export default UserSettingsPage;

