import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { CanyonRecord } from "../types/CanyonRecord";
import { apiFetch } from "../utils/api";
import RecordEditor from "../components/RecordEditor";
import PageTemplate from "./PageTemplate";

const EditRecordPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{id?: string}>();
    const recordIdNum = id ? parseInt(id, 10) : undefined;

    const [isRecordLoading, setRecordLoading] = useState(false);
    const [initialValues, setInitialValues] = useState<CanyonRecord>();

    useEffect(() => {

        if (!recordIdNum) {
            navigate('/record');
        };

        setRecordLoading(true);
        apiFetch<CanyonRecord>('/api/record/' + recordIdNum)
            .then(data => {
                setInitialValues({ 
                    Id: data.Id,
                    Name: data.Name, 
                    Date: data.Date.split('T')[0], 
                    Url: data.Url, 
                    TeamSize: data.TeamSize, 
                    Comments: data.Comments, 
                    RopeIds: data.RopeIds, 
                    GearIds: data.GearIds, 
                    CanyonId: data.CanyonId, 
                    WaterLevel: data.WaterLevel 
                });
            })
            .finally(() => setRecordLoading(false));
    }, [recordIdNum, navigate]);

    return <PageTemplate pageTitle="Edit Record" isAuthRequired isLoading={isRecordLoading || !initialValues}>
            <RecordEditor initialValues={initialValues} submitString="Save Changes" isEdit/>
        </PageTemplate>
}

export default EditRecordPage;