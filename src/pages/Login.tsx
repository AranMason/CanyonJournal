import React from 'react';
import { Box, Card, CardContent, Typography, Divider, Button, Stack } from '@mui/material';
import '../App.css';

const Login: React.FC = () => {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
            <Card sx={{ minWidth: 340, maxWidth: 400, p: 2, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Log in with SSO
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box component="form" method="POST" action="/api/login" noValidate>
                        <Stack spacing={2}>
                            <Button
                                id="Google"
                                name="login_method"
                                value="GoogleOAuth"
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ backgroundColor: '#4285F4', '&:hover': { backgroundColor: '#357ae8' }, textTransform: 'none' }}
                                fullWidth
                            >
                                Google OAuth
                            </Button>
                            <Button
                                id="Microsoft"
                                name="login_method"
                                value="MicrosoftOAuth"
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ backgroundColor: '#2F2F7C', '&:hover': { backgroundColor: '#23235a' }, textTransform: 'none' }}
                                fullWidth
                            >
                                Microsoft OAuth
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
