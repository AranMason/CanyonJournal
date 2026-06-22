import React from 'react';
import {
  Box,
  Tab,
  Tabs
} from '@mui/material';
import GearTable from './GearTable';
import RopeTable from './RopeTable';

const GearOverview: React.FC = () => {

  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <>
    <Tabs value={activeTab} onChange={handleTabChange} indicatorColor='secondary'>
      <Tab label="Gear" />
      <Tab label="Ropes" />
    </Tabs>
    {activeTab === 0 && <Box sx={{ mb: 4 }}><GearTable /></Box>}
    {activeTab === 1 && <Box sx={{ mb: 4 }}><RopeTable /></Box>}
    </>
  );
};

export default GearOverview;


