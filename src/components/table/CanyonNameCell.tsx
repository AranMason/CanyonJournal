import { Link, TableCell } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

type CanyonNameTableCellProps = {
    name: string;
    detailUrl?: string | null;
}

const CanyonNameTableCell: React.FC<CanyonNameTableCellProps> = ({ name, detailUrl }) => {
    const navigate = useNavigate();

    return <TableCell>
        {detailUrl ? <Link component="a" color="textPrimary" onClick={() => navigate(detailUrl)} sx={{ cursor: 'pointer' }} >{name}</Link> : name}
    </TableCell>
}

export default CanyonNameTableCell;