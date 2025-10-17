import { Box, Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button } from "@mui/material";
import { Formik, Form } from "formik";
import {  useNavigate } from "react-router-dom";
import { CanyonRecord, WaterLevel } from "../types/CanyonRecord";
import { apiFetch } from "../utils/api";
import { GearRopeSelector } from "./GearRopeSelector";
import SuccessSnackbar from "./SuccessSnackbar";
import { useEffect, useState } from "react";
import { Canyon } from '../types/Canyon';
import * as Yup from 'yup';

type RecordEditorProps = {
    isEdit: boolean,
    initialValues?: CanyonRecord
    submitString?: string
}

type OtherOption = {
    Id: 0;
    Name: string;
    Url: string;
    AquaticRating: number;
    VerticalRating: number;
    StarRating: number;
}

const WaterLevelDisplay: { [key in WaterLevel]: string } = {
    [WaterLevel.Unknown]: 'Unknown',
    [WaterLevel.VeryLow]: 'Very Low',
    [WaterLevel.Low]: 'Low',   
    [WaterLevel.Medium]: 'Medium',
    [WaterLevel.High]: 'High',
    [WaterLevel.VeryHigh]: 'Very High'
};


const RecordEditor: React.FC<RecordEditorProps> = ({ isEdit, initialValues, submitString }) => {

    const navigate = useNavigate();  
    
    const [canyons, setCanyons] = useState<Canyon[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const customCanyonOption: OtherOption = { Id: 0, Name: 'Other', Url: '', AquaticRating: 0, VerticalRating: 0, StarRating: 0 };
    const canyonOptions: (Canyon | OtherOption)[] = [...canyons, customCanyonOption];
    const [isCanyonsLoading, setCanyonsLoading] = useState(false);

    useEffect(() => {
        setCanyonsLoading(true);
        apiFetch<Canyon[]>('/api/canyons')
            .then(data => setCanyons(data))
            .finally(() => setCanyonsLoading(false));
    }, []);
    
      
    const initialFormValues: CanyonRecord = initialValues || { Name: '', Date: new Date().toISOString().split('T')[0], Url: '', TeamSize: undefined, Comments: '', RopeIds: [], GearIds: [], CanyonId: undefined, WaterLevel: WaterLevel.Unknown }

    return <>
        <Box maxWidth={400} mx="auto" mt={4}>
                <Formik
                    initialValues={initialFormValues}
                    validationSchema={Yup.object().shape({
                        Name: Yup.string().when('CanyonId', {
                            is: (val: number | undefined) => val === 0 || !val,
                            then: schema => schema.required('Canyon name is required'),
                            otherwise: schema => schema,
                        }),
                        Date: Yup.string().test("maxDate", "Cannot be in the future", val => !val || Date.parse(val) < Date.now()).required('Date is required'),
                        Url: Yup.string().when('CanyonId', {
                            is: (val: number | undefined) => val === 0 || !val,
                            then: schema => schema.url('Must be a valid URL').nullable(),
                            otherwise: schema => schema,
                        }),
                        TeamSize: Yup.number().min(1, 'Team size must be at least 1').required('Team size is required'),
                        Comments: Yup.string().nullable(),
                        WaterLevel: Yup.number().min(0, 'Invalid water level').max(5, 'Invalid water level')
                    })}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await apiFetch('/api/record', {
                                method: isEdit ? 'PATCH' : 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...values,
                                    RopeIds: values.RopeIds,
                                    GearIds: values.GearIds,
                                    CanyonId: values.CanyonId || null,
                                }),
                            });
                            setSnackbarOpen(true);
                            navigate('/');
                        } catch (err: any) {
                            if (err.message !== 'Unauthorized') {
                                alert(err.message || 'Failed to record canyon.');
                            }
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ errors, touched, handleChange, handleBlur, values, setFieldValue, isSubmitting }) => {
                        // Find selected canyon by id
                        const selectedCanyon = canyonOptions.find(c => c.Id === values.CanyonId);
                        return (
                            <Form>
                                <Autocomplete
                                    options={canyonOptions}
                                    getOptionLabel={option => typeof option === 'string' ? option : option.Name}
                                    loading={isCanyonsLoading}
                                    onChange={(_, canyon) => {
                                        if (!canyon || (typeof canyon === 'string')) {
                                            setFieldValue('CanyonId', 0);
                                            setFieldValue('Name', '');
                                            setFieldValue('Url', '');
                                        } else if (canyon.Id === 0) {
                                            setFieldValue('CanyonId', 0);
                                            setFieldValue('Name', '');
                                            setFieldValue('Url', '');
                                        } else {
                                            setFieldValue('CanyonId', canyon.Id);
                                            setFieldValue('Name', canyon.Name);
                                            setFieldValue('Url', canyon.Url);
                                        }
                                    }}
                                    value={
                                        typeof values.CanyonId === 'undefined' ? null : canyonOptions.find(c => c.Id === values.CanyonId) || null
                                    }
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            label="Canyon"
                                            name="Canyon"
                                            onBlur={handleBlur}
                                            required
                                            margin="normal"
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => {
                                        if (typeof option === 'string' || typeof value === 'string') return option === value;
                                        return option.Id === value.Id;
                                    }}
                                />
                                <TextField
                                    label="Name of the Canyon"
                                    name="Name"
                                    value={values.Name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    fullWidth
                                    required={values.CanyonId === 0}
                                    margin="normal"
                                    error={touched.Name && Boolean(errors.Name)}
                                    helperText={touched.Name && errors.Name}
                                    disabled={!!selectedCanyon && selectedCanyon.Id !== 0}
                                />
                                <TextField
                                    label="Canyon Log URL"
                                    name="Url"
                                    value={values.Url}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    fullWidth
                                    margin="normal"
                                    error={touched.Url && Boolean(errors.Url)}
                                    helperText={touched.Url && errors.Url}
                                    disabled={!!selectedCanyon && selectedCanyon.Id !== 0}
                                />
                                <TextField
                                    label="Date"
                                    type="date"
                                    name="Date"
                                    value={values.Date}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    fullWidth
                                    required
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    error={touched.Date && Boolean(errors.Date)}
                                    helperText={touched.Date && errors.Date}
                                />
                                <TextField
                                    label="Team Size"
                                    type="number"
                                    name="TeamSize"
                                    value={values.TeamSize}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    fullWidth
                                    required
                                    margin="normal"
                                    inputProps={{ min: 1 }}
                                    error={touched.TeamSize && Boolean(errors.TeamSize)}
                                    helperText={touched.TeamSize && errors.TeamSize}
                                />
                                <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                                <InputLabel id="water-level-label">Water Level</InputLabel>
                                <Select
                                    labelId="water-level-label"
                                    label="Water Level"
                                    value={values.WaterLevel}
                                    onChange={e => setFieldValue('WaterLevel', e.target.value as number)}
                                    fullWidth
                                    error={touched.WaterLevel && Boolean(errors.WaterLevel)}
                                >
                                    {[WaterLevel.Unknown, WaterLevel.VeryLow, WaterLevel.Low, WaterLevel.Medium, WaterLevel.High, WaterLevel.VeryHigh].map((level) => (
                                        <MenuItem key={level} value={level}>{WaterLevelDisplay[level]}</MenuItem>
                                    ))}
                                </Select></FormControl>
                                <TextField
                                    label="Comments"
                                    name="Comments"
                                    value={values.Comments}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    fullWidth
                                    margin="normal"
                                    multiline
                                    minRows={3}
                                    error={touched.Comments && Boolean(errors.Comments)}
                                    helperText={touched.Comments && errors.Comments}
                                />
                                <Typography variant="h6" sx={{ mb: 1, pt: 2 }}>Gear & Rope Used</Typography>
                                <GearRopeSelector
                                    selectedRopeIds={values.RopeIds}
                                    setSelectedRopeIds={ids => setFieldValue('RopeIds', ids)}
                                    selectedGearIds={values.GearIds}
                                    setSelectedGearIds={ids => setFieldValue('GearIds', ids)}
                                />
                                <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} gap={2}>
                                    {isEdit && <Button type="button" variant="outlined" color="primary" sx={{ mt: 2 }} disabled={isSubmitting} onClick={() => navigate("/journal")}>
                                        Cancel
                                    </Button>}
                                    <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmitting}>
                                        {submitString || "Submit"}
                                    </Button>
                                    
                                </Box>
                                
                            </Form>
                        );
                    }}
                </Formik>
            </Box>
            <SuccessSnackbar open={snackbarOpen} message="Canyon record added!" onClose={() => setSnackbarOpen(false)} />
    </>
}

export default RecordEditor;