import { TableCell } from "@mui/material";
import React from "react";
import { CanyonTypeEnum } from "../../types/CanyonTypeEnum";
import CanyonTypeDisplay from "../CanyonTypeDisplay";

type CanyonTypeTableCellProps = {
    type: CanyonTypeEnum;
}

const CanyonTypeTableCell: React.FC<CanyonTypeTableCellProps> = ({ type }) => {

    return <TableCell align="center" width={150}>
        <CanyonTypeDisplay type={type}/>
        
    </TableCell>
}

export default CanyonTypeTableCell;