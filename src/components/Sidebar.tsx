import React from 'react';
import { useUser } from '../App';
import LoginButton from '../components/LoginButton';
import { Drawer, List, Box, Toolbar, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SidebarItem from './SidebarItem';
import HomeIcon from '@mui/icons-material/Home';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RopeIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';

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
            url='/dashboard'
          />
          <SidebarItem
            label="Your Journal"
            icon={<MenuBookIcon />}
            url='/journal'
            disabled={!user}
          />
          <SidebarItem
            label="Add Entry"
            icon={<EditNoteIcon />}
            url='/journal/record'
            disabled={!user}
          />
          <Divider sx={{ my: 2, borderColor: "white", opacity: 0.15 }}></Divider>
          <SidebarItem
            label="Canyons"
            icon={<AddLocationAltIcon />}
            url='/canyons'
            disabled={!user}
          />
          <SidebarItem
            label="Your Gear"
            icon={<RopeIcon />}
            url='/gear'
            disabled={!user}
          />
          {user && user.isAdmin && <><Divider sx={{ my: 2, borderColor: "white", opacity: 0.15 }}></Divider><SidebarItem
            label="Admin"
            icon={<AdminPanelSettingsIcon />}
            url='/admin'
          /></>}
        </List>
      </Box>
      {user && (
        <Box sx={{ py: 2 }}>
          <List>
            <SidebarItem
              label="Logout"
              icon={<LogoutIcon/>}
              onClick={() => {
                window.location.href = '/api/logout';
                setUser(null);
              }}
            />
          </List>
        </Box>
      )}
    </Drawer>
  );
};

export default Sidebar;
