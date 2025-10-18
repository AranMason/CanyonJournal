import { Box } from "@mui/material";
import React from "react";
import { CanyonTypeEnum } from "../types/CanyonTypeEnum";
import { GetCanyonTypeDisplayName } from "../heleprs/EnumMapper";
import HikingIcon from '@mui/icons-material/Hiking';
import GestureIcon from '@mui/icons-material/Gesture';
import TerrainIcon from '@mui/icons-material/Terrain';

type CanyonTypeDisplayProps = {
    type: CanyonTypeEnum;
}

const IconByType: {[key in CanyonTypeEnum]: React.ReactNode} = {
    [CanyonTypeEnum.Unknown]: null,
    [CanyonTypeEnum.Sports]: <GestureIcon color="error" />,
    [CanyonTypeEnum.Adventure]: <TerrainIcon/>,
    [CanyonTypeEnum.GorgeWalk]: <HikingIcon color="success"/>
}

const CanyonTypeDisplay: React.FC<CanyonTypeDisplayProps> = ({ type }) => {

    return <Box display="flex" flexDirection="row" gap={0.5} alignItems="center">
            {IconByType[type]}
            {GetCanyonTypeDisplayName(type)}
        </Box>

}

export default CanyonTypeDisplay;