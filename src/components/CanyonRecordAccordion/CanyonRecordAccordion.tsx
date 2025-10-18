import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Typography } from "@mui/material";
import React from "react";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WaterLevelRating from "../WaterLevelRating";
import { CanyonRecord, WaterLevel } from "../../types/CanyonRecord";
import GroupsIcon from '@mui/icons-material/Groups';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import CanyonRating from "../CanyonRating";
import CanyonTypeDisplay from "../CanyonTypeDisplay";
import { CanyonTypeEnum } from "../../types/CanyonTypeEnum";
import { Canyon } from "../../types/Canyon";


type CanyonRecordAccordionProps = {
    record: CanyonRecord;
    canyon?: Canyon;
    isOpen: boolean;
    onChange: () => void;
}

const CanyonRecordAccordion: React.FC<CanyonRecordAccordionProps> = ({ record, canyon, isOpen, onChange }) => {
    const navigate = useNavigate();


    return <Accordion expanded={isOpen} onChange={onChange}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
        >
            <Box width="100%" display="flex" flexDirection="row" mr={2} justifyContent="space-between">
                <Box >
                    <Typography component="h3">{record.Name}</Typography>
                    <Box sx={{ fontWeight: 400, color: 'grey.500', letterSpacing: 1 }}>
                        {new Date(record.Date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </Box>
                </Box>
                <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <Box display="flex" flexDirection="row" alignItems="center" gap={1} justifyContent="center" mb={0.5}>
                        <GroupsIcon sx={{ height: "1rem", width: "1rem" }} />
                        {record.TeamSize}
                    </Box>
                    <WaterLevelRating waterLevel={record.WaterLevel ?? WaterLevel.Unknown} />
                </Box>
            </Box>
        </AccordionSummary>
        <AccordionDetails>
            <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                {canyon && <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                    <CanyonTypeDisplay type={canyon?.CanyonType ?? CanyonTypeEnum.Unknown} />
                    <span>-</span>
                    <CanyonRating isUnrated={canyon?.IsUnrated} verticalRating={canyon?.VerticalRating} aquaticRating={canyon?.AquaticRating} commitmentRating={canyon?.CommitmentRating} starRating={canyon?.StarRating}/>
                </Box>}
                <Button variant="outlined" color="info" startIcon={<EditIcon />} size="small" onClick={() => navigate(`/journal/record/${record.Id}`)} sx={{ml: "auto"}}>Edit</Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" whiteSpace={"pre-line"} fontStyle={"italic"} pl={2}>
                {record.Comments}
            </Typography>
        </AccordionDetails>
    </Accordion>
}

export default CanyonRecordAccordion;