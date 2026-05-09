import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Divider, IconButton, Typography } from "@mui/material";
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
import { UserCanyon } from "../../types/UserCanyon";
import LocationPinIcon from '@mui/icons-material/LocationPin';
import StarIcon from '@mui/icons-material/Star';
import { GetRegionDisplayName } from "../../helpers/EnumMapper";
import RegionType from "../../types/RegionEnum";
import IconDisplay from "../IconDisplay";

type CanyonInfo = Canyon | UserCanyon;

type CanyonRecordAccordionProps = {
    record: CanyonRecord;
    canyon?: CanyonInfo;
    isOpen: boolean;
    onChange: () => void;
}

const CanyonRecordAccordion: React.FC<CanyonRecordAccordionProps> = ({ record, canyon, isOpen, onChange }) => {
    const navigate = useNavigate();

    return <Accordion expanded={isOpen} onChange={onChange} slotProps={{ transition: { unmountOnExit: true } }}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
        >
            <Box width="100%" display="flex" flexDirection="row" mr={2} justifyContent={"space-between"}>
                <Box display="flex" flexDirection="row" alignItems={"center"} sx={{ maxWidth: { xs: '100%', sm: '60%' } }} flex="1" justifyContent={"space-between"} mr={2} >
                    <Box>
                        <Typography component="h3">{GetRegionDisplayName(canyon?.Region ?? record?.Region ?? RegionType.Unknown, true)} {record.Name} </Typography>
                        <Box sx={{ fontWeight: 400, color: 'grey.500', letterSpacing: 1 }}>
                            {new Date(record.Date).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </Box>
                    </Box>
                    
                </Box>
                <Box width={90} className="hide-sm" display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                        {record.TripRating
                          ? <IconDisplay icon={StarIcon} value={record.TripRating} count={5} activeColor="warning" />
                          : <Typography variant="body2" color="text.secondary">-</Typography>}
                    </Box>
                    {/* <Box width={80} className="hide-sm">
                        {GetRegionDisplayName(canyon?.Region ?? record?.Region ?? RegionType.Unknown)}
                    </Box> */}
                    <Box width={90} className="hide-sm" display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                        <WaterLevelRating waterLevel={record.WaterLevel ?? WaterLevel.Unknown} />
                    </Box>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', width: 180 }}>
                    <Box display="flex" flexDirection="row" alignItems="center" gap={1} justifyContent="center" mb={0.5}>
                        <GroupsIcon sx={{ height: "1rem", width: "1rem" }} />
                        {record.TeamSize}
                    </Box>
                    <CanyonTypeDisplay type={canyon?.CanyonType ?? CanyonTypeEnum.Unknown} />
                </Box>
            </Box>
        </AccordionSummary>
        <AccordionDetails>
            <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                {canyon ? <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
                    <CanyonRating isUnrated={canyon?.IsUnrated} verticalRating={canyon?.VerticalRating} aquaticRating={canyon?.AquaticRating} commitmentRating={canyon?.CommitmentRating} starRating={canyon?.StarRating}/>
                    
                </Box> : <span>No Data</span>}
                <Box sx={{ml: "auto"}}>
                    <IconButton
                        size="small"
                        disabled={!record.DetailUrl}
                        onClick={() => { if (record.DetailUrl) navigate(record.DetailUrl); }}
                        sx={{ p: { xs: 1.5, sm: 1 } }}
                    ><LocationPinIcon /></IconButton>
                    <IconButton size="small" onClick={() => navigate(`/journal/record/${record.Id}`)} sx={{ p: { xs: 1.5, sm: 1 } }}><EditIcon /></IconButton>
                </Box>
                
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" whiteSpace={"pre-line"} fontStyle={"italic"} pl={2}>
                {record.Comments ?? "-"}
            </Typography>
            {record.Tags && record.Tags.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={0.5} mt={1} pl={2}>
                    {record.Tags.map(tag => (
                        <Chip key={tag.Id} label={tag.Name} size="small" variant="outlined" />
                    ))}
                </Box>
            )}
        </AccordionDetails>
    </Accordion>
}

export default CanyonRecordAccordion;