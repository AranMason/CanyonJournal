import React, { useEffect } from 'react';
import '../App.css';
import Sidebar from '../components/Sidebar';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../App';
interface PageTemplateProps {
    pageTitle: string;
    isAuthRequired?: boolean;
    children?: React.ReactNode;
    isLoading?: boolean;
}

function PageTemplate({ pageTitle, children, isAuthRequired, isLoading }: PageTemplateProps) {

    const { user, loading } = useUser();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthRequired || loading) return;

        if (!user && isAuthRequired) {
            window.location.href = '/';
        }
    }, [user, loading, navigate, isAuthRequired]);

    

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <h1 className="App-title">{pageTitle}</h1>
                <Box mb={1}>
                    <Alert severity='warning'>This application is currently a work in progress. Things can and will break.</Alert>
                </Box>
                
                {isLoading && <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>} 
                {!isLoading && children}
            </Box>
        </Box>
    );
}

export default PageTemplate;
