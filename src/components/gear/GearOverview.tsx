import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Tab,
  Tabs
} from '@mui/material';
import GearTable from './GearTable';
import RopeTable from './RopeTable';
import { useParams, useSearchParams } from 'react-router-dom';
import GearSetTable from './GearSetTable';

const GearOverview: React.FC = () => {

  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(0);

  useMemo(() => {
    const tab = searchParams.get('tab')
    if (!tab) {
      return;
    }
    const paramTab = parseInt(tab)
    setActiveTab(paramTab)
  }, [])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchParams({ tab: newValue.toString() });
  };

  return (
    <>
      <Tabs value={activeTab} onChange={handleTabChange} indicatorColor='secondary'>
        <Tab label="Gear" />
        <Tab label="Gear Sets" />
        <Tab label="Ropes" />
      </Tabs>
      {activeTab === 0 && <Box sx={{ mb: 4 }}><GearTable /></Box>}
      {activeTab === 1 && <Box sx={{ mb: 4 }}><GearSetTable /></Box>}
      {activeTab === 2 && <Box sx={{ mb: 4 }}><RopeTable /></Box>}
    </>
  );
};

export default GearOverview;


