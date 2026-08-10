import React, { useMemo, useState } from 'react';
import {
  Box,
  Tab,
  Tabs
} from '@mui/material';
import GearTable from './GearTable';
import RopeTable from './RopeTable';
import { useSearchParams } from 'react-router-dom';
import GearSetTable from './GearSetTable';
import { useTranslation } from 'react-i18next';
import GestureIcon from '@mui/icons-material/Gesture';

const GearOverview: React.FC = () => {
  const { t } = useTranslation('translation');

  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(0);

  useMemo(() => {
    const tab = searchParams.get('tab')
    if (!tab) {
      return;
    }
    const paramTab = Number(tab)
    setActiveTab(paramTab)
  }, [searchParams])

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchParams(prev => {
      prev.set('tab', newValue.toString())
      return prev;
    });
  };

  return (
    <>
      <Tabs value={activeTab} onChange={handleTabChange} indicatorColor='secondary'>
        <Tab label={t('gear.tabs.gear')} />
        <Tab label={t('gear.tabs.gearSet')} />
        <Tab label={t('gear.tabs.rope')} />
      </Tabs>
      <Box sx={{ mb: 4 }}>
        {activeTab === 0 && <GearTable />}
        {activeTab === 1 && <GearSetTable />}
        {activeTab === 2 && <RopeTable />}
      </Box>
    </>
  );
};

export default GearOverview;


