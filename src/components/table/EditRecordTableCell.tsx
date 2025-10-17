import { TableCell } from "@mui/material";
import React from "react";
import RowActions from "../RowActions";
import { useNavigate } from "react-router-dom";

type EditRecordTableCellProps = {
    recordId: number | null | undefined
}

const EditRecordTableCell: React.FC<EditRecordTableCellProps> = ({ recordId }) => {
    const navigate = useNavigate();

    return <TableCell sx={{ position: 'sticky', right: 0, background: '#fff', zIndex: 1, width: 80 }}>
        {recordId && <RowActions
            onEdit={() => navigate(`/journal/record/${recordId} `)}
        />}
    </TableCell>
}

export default EditRecordTableCell;