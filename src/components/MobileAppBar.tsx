import React from 'react';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface MobileAppBarProps {
  onMenuClick: () => void;
}

const MobileAppBar: React.FC<MobileAppBarProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  return (
    <AppBar
      position="fixed"
      sx={{ display: { xs: 'flex', md: 'none' }, zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2 }} aria-label="open menu">
          <MenuIcon />
        </IconButton>

        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src="/favicon.svg" alt={t('common:app.name')} style={{ width: 28, height: 28, marginRight: 8 }} />
          <Typography variant="h6" noWrap component="div">
            {t('common:app.name')}
          </Typography>
        </Link>
        
      </Toolbar>
    </AppBar>
  );
};

export default MobileAppBar;
