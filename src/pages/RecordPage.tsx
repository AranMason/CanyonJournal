import React from 'react';
import PageTemplate from './PageTemplate';
import RecordEditor from '../components/RecordEditor';
import { useSearchParams } from 'react-router-dom';
import { WaterLevel } from '../types/CanyonRecord';

const RecordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const canyonId = searchParams.get('canyonId');
    const userCanyonId = searchParams.get('userCanyonId');

    const initialValues = canyonId || userCanyonId ? {
        Date: new Date().toISOString().split('T')[0],
        TeamSize: undefined, Comments: '', RopeIds: [], GearIds: [],
        CanyonId: canyonId ? parseInt(canyonId, 10) : undefined,
        UserCanyonId: userCanyonId ? parseInt(userCanyonId, 10) : undefined,
        WaterLevel: WaterLevel.Unknown
    } : undefined;

    return (
        <PageTemplate pageTitle="Record Descent" isAuthRequired>
            <RecordEditor isEdit={false} initialValues={initialValues} />
        </PageTemplate>
    );
};

export default RecordPage;
