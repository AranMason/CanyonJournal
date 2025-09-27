import React from 'react';
import { Button, Avatar, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { User } from '../types/types';

interface LoginButtonProps {
  className?: string;
  user?: User | null;
  loading?: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className, user, loading }) => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/login');
  };

  if (loading) return null;

  if (user) {
    return (
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar src={user.profile.raw_attributes.picture} alt={user.first_name} sx={{ width: 44, height: 44, bgcolor: '#eebbc3', color: '#232946', fontWeight: 700, fontSize: 24, mr: 1 }}>
          {!user.profile.raw_attributes.picture && user.first_name.charAt(0)}
        </Avatar>
        <Typography variant="subtitle1" color="white" fontWeight={500}>
          Welcome {user.first_name}
        </Typography>
      </Box>
    );
  }

  return (
    <Button
      variant="contained"
      color="primary"
      fullWidth
      onClick={handleLogin}
      sx={{
        mt: 1,
        mb: 2,
        borderRadius: 2,
        fontWeight: 500,
        fontSize: 16,
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;
