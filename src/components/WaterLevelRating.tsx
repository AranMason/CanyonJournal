import React from "react";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { WaterLevel } from "../types/CanyonRecord";
import IconDisplay from "./IconDisplay";

type WaterLevelRatingProps = {
    waterLevel: WaterLevel
}

const WaterLevelRating: React.FC<WaterLevelRatingProps> = ({ waterLevel }) => {
    if (waterLevel === WaterLevel.Unknown) return "-";
    return <IconDisplay icon={WaterDropIcon} value={waterLevel} count={5} activeColor="info" />;
}

export default WaterLevelRating