import { Link, TableCell } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

type CanyonNameTableCellProps = {
    name: string;
    canyonId: number | null | undefined
}

const CanyonNameTableCell: React.FC<CanyonNameTableCellProps> = ({ name, canyonId }) => {
    const navigate = useNavigate();

    return <TableCell>
        {canyonId ? <Link component="a" onClick={() => navigate(`/canyons/${canyonId}`)} sx={{ cursor: 'pointer' }}>{name}</Link> : name}
    </TableCell>
}

export default CanyonNameTableCell;