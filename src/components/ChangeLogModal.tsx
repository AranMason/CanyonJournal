import React from "react";
import AppModal from "./AppModal";
import { Button, DialogContent, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";


interface ChangeLogModalProps {
    open: boolean;
    onClose: () => void;
}

const changes: { date: Date, items: string[] }[] = [
    {
        date: new Date('2026-07-21'),
        items: ['Added Change Log', 'Improved navigation of Gear and Rope pages', 'Added breadcrumb navigation to Canyon, Goals, and Equipment sub-pages']
    },
    {
        date: new Date('2026-07-31'),
        items: [
            'Added Gear Sets Tab to the Equipment Page - Enabling you to group related gear together',
            'Added Gear Sets to Record Page - You can now chose gear sets when creating or editing a trip record',
            'Fixed bug with Canyoning Goals that involve tagged trips'
        ]
    },
    {
        date: new Date('2026-08-10'),
        items: [
            'Added total weight column to Gear Sets',
            'Hiding list of Gear Items in sets on Mobile'
        ]
    },
    {
        date: new Date('2026-08-17'),
        items: [
            'Changed how gear is selected on the Journal Entry pages'
        ]
    }
];

const ChangeLogModal: React.FC<ChangeLogModalProps> = ({ open, onClose }) => {

    const { t } = useTranslation('common');

    return <AppModal
        open={open}
        onClose={onClose}
        title={"Change Log"}
        maxWidth="md"
        actions={<Button onClick={onClose} variant="contained">{t('actions.close')}</Button>}
    >
        <DialogContent>
            {changes.sort((a, b) => b.date.getTime() - a.date.getTime()).map((item, idx) => {
                return <><Typography key={idx}>
                    {item.date.toLocaleDateString()}
                </Typography>
                    <ul>
                        {item.items.map((i, j) => {
                            return <li key={j}>{i}</li>
                        })}
                    </ul>
                </>

            })}
            {/* <DialogContentText>Hello World</DialogContentText> */}
        </DialogContent>
    </AppModal >
}

export default ChangeLogModal