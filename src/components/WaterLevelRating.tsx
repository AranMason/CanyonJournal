import React from "react";
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { WaterLevel } from "../types/CanyonRecord";

type WaterLevelRatingProps = {
    waterLevel: WaterLevel
}

const WaterLevelRating: React.FC<WaterLevelRatingProps> = ({waterLevel}) => {

    return <div>
        {[1, 2, 3, 4, 5].map(i => <WaterDropIcon key={i} 
        className="CanyonSummaryBar-waterdrop" 
        sx={{height: "1rem", width: "1rem"}} 
        color={waterLevel >= i ? "info" : "disabled"}/>)}
    </div>
}

export default WaterLevelRating