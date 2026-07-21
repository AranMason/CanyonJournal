import React from "react";
import AppModal from "./AppModal";
import { Button, DialogContent, DialogContentText, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";


interface ChangeLogModalProps {
    open: boolean;
    onClose: () => void;
}

const changes: { date: Date, items: string[] }[] = [
    {
        date: new Date('2026-07-21'),
        items: ['Added Change Log', 'Improved navigation of Gear and Rope pages', 'Added breadcrumb navigation to Canyon, Goals, and Equipment sub-pages']
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
            {changes.map((item, idx) => {
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