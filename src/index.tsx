import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/breakpoints.css';
import './styles/mui-overrides.css';
import './i18n';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import reportWebVitals from './reportWebVitals';
import RecordPage from './pages/RecordPage';
import App from './App';
import CanyonPage from './pages/CanyonPage';
import HomePage from './pages/HomePage';
import EditRecordPage from './pages/EditRecordPage';
import AdminPage from './pages/AdminPage';
import CanyonOverviewPage from './pages/CanyonOverviewPage';
import UserCanyonOverviewPage from './pages/UserCanyonOverviewPage';
import UserSettingsPage from './pages/UserSettingsPage';
import RecordsOverviewPage from './pages/RecordsOverviewPage';
import GoalTripsPage from './pages/GoalTripsPage';
import MuiThemeProvider from './styles/MuiTheme';
import Sidebar from './components/Sidebar';
import MobileAppBar from './components/MobileAppBar';
import CookieBanner from './components/CookieBanner';
import { Box } from '@mui/material';
import GearSettingPage from './pages/GearSettingPage';
import GoalSettingPage from './pages/GoalSettingPage';
import GearHistoryPage from './pages/GearHistoryPage';

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <MobileAppBar onMenuClick={() => setMobileOpen(true)} />
      <Box display="flex">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <Box component="main" sx={{ flexGrow: 1, mt: { xs: '56px', sm: '64px', md: 0 } }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            {/* Journal */}
            <Route path="/journal/record/:id" element={<EditRecordPage />} />
            <Route path="/journal/record" element={<RecordPage />} />
            <Route path="/journal/goals/:goalId" element={<GoalTripsPage />} />
            <Route path="/journal" element={<RecordsOverviewPage />} />
            {/* Canyons */}
            <Route path="/canyons/users/:id" element={<UserCanyonOverviewPage />} />
            <Route path="/canyons/:id" element={<CanyonOverviewPage />} />
            <Route path="/canyons" element={<CanyonPage />} />
            {/* Settings */}
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="/settings/gear/:id" element={<GearHistoryPage />} />
            <Route path="/settings/gear" element={<GearSettingPage />} />
            <Route path="/settings/goals" element={<GoalSettingPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App>
      <MuiThemeProvider>
        <CookieBanner />
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </MuiThemeProvider>
    </App>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
