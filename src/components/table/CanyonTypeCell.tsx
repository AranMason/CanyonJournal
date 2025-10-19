import { TableCell } from "@mui/material";
import React from "react";
import { CanyonTypeEnum } from "../../types/CanyonTypeEnum";
import CanyonTypeDisplay from "../CanyonTypeDisplay";

type CanyonTypeTableCellProps = {
    type: CanyonTypeEnum;
    className?: string;
}

const CanyonTypeTableCell: React.FC<CanyonTypeTableCellProps> = ({ type, className }) => {

    return <TableCell align="center" width={150} className={className}>
        <CanyonTypeDisplay type={type}/>
        
    </TableCell>
}

export default CanyonTypeTableCell;