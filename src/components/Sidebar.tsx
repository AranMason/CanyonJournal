import React from 'react';
import { useUser } from '../App';
import LoginButton from '../components/LoginButton';
import { Drawer, List, Box, Toolbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import HomeIcon from '@mui/icons-material/Home';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RopeIcon from '@mui/icons-material/Build'; // Placeholder for rope/gear icon

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
          <SidebarItem
            label="Home"
            icon={<HomeIcon />}
            onClick={() => navigate('/')}
          />
          <SidebarItem
            label="Add Record"
            icon={<EditNoteIcon />}
            onClick={() => navigate('/record')}
            disabled={!user}
          />
          <SidebarItem
            label="Edit Gear"
            icon={<RopeIcon />}
            onClick={() => navigate('/gear')}
            disabled={!user}
          />
        </List>
      </Box>
      {user && (
        <Box sx={{ py: 2 }}>
          <List>
            <SidebarItem
              label="Logout"
              icon={null}
              onClick={async () => {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                setUser(null);
                navigate('/');
              }}
            />
          </List>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
