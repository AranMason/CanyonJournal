import { Box, TableCell } from "@mui/material";
import GroupsIcon from '@mui/icons-material/Groups';
import React from "react";

type TeamSizeTableCellProps = {
    teamSize: number | null | undefined
}
const TeamSizeTableCell: React.FC<TeamSizeTableCellProps> = ({teamSize}) => {

    return <TableCell width={80}>
        <Box display="flex" flexDirection="row" alignItems={"center"} gap={1} justifyContent={"center"}>
            <GroupsIcon sx={{ height: "1rem", width: "1rem" }} />
            {teamSize ?? "-"}
        </Box>
    </TableCell>
}

export default TeamSizeTableCell;