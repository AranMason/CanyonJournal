import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Divider, Button, Alert } from '@mui/material';
import { useUser } from '../App';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard'); // Redirect to Dashboard (home page)
    }
  }, [user, loading, navigate]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#232946">
      <Card sx={{ minWidth: 340, maxWidth: 400, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Welcome to Canyon Journal
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Your home for documenting all your canyoning adventures across the UK.
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This is currently a work in progress. Please keep that in mind while using the app.
          </Alert>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              window.location.href = '/api/login';
            }}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
