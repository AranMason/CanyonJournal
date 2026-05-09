import { SxProps, TableCell, Theme } from "@mui/material";
import React from "react";
import { CanyonTypeEnum } from "../../types/CanyonTypeEnum";
import CanyonTypeDisplay from "../CanyonTypeDisplay";

type CanyonTypeTableCellProps = {
    type: CanyonTypeEnum;
    className?: string;
    sx?: SxProps<Theme>;
}

const CanyonTypeTableCell: React.FC<CanyonTypeTableCellProps> = ({ type, className, sx }) => {

    return <TableCell align="center" width={150} className={className} sx={sx}>
        <CanyonTypeDisplay type={type}/>
        
    </TableCell>
}

export default CanyonTypeTableCell;