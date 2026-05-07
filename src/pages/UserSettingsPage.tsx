import React, { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import PageTemplate from './PageTemplate';
import SettingsCanyonsTab from '../components/settings/SettingsCanyonsTab';
import SettingsGearTab from '../components/settings/SettingsGearTab';

const UserSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <PageTemplate pageTitle="Settings" isAuthRequired>
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Your Canyons" />
        <Tab label="Your Gear" />
      </Tabs>
      {activeTab === 0 && <SettingsCanyonsTab />}
      {activeTab === 1 && <SettingsGearTab />}
    </PageTemplate>
  );
};

export default UserSettingsPage;
