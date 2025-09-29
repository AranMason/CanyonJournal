import React from 'react';
import { Box, Card, CardContent, Typography, Divider, Button } from '@mui/material';

const Login: React.FC = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Card sx={{ minWidth: 340, maxWidth: 400, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Log in with Auth0
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Log in with Auth0 SSO
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
