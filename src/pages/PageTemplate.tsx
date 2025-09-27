import React from 'react';
import { useUser } from '../App';

import '../App.css';
import Sidebar from '../components/Sidebar';
import { Box, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface PageTemplateProps {
  pageTitle: string;
  children?: React.ReactNode;
}

function PageTemplate({ pageTitle, children }: PageTemplateProps) {
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <h1 className="App-title">{pageTitle}</h1>
        {children}
      </Box>
    </Box>
  );
}

export default PageTemplate;
