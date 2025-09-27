import React from 'react';
import { useUser } from '../App';
import LoginButton from '../components/LoginButton';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Toolbar } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const { user, setUser, loading } = useUser();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: 240,
          boxSizing: 'border-box',
          background: '#232946',
          color: '#fff',
          borderRight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Box>
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <LoginButton
            className="Login-button Sidebar-login-btn"
            user={user}
            loading={loading}
          />
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate('/')}
              className="sidebar-hover"
            >
              <ListItemIcon sx={{ color: '#fff' }}><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => navigate('/record')}
              disabled={!user}
              className="sidebar-hover"
            >
              <ListItemIcon sx={{ color: '#fff' }}><EditNoteIcon /></ListItemIcon>
              <ListItemText primary="Record" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      {user && (
        <Box sx={{ py: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={async () => {
                  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                  setUser(null);
                  navigate('/');
                }}
                className="sidebar-hover"
              >
                <ListItemText primary="Logout" sx={{ textAlign: 'center', color: '#fff' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
