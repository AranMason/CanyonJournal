import React from 'react';
import { useUser } from '../App';
import { List, Box,  Divider } from '@mui/material';
import SidebarItem from './SidebarItem';
import HomeIcon from '@mui/icons-material/Home';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RopeIcon from '@mui/icons-material/Build';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import SidebarDrawer from './SidebarDrawer';
import LoginIcon from '@mui/icons-material/Login';
import LocationPinIcon from '@mui/icons-material/LocationPin';

const Sidebar: React.FC = () => {
  const { user, setUser } = useUser();

  return <SidebarDrawer>{(isOpen) => <><Box>
    <List>
      <SidebarItem
        isOpen={isOpen}
        label="Home"
        icon={<HomeIcon />}
        url='/dashboard'
        disabled={!user}
      />
      <SidebarItem
        isOpen={isOpen}
        label="Your Journal"
        icon={<MenuBookIcon />}
        url='/journal'
        disabled={!user}
      />
      <SidebarItem
        isOpen={isOpen}
        label="Record Descent"
        icon={<EditNoteIcon />}
        url='/journal/record'
        disabled={!user}
      />
      <Divider sx={{ my: 2, borderColor: "white", opacity: 0.15 }}></Divider>
      <SidebarItem
        isOpen={isOpen}
        label="Canyons"
        icon={<LocationPinIcon />}
        url='/canyons'
        disabled={!user}
      />
      <SidebarItem
        isOpen={isOpen}
        label="Your Gear"
        icon={<RopeIcon />}
        url='/gear'
        disabled={!user}
      />
      {user && user.isAdmin && <><Divider sx={{ my: 2, borderColor: "white", opacity: 0.15 }}></Divider><SidebarItem
      isOpen={isOpen}
        label="Admin"
        icon={<AdminPanelSettingsIcon />}
        url='/admin'
      /></>}
    </List>
  </Box>    
    <Box sx={{ py: 2, marginTop: "auto" }}>
      <List>
        {user  && <SidebarItem
          isOpen={isOpen}
          label="Logout"
          icon={<LogoutIcon />}
          onClick={() => {
            setUser(null);
            window.location.href = '/api/logout';
          }}
        />}
        {!user  && <SidebarItem
          isOpen={isOpen}
          label="Login"
          icon={<LoginIcon />}
          onClick={() => {
            window.location.href = '/api/login';
          }}
        />}
      </List>
    </Box>
  </>}

  </SidebarDrawer>


};

export default Sidebar;
