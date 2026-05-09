import React from 'react';
import { useUser } from '../App';
import { List, Box,  Divider } from '@mui/material';
import SidebarItem from './SidebarItem';
import HomeIcon from '@mui/icons-material/Home';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import SidebarDrawer from './SidebarDrawer';
import LoginIcon from '@mui/icons-material/Login';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import SettingsIcon from '@mui/icons-material/Settings';
import BugReportIcon from '@mui/icons-material/BugReport';

const Sidebar: React.FC<{ mobileOpen?: boolean; onMobileClose?: () => void }> = ({ mobileOpen, onMobileClose }) => {
  const { user, setUser, loading } = useUser();

  if (loading) return null;

  const handleBugReport = () => {
    const subject = encodeURIComponent('Bug Report – CanyonJournal');
    const body = encodeURIComponent(
      `Please describe the issue below:\n\n\n\n---\nPage: ${window.location.href}\nUser ID: ${user?.id ?? 'unknown'}`
    );
    window.open(`mailto:hello@canyonjournal.co.uk?subject=${subject}&body=${body}`);
  };

  return <SidebarDrawer mobileOpen={mobileOpen} onMobileClose={onMobileClose}>{(isOpen) => <><Box>
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
        label="Settings"
        icon={<SettingsIcon />}
        url='/settings'
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
        <SidebarItem
          isOpen={isOpen}
          label="Report a Bug"
          icon={<BugReportIcon />}
          onClick={handleBugReport}
        />
        {user  && <SidebarItem
          isOpen={isOpen}
          label="Logout"
          icon={<LogoutIcon />}
          onClick={() => {
            setUser(null);
            window.location.href = '/logout';
          }}
        />}
        {!user  && <SidebarItem
          isOpen={isOpen}
          label="Login"
          icon={<LoginIcon />}
          onClick={() => {
            window.location.href = '/login';
          }}
        />}
      </List>
    </Box>
  </>}

  </SidebarDrawer>


};

export default Sidebar;
