import { Box, CircularProgress } from '@mui/material';
import React from 'react'

type LoaderProps = {
    size?: "screen" | "container";
    isLoading: boolean;
    children: React.ReactNode;
}
const Loader: React.FC<LoaderProps> = ({size, isLoading, children}) => {

    
    if(!isLoading) {
        return children
    }

    const displaySize = size || "container"

    return <Box width={displaySize === "screen" ? "100vw" : "100%"} height={displaySize === "screen" ? "100vh" : "100%"} display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={80} />
    </Box>
}

export default Loader;