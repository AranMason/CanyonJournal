import React from 'react';
import { Box, Typography } from '@mui/material';
import { useUser } from '../App';

interface LoginButtonProps {
  isOpen: boolean
}

const LoginButton: React.FC<LoginButtonProps> = ({ isOpen }) => {
  const { user, loading } = useUser();

  if (loading || !user || !isOpen) return null;


  return (
    <Box display="flex" alignItems="center" mb={2} ml={4}>
      {/* <Avatar src={user.picture_url} alt={user.first_name} sx={{ width: 44, height: 44, bgcolor: '#eebbc3', color: '#232946', fontWeight: 700, fontSize: 24, mr: 1 }}>
        {!user.picture_url && user.first_name.charAt(0)}
      </Avatar> */}
      <Typography variant="subtitle1" color="white" fontWeight={500} >
        Welcome {user.first_name}
      </Typography>
    </Box>
  );



};

export default LoginButton;
