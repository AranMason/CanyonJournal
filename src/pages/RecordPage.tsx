import React from 'react';
import PageTemplate from './PageTemplate';
import RecordEditor from '../components/RecordEditor';



const RecordPage: React.FC = () => {
    

    return (
        <PageTemplate pageTitle="Record Descent" isAuthRequired>
            <RecordEditor isEdit={false} />
        </PageTemplate>
    );
};

export default RecordPage;
