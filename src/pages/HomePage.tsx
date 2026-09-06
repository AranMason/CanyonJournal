import React, { useEffect } from 'react';
import { useUser } from '../App';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { Box, Button } from '@mui/material';

const HomePage: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard'); // Redirect to Dashboard (home page)
    } else if (!loading && !user) {
      // If not logged in, redirect to login with Auth0
      window.location.href = '/login'
    }
  }, [user, loading, navigate]);

  return (
    <Loader isLoading={loading}>
      <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} minHeight={'150px'} gap={2}>
        <div>You will be redirected soon</div>
        <Button
          variant='contained'
          onClick={() => {
            window.location.href = '/login';
          }}>Login</Button>
      </Box>
    </Loader>
  );
};

export default HomePage;
