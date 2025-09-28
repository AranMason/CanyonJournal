import React from 'react';
import '../App.css';
import Sidebar from '../components/Sidebar';
import { Box } from '@mui/material';

interface PageTemplateProps {
  pageTitle: string;
  children?: React.ReactNode;
}

function PageTemplate({ pageTitle, children }: PageTemplateProps) {

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <h1 className="App-title">{pageTitle}</h1>
        {children}
      </Box>
    </Box>
  );
}

export default PageTemplate;
