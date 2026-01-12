import { Box, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText, CircularProgress, Divider, Rating, Autocomplete, Alert } from "@mui/material";
import { Formik, Form } from "formik";
import {  useNavigate } from "react-router-dom";
import { CanyonRecord, WaterLevel } from "../types/CanyonRecord";
import { apiFetch } from "../utils/api";
import { GearRopeSelector } from "./GearRopeSelector";
import SuccessSnackbar from "./SuccessSnackbar";
import { useEffect, useState } from "react";
import { Canyon } from '../types/Canyon';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import SearchIcon from '@mui/icons-material/Search';
import { GetRegionDisplayName, GetWaterLevelDisplayName } from "../heleprs/EnumMapper";
import CanyonRating from "./CanyonRating";
import RegionType, { RegionTypeList } from "../types/RegionEnum";

type RecordEditorProps = {
    isEdit: boolean,
    initialValues?: CanyonRecord
    submitString?: string
}


const RecordEditor: React.FC<RecordEditorProps> = ({ isEdit, initialValues, submitString }) => {

    const navigate = useNavigate();  
    
    const [canyons, setCanyons] = useState<Canyon[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [isCanyonsLoading, setCanyonsLoading] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

    useEffect(() => {
        setCanyonsLoading(true);
        apiFetch<Canyon[]>('/api/canyons')
            .then(data => setCanyons(data))
            .finally(() => setCanyonsLoading(false));
    }, []);
    
      
    const initialFormValues: CanyonRecord = initialValues || { Name: '', Date: new Date().toISOString().split('T')[0], Url: '', TeamSize: undefined, Comments: '', RopeIds: [], GearIds: [], CanyonId: undefined, Region: RegionType.Unknown, WaterLevel: WaterLevel.Unknown }

    return <>
        <Box maxWidth={400} mx="auto" mt={4}>
                <Formik
                    initialValues={initialFormValues}
                    validationSchema={Yup.object().shape({
                        Name: Yup.string().required('Canyon name is required'),
                        Date: Yup.string().test("maxDate", "Cannot be in the future", val => !val || Date.parse(val) < Date.now()).required('Date is required'),
                        Url: Yup.string().url('Must be a valid URL').nullable(),
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
                            navigate('/journal');
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
                        const handleCanyonSelect = (canyon: Canyon) => {
                            setFieldValue('CanyonId', canyon.Id);
                            setFieldValue('Name', canyon.Name);
                            setFieldValue('Url', canyon.Url);
                            setFieldValue('Region', canyon.Region);
                            setSearchFilter('');
                            setSearchDialogOpen(false);
                        };

                        const filteredCanyons = canyons.filter(canyon => 
                            canyon.Name.toLowerCase().includes(searchFilter.toLowerCase())
                        );

                        return (
                            <Form>
                                <Dialog open={searchDialogOpen} onClose={() => { setSearchDialogOpen(false); setSearchFilter(''); }} maxWidth="sm" fullWidth>
                                    <DialogTitle>Select a Canyon</DialogTitle>
                                    <DialogContent sx={{ height: 500 }}>
                                        {isCanyonsLoading ? (
                                            <Box display="flex" justifyContent="center" p={3}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <>
                                                <Alert severity="info" sx={{ mt: 1, mb: 2 }}>
                                                    Only canyons in the UK have been included so far.
                                                </Alert>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Search by name..."
                                                    value={searchFilter}
                                                    onChange={(e) => setSearchFilter(e.target.value)}
                                                    margin="normal"
                                                    autoFocus
                                                />
                                                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                                                    {filteredCanyons.map(canyon => (
                                                        <ListItem key={canyon.Id} disablePadding>
                                                            <ListItemButton onClick={() => handleCanyonSelect(canyon)}>
                                                                <ListItemText 
                                                                    primary={
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <span>{canyon.Name}</span>
                                                                            <span>{GetRegionDisplayName(canyon.Region, true)}</span>
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <CanyonRating 
                                                                            aquaticRating={canyon.AquaticRating}
                                                                            verticalRating={canyon.VerticalRating}
                                                                            commitmentRating={canyon.CommitmentRating}
                                                                            starRating={canyon.StarRating}
                                                                            isUnrated={canyon.IsUnrated} />
                                                                        }
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </>
                                        )}
                                    </DialogContent>
                                </Dialog>
                                <Typography variant="h6" sx={{ mb: 1, pt: 2 }}>Canyon</Typography>
                                <TextField
                                    label="Name of the Canyon"
                                    name="Name"
                                    value={values.Name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    fullWidth
                                    required
                                    disabled={Boolean(values.CanyonId)}
                                    margin="normal"
                                    error={touched.Name && Boolean(errors.Name)}
                                    helperText={touched.Name && errors.Name}
                                />
                                <TextField
                                    label="Reference URL"
                                    name="Url"
                                    value={values.Url}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    fullWidth
                                    disabled={Boolean(values.CanyonId)}
                                    margin="normal"
                                    error={touched.Url && Boolean(errors.Url)}
                                    helperText={touched.Url && errors.Url}
                                />
                                <Autocomplete
                                    options={RegionTypeList}
                                    getOptionLabel={(option) => GetRegionDisplayName(option)}
                                    value={values.Region ?? RegionType.Unknown}
                                    onChange={(_, newValue) => setFieldValue('Region', newValue ?? RegionType.Unknown)}
                                    disabled={Boolean(values.CanyonId)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Country/Region"
                                            margin="normal"
                                            fullWidth
                                        />
                                    )}
                                    isOptionEqualToValue={(option, value) => option === value}
                                />
                                <Box display="flex" alignItems="center" justifyContent={"space-between"} gap={1} mt={2} mb={1}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<SearchIcon />}
                                        onClick={() => setSearchDialogOpen(true)}
                                    >
                                        Find canyon
                                    </Button>
                                    <Button
                                        disabled={!Boolean(values.CanyonId)}
                                        onClick={() => {
                                            setFieldValue('CanyonId', undefined);
                                            setFieldValue('Name', '');
                                            setFieldValue('Url', '');
                                            setFieldValue('Region', RegionType.Unknown);
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </Box>
                                <Typography variant="h6" sx={{ mb: 1, pt: 2 }}>Trip Information</Typography>
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
                                        <MenuItem key={level} value={level}>{GetWaterLevelDisplayName(level)}</MenuItem>
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
                                <Box display="flex" gap={2} flexDirection="column" mb={2}>
                                <GearRopeSelector
                                    selectedRopeIds={values.RopeIds}
                                    setSelectedRopeIds={ids => setFieldValue('RopeIds', ids)}
                                    selectedGearIds={values.GearIds}
                                    setSelectedGearIds={ids => setFieldValue('GearIds', ids)}
                                />
                                </Box>
                                <Box display={"flex"} flexDirection={"row"} justifyContent={"space-between"} gap={2}>
                                    {isEdit && <Button type="button" variant="outlined" color="primary" sx={{ mt: 2 }} disabled={isSubmitting} onClick={() => navigate("/journal")}>
                                        Cancel
                                    </Button>}
                                    <Button startIcon={submitString ? <SaveAsIcon/> : <AddIcon />} type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmitting}>
                                        {submitString || "Create Record"}
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