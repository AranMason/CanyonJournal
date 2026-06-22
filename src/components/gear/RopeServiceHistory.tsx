import { useState, useEffect } from "react";
import { loadRopeHistory } from "../../helpers/EquipmentDataStore";
import { RopeServiceHistoryItem } from "../../types/types";
import { Table, TableContainer, Paper, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { t } from "i18next";
import Loader from "../Loader";


const RopeServiceHistory: React.FC<{ ropeId: number }> = ({ ropeId }) => {
    const [isLoading, setIsLoading] = useState(true);

    const [serviceHistory, setServiceHistory] = useState<RopeServiceHistoryItem[]>([]);

    useEffect(() => {
        if (!ropeId) {
            setIsLoading(false);
            setServiceHistory([]);
            return;
        }

        setIsLoading(true);
        loadRopeHistory(ropeId).then(data => {
            setServiceHistory(data);
        }).catch(err => {
            console.error("Error loading gear history:", err);
            setServiceHistory([]);
        }).finally(() => {
            setIsLoading(false);
        })
    }, [ropeId]);


    return <Loader isLoading={isLoading}>
            <TableContainer component={Paper}>
                <Table size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('gear.itemPage.serviceType')}</TableCell>
                            <TableCell>{t('gear.itemPage.serviceDate')}</TableCell>
                            <TableCell>{t('gear.itemPage.notes')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {serviceHistory.length > 0 ? serviceHistory.map((item) => (
                            <TableRow key={item.Id}>
                                <TableCell>{t('gear.serviceType', { context: item.ServiceType })}</TableCell>
                                <TableCell>{new Date(item.ServiceDate).toLocaleDateString()}</TableCell>
                                <TableCell>{item.Notes}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    {t('gear.itemPage.noHistory', 'No history')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Loader>

};

export default RopeServiceHistory;