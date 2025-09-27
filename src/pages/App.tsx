
import type { User } from '../types';

import '../App.css';
import LoginButton from '../components/LoginButton';
import { useEffect, useState } from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Toolbar } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
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
          },
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <LoginButton className="Login-button Sidebar-login-btn" user={user} loading={loading} />
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/')}> 
              <ListItemIcon sx={{ color: '#fff' }}><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/record')}>
              <ListItemIcon sx={{ color: '#fff' }}><EditNoteIcon /></ListItemIcon>
              <ListItemText primary="Record" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <h1 className="App-title">Canyon Journal</h1>
      </Box>
    </Box>
  );
}

export default App;
