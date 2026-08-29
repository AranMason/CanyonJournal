import React, { useState } from "react";
import { useUser } from "../App";
import AppModal from "./AppModal";
import { Box, Button, DialogActions, DialogContent, List, ListItem, Typography } from "@mui/material";
import AddRecordIcon from '@mui/icons-material/Create';
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import BuildIcon from '@mui/icons-material/Build';
import ChecklistIcon from '@mui/icons-material/Checklist';

const NewUserModal: React.FC = () => {
    const { user, setUser } = useUser();
    const { t } = useTranslation('translation');
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(user?.isNewUser ?? false);

    const closeModal = () => {
        const isNewUser: boolean = false;
        user && setUser({ ...user, isNewUser })
        setIsOpen(false);
    }

    const renderListItem = (icon: React.ReactElement, titleKey: string, descriptionKey: string, ctaKey: string, ctaLocation: string) => {
        return <ListItem sx={{ display: 'flex', mb: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Typography component={'h3'} variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{icon}{t(titleKey)}</Typography>
                <Typography color="textPrimary" component={'p'} variant="body1">{t(descriptionKey)}</Typography>
                <Button
                    sx={{ maxWidth: 200, mt: 1 }}
                    fullWidth
                    variant='contained'
                    startIcon={icon}
                    onClick={() => {
                        closeModal();
                        navigate(ctaLocation)
                    }
                    }>
                    {t(ctaKey)}
                </Button>
            </Box>
        </ListItem >
    }

    return <AppModal title={t('welcome.title')} open={isOpen} onClose={closeModal}>
        <DialogContent>
            <Typography variant="body1" component={'p'} mb={2}>
                {t('welcome.blurb')}
            </Typography>
            <List>
                {renderListItem(
                    <AddRecordIcon />,
                    'welcome.recordTrip.title',
                    'welcome.recordTrip.description',
                    'welcome.recordTrip.cta',
                    '/journal/record')}
                {renderListItem(
                    <BuildIcon />,
                    'welcome.addGear.title',
                    'welcome.addGear.description',
                    'welcome.addGear.cta',
                    '/settings/gear')}
                {renderListItem(
                    <ChecklistIcon />,
                    'welcome.addGoal.title',
                    'welcome.addGoal.description',
                    'welcome.addGoal.cta',
                    '/settings/goals')}

            </List>
        </DialogContent>
        <DialogActions>
            <Button variant="outlined" onClick={closeModal}>{t('common:actions.close')}</Button>
        </DialogActions>
    </AppModal >
}

export default NewUserModal;