import { Accordion, AccordionSummary, Box, AccordionDetails } from "@mui/material";
import React from "react";
import { Canyon } from "../types/Canyon";
import { UserCanyon } from "../types/UserCanyon";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


type CanyonInfo = Canyon | UserCanyon;

type CanyonRecordAccordionProps = {
    isOpen: boolean;
    onChange: () => void;
    children?: React.ReactNode;
}

export const RecordAccordionTitle: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>
export const RecordAccordionContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>
export const RecordAccordionActions: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>

const RecordAccordion: React.FC<CanyonRecordAccordionProps> = ({ isOpen, onChange, children }) => {

    const title = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === RecordAccordionTitle) as React.ReactElement | undefined;
    const content = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === RecordAccordionContent) as React.ReactElement | undefined;
    const actions = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === RecordAccordionActions) as React.ReactElement | undefined;

    return <Accordion expanded={isOpen} onChange={onChange} slotProps={{ transition: { unmountOnExit: true } }}>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
        >
            <Box width="100%" display="flex" flexDirection="row" mr={2} justifyContent={"space-between"}>
                <Box display="flex" flexDirection="row" alignItems={"center"} sx={{ maxWidth: { xs: '100%', sm: '60%' } }} flex="1" justifyContent={"space-between"} mr={2} >
                    {title}
                </Box>
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'flex-end', width: 180 }}>
                    {actions}
                </Box>
            </Box>
        </AccordionSummary>
        <AccordionDetails>
            {content}
        </AccordionDetails>
    </Accordion>
}

export default RecordAccordion;