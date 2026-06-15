import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import PageTemplate from './PageTemplate';
import SettingsCanyonsTab from '../components/settings/SettingsCanyonsTab';
import SettingsGearTab from '../components/settings/SettingsGearTab';
import SettingsTagsTab from '../components/settings/SettingsTagsTab';
import SettingsGoalsTab from '../components/settings/SettingsGoalsTab';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const UserSettingsPage: React.FC = () => {
  const [searchParams, _] = useSearchParams();
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
        <Tab label={t('settings.goals')} />
        <Tab label={t('settings.canyons')} />
        <Tab label={t('settings.gear')} />
        <Tab label={t('settings.tags')} />
        
      </Tabs>
      {activeTab === 0 && <SettingsGoalsTab />}
      {activeTab === 1 && <SettingsCanyonsTab />}
      {activeTab === 2 && <SettingsGearTab />}
      {activeTab === 3 && <SettingsTagsTab />}
    </PageTemplate>
  );
};

export default UserSettingsPage;

