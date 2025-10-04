import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { Canyon } from '../../types/Canyon';
import { Table, TableContainer, Paper, TableHead, TableRow, TableCell, TableBody, Link } from '@mui/material';
import CanyonRating from '../CanyonRating';
import AddCanyonModal from '../AddCanyonModal';
import RowActions from '../RowActions';

const EditCanyons: React.FC = () => {

    const [editCanyon, setEditCanyon] = useState<Canyon | null>(null);
    const [canyons, setCanyons] = useState<Canyon[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refresh = () => {
        setIsLoading(true);
        apiFetch<Canyon[]>('/api/canyons/verify')
            .then(setCanyons)
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        if (!isLoading) {
            refresh();
        }
    }, []);

    return <>
    <AddCanyonModal canyon={editCanyon} open={editCanyon != null} onClose={() => {setEditCanyon(null)}} onSuccess={refresh} />
    <TableContainer component={Paper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Edit</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {canyons.map(canyon => (
                    <TableRow key={canyon.Id}>
                        <TableCell>
                            <Link href={canyon.Url} target="_blank" rel="noopener noreferrer">{canyon.Name}</Link>
                        </TableCell>
                        <TableCell>
                            <CanyonRating
                                aquaticRating={canyon.AquaticRating}
                                verticalRating={canyon.VerticalRating}
                                commitmentRating={canyon.CommitmentRating}
                                starRating={canyon.StarRating}
                            />
                        </TableCell>
                        <TableCell>
                            <RowActions onEdit={() => setEditCanyon(canyon)} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer></>;
}

export default EditCanyons;