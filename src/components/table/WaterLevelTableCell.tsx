import { TableCell } from "@mui/material";
import React from "react";
import WaterLevelRating from "../WaterLevelRating";
import { WaterLevel } from "../../types/CanyonRecord";

type TableCellProps = {
    waterLevelRating: WaterLevel | null | undefined
}

const WaterLevelTableCell: React.FC<TableCellProps> = ({ waterLevelRating }) => {
    return <TableCell width={80}>
        <WaterLevelRating waterLevel={waterLevelRating ?? WaterLevel.Unknown} />
    </TableCell>
}

export default WaterLevelTableCell