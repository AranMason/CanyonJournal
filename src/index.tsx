import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/mui-overrides.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import reportWebVitals from './reportWebVitals';
import RecordPage from './pages/RecordPage';
import App from './App';
import GearPage from './pages/GearPage';
import CanyonPage from './pages/CanyonPage';
import HomePage from './pages/HomePage';
import EditRecordPage from './pages/EditRecordPage';
import AdminPage from './pages/AdminPage';
import CanyonOverviewPage from './pages/CanyonOverviewPage';
import RecordsOverviewPage from './pages/RecordsOverviewPage';
import MuiThemeProvider from './styles/MuiTheme';
import Sidebar from './components/Sidebar';
import { Box } from '@mui/material';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App>
      <MuiThemeProvider>
        <BrowserRouter>
          <Box display={'flex'}>
          <Sidebar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/journal/record/:id" element={<EditRecordPage />} />
            <Route path="/journal/record" element={<RecordPage />} />
            <Route path="/journal" element={<RecordsOverviewPage />} />
            <Route path="/gear" element={<GearPage />} />
            <Route path="/canyons/:id" element={<CanyonOverviewPage />} />
            <Route path="/canyons" element={<CanyonPage />} />
            <Route path="/admin" element={<AdminPage />} />
            {/* <Route path="*" element={<h2>404: Page Not Found</h2>} /> */}
          </Routes>
          </Box>
        </BrowserRouter>
      </MuiThemeProvider>
    </App>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
