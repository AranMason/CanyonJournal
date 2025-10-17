import { Box, TableCell, useMediaQuery, useTheme } from "@mui/material";
import React from "react";

type DateTableCellProps = {
    date: string | null | undefined
}

const DateTableCell: React.FC<DateTableCellProps> = ({ date }) => {
    const theme = useTheme();
    const isLargeScreen: boolean = useMediaQuery(() => theme.breakpoints.up("md"));

    return <TableCell width={120}>
        {date ? (
            <Box sx={{ fontWeight: 400, color: 'primary.main', letterSpacing: 1 }}>
                {new Date(date).toLocaleDateString(undefined, {  dateStyle: isLargeScreen? "medium" : "short" })}
            </Box>
        ) : '-'}
    </TableCell>
}

export default DateTableCell;