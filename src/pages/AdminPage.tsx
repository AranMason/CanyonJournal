import React from 'react';
import PageTemplate from './PageTemplate';
import EditCanyons from '../components/admin/EditCanyons';

const AdminPage: React.FC = () => {



    return (
        <PageTemplate pageTitle="Admin Panel" isAuthRequired>
            <EditCanyons />
        </PageTemplate>
    );
}

export default AdminPage;