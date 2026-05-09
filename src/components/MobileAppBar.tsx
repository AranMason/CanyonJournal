import React from 'react';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface MobileAppBarProps {
  onMenuClick: () => void;
}

const MobileAppBar: React.FC<MobileAppBarProps> = ({ onMenuClick }) => (
  <AppBar
    position="fixed"
    sx={{ display: { xs: 'flex', md: 'none' }, zIndex: (theme) => theme.zIndex.drawer + 1 }}
  >
    <Toolbar>
      <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2 }} aria-label="open menu">
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap component="div">
        CanyonJournal
      </Typography>
    </Toolbar>
  </AppBar>
);

export default MobileAppBar;
