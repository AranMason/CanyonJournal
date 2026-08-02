import { Box, Link, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { IBaseCanyon } from "../../types/Canyon";
import RegionIcon from "../RegionIcon";

type CanyonNameTableCellProps = {
    canyon: IBaseCanyon;
    detailUrl?: string | null;
    subtitle?: React.ReactNode;
}

const CanyonNameTableCell: React.FC<CanyonNameTableCellProps> = ({ canyon, detailUrl, subtitle }) => {
    const navigate = useNavigate();

    return <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box display={'flex'} gap={1} flexDirection={'row'} alignItems={'baseline'}>
            {canyon.RegionId && <RegionIcon regionSlug={canyon.RegionSlug ?? ''} regionSymbol={canyon.RegionSymbol} size={16} />}
            {detailUrl ? <Link component="a" color="textPrimary" onClick={() => navigate(detailUrl)} sx={{ cursor: 'pointer' }} >{canyon.Name}</Link> : canyon.Name}

        </Box>
        {subtitle && <Typography variant='caption' color='textSecondary'>
            {subtitle}
        </Typography>}
    </Box>
}

export default CanyonNameTableCell;