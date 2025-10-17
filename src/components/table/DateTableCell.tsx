import { Box, TableCell } from "@mui/material";
import React from "react";

type DateTableCellProps = {
    date: string | null | undefined
}

const DateTableCell: React.FC<DateTableCellProps> = ({ date }) => {

    return <TableCell width={120}>
        {date ? (
            <Box sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 1 }}>
                {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </Box>
        ) : '-'}
    </TableCell>
}

export default DateTableCell;