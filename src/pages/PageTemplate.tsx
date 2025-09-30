import React, { useEffect } from 'react';
import '../App.css';
import Sidebar from '../components/Sidebar';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../App';
interface PageTemplateProps {
    pageTitle: string;
    isAuthRequired?: boolean;
    children?: React.ReactNode;
}

function PageTemplate({ pageTitle, children, isAuthRequired }: PageTemplateProps) {

    const { user, loading } = useUser();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthRequired || loading) return;

        if (!user && isAuthRequired) {
            window.location.href = '/login';
        }
    }, [user, loading, navigate, isAuthRequired]);

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <h1 className="App-title">{pageTitle}</h1>
                {children}
            </Box>
        </Box>
    );
}

export default PageTemplate;
