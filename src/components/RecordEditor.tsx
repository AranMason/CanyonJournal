import { Box, TextField, Typography, Button, List, ListItem, ListItemButton, ListItemText, CircularProgress, ListSubheader, Paper } from "@mui/material";
import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import { CanyonRecord, WaterLevel } from "../types/CanyonRecord";
import { apiFetch } from "../utils/api";
import * as UserCanyonDataStore from '../helpers/UserCanyonDataStore';
import { GearRopeSelector } from "./GearRopeSelector";
import SuccessSnackbar from "./SuccessSnackbar";
import React, { useEffect, useState } from "react";
import { CanyonListEntry } from '../types/Canyon';
import { UserCanyon } from '../types/UserCanyon';
import { parseCanyonKey } from '../utils/canyonKey';
import AddCanyonModal, { CanyonModalFormValues } from './AddCanyonModal';
import { mapCanyonFormToApiBody } from '../utils/canyonForm';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import StarIcon from '@mui/icons-material/Star';
import { GetRegionDisplayName } from "../helpers/EnumMapper";
import CanyonRating from "./CanyonRating";
import IconPicker from "./IconPicker";

type RecordEditorProps = {
    isEdit: boolean,
    initialValues?: CanyonRecord
    submitString?: string
}

const RecordEditor: React.FC<RecordEditorProps> = ({ isEdit, initialValues, submitString }) => {

    const navigate = useNavigate();

    const [canyons, setCanyons] = useState<CanyonListEntry[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [isCanyonsLoading, setCanyonsLoading] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');
    const [selectedDisplay, setSelectedDisplay] = useState<{ name: string; isVerified: boolean; canyon?: CanyonListEntry } | null>(null);

    useEffect(() => {
        setCanyonsLoading(true);
        apiFetch<CanyonListEntry[]>('/api/canyons?withDescents=1')
            .then(data => {
                setCanyons(data);
                // Restore display info for edit mode using parseCanyonKey
                if (initialValues?.CanyonId) {
                    const match = data.find(c => parseCanyonKey(c.Key).canyonId === initialValues.CanyonId);
                    if (match) setSelectedDisplay({ name: match.Name, isVerified: true, canyon: match });
                } else if (initialValues?.UserCanyonId) {
                    const match = data.find(c => parseCanyonKey(c.Key).userCanyonId === initialValues.UserCanyonId);
                    if (match) setSelectedDisplay({ name: match.Name, isVerified: false, canyon: match });
                }
            })
            .finally(() => setCanyonsLoading(false));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const initialFormValues: CanyonRecord = initialValues || {
        Date: new Date().toISOString().split('T')[0],
        TeamSize: undefined, Comments: '', RopeIds: [], GearIds: [],
        CanyonId: undefined, UserCanyonId: undefined, WaterLevel: WaterLevel.Unknown
    };

    return<>
        <Box maxWidth={400} mx="auto" mt={4}>
                <Formik
                    initialValues={initialFormValues}
                    validationSchema={Yup.object().shape({
                        Date: Yup.string().test("maxDate", "Cannot be in the future", val => !val || Date.parse(val) < Date.now()).required('Date is required'),
                        TeamSize: Yup.number().min(1, 'Team size must be at least 1').required('Team size is required'),
                        Comments: Yup.string().nullable(),
                        WaterLevel: Yup.number().min(0, 'Invalid water level').max(5, 'Invalid water level'),
                        CanyonId: Yup.number().nullable(),
                        UserCanyonId: Yup.number().nullable(),
                    }).test('canyon-required', 'A canyon must be selected', (values) =>
                        Boolean(values.CanyonId) || Boolean(values.UserCanyonId)
                    )}
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
                                    UserCanyonId: values.UserCanyonId || null,
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
                    {({ errors, touched, handleChange, handleBlur, values, setFieldValue, setFieldTouched, isSubmitting }) => {

                        const handleCanyonSelect = (canyon: CanyonListEntry) => {
                            const { canyonId } = parseCanyonKey(canyon.Key);
                            setFieldValue('CanyonId', canyonId);
                            setFieldValue('UserCanyonId', undefined);
                            setSelectedDisplay({ name: canyon.Name, isVerified: true, canyon });
                            setSearchFilter('');
                        };

                        const handleUserCanyonSelect = (canyon: CanyonListEntry) => {
                            const { userCanyonId } = parseCanyonKey(canyon.Key);
                            setFieldValue('UserCanyonId', userCanyonId);
                            setFieldValue('CanyonId', undefined);
                            setSelectedDisplay({ name: canyon.Name, isVerified: false, canyon });
                            setSearchFilter('');
                        };

                        const handleAddCanyonSubmit = async (values: CanyonModalFormValues) => {
                            const newCanyon = await apiFetch<UserCanyon>('/api/user-canyons', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(mapCanyonFormToApiBody(values)),
                            });
                            setFieldValue('UserCanyonId', newCanyon.Id);
                            setFieldValue('CanyonId', undefined);
                            setSelectedDisplay({ name: newCanyon.Name, isVerified: false });
                            UserCanyonDataStore.invalidate();
                        };

                        const lowerFilter = searchFilter.trim().toLowerCase();
                        const matchesFilter = (name: string, url?: string) =>
                            !lowerFilter || name.toLowerCase().includes(lowerFilter) || (url || '').toLowerCase().includes(lowerFilter);

                        const favouriteCanyons = canyons
                            .filter(c => c.IsFavourite && matchesFilter(c.Name, c.Url))
                            .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }));

                        const otherCanyons = canyons
                            .filter(c => !c.IsFavourite && (c.IsVerified || c.Descents > 0) && matchesFilter(c.Name, c.Url))
                            .sort((a, b) => a.Name.localeCompare(b.Name, undefined, { sensitivity: 'base' }));

                        const canyonError = !values.CanyonId && !values.UserCanyonId && touched.CanyonId;

                        return (
                            <Form>
                                {/* Create Custom Canyon Modal */}
                                <AddCanyonModal
                                    canyon={null}
                                    open={createDialogOpen}
                                    onClose={() => setCreateDialogOpen(false)}
                                    title="New Canyon"
                                    showNotes
                                    onSubmit={handleAddCanyonSubmit}
                                />

                                <Typography variant="h6" sx={{ mb: 1, pt: 2 }}>Canyon</Typography>

                                {selectedDisplay ? (
                                    <>
                                    <Box border={1} borderColor="divider" borderRadius={1} p={2} mb={2}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                {selectedDisplay.isVerified && <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />}
                                                <Typography variant="subtitle1" fontWeight={600}>{selectedDisplay.name}</Typography>
                                            </Box>
                                            <Typography variant="body2">
                                                {selectedDisplay.canyon ? GetRegionDisplayName(selectedDisplay.canyon.Region) : ''}
                                            </Typography>
                                        </Box>
                                        {selectedDisplay.canyon && (
                                            <Box sx={{ color: 'text.secondary' }}>
                                                <CanyonRating
                                                    aquaticRating={selectedDisplay.canyon.AquaticRating}
                                                    verticalRating={selectedDisplay.canyon.VerticalRating}
                                                    commitmentRating={selectedDisplay.canyon.CommitmentRating}
                                                    starRating={selectedDisplay.canyon.StarRating}
                                                    isUnrated={selectedDisplay.canyon.IsUnrated}
                                                />
                                            </Box>
                                        )}
                                        
                                    </Box>
                                    <Box display="flex" gap={1} mt={1}>
                                            <Button size="small" startIcon={<EditIcon />} onClick={() => {
                                                setFieldValue('CanyonId', undefined);
                                                setFieldValue('UserCanyonId', undefined);
                                                setSelectedDisplay(null);
                                                setSearchFilter('');
                                            }}>
                                                Change Canyon
                                            </Button>
                                        </Box>
                                    </>
                                ) : (
                                    <Box mb={2}>
                                        {isCanyonsLoading ? (
                                            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                                        ) : (
                                            <>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Search by name..."
                                                    value={searchFilter}
                                                    onChange={(e) => setSearchFilter(e.target.value)}
                                                    size="small"
                                                    sx={{ mb: 1 }}
                                                    error={canyonError}
                                                    helperText={canyonError ? 'A canyon must be selected' : ''}
                                                />
                                                <List component={Paper} elevation={0} sx={{ maxHeight: 320, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'grey.50' }}>
                                                    {favouriteCanyons.length > 0 && (
                                                        <ListSubheader disableSticky sx={{ lineHeight: '36px', fontWeight: 600 }}>Favourites</ListSubheader>
                                                    )}
                                                    {favouriteCanyons.map((canyon) => (
                                                        <ListItem key={canyon.Key} disablePadding>
                                                            <ListItemButton onClick={() => canyon.IsVerified ? handleCanyonSelect(canyon) : handleUserCanyonSelect(canyon)}>
                                                                <ListItemText
                                                                    primary={
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                                {canyon.IsVerified && <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />}
                                                                                <span>{canyon.Name}</span>
                                                                            </Box>
                                                                            <span>{GetRegionDisplayName(canyon.Region, true)}</span>
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <CanyonRating aquaticRating={canyon.AquaticRating} verticalRating={canyon.VerticalRating} commitmentRating={canyon.CommitmentRating} starRating={canyon.StarRating} isUnrated={canyon.IsUnrated} />
                                                                    }
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                    {otherCanyons.length > 0 && (
                                                        <ListSubheader disableSticky sx={{ lineHeight: '36px', fontWeight: 600 }}>All Canyons</ListSubheader>
                                                    )}
                                                    {otherCanyons.map(canyon => (
                                                        <ListItem key={canyon.Key} disablePadding>
                                                            <ListItemButton onClick={() => canyon.IsVerified ? handleCanyonSelect(canyon) : handleUserCanyonSelect(canyon)}>
                                                                <ListItemText
                                                                    primary={
                                                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                                                {canyon.IsVerified && <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} />}
                                                                                <span>{canyon.Name}</span>
                                                                            </Box>
                                                                            <span>{GetRegionDisplayName(canyon.Region, true)}</span>
                                                                        </Box>
                                                                    }
                                                                    secondary={
                                                                        <CanyonRating aquaticRating={canyon.AquaticRating} verticalRating={canyon.VerticalRating} commitmentRating={canyon.CommitmentRating} starRating={canyon.StarRating} isUnrated={canyon.IsUnrated} />
                                                                    }
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    fullWidth
                                                    sx={{ mt: 2 }}
                                                    onClick={() => setCreateDialogOpen(true)}
                                                >
                                                    Add New Canyon
                                                </Button>
                                            </>
                                        )}
                                    </Box>
                                )}

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
                                <Box sx={{ mb: 2, mt: 2 }}>
                                    <IconPicker
                                        label="Water Level"
                                        value={values.WaterLevel ?? 0}
                                        onChange={v => setFieldValue('WaterLevel', v)}
                                        icon={WaterDropIcon}
                                        activeColor="info"
                                    />
                                </Box>
                                <Box sx={{ mb: 2, mt: 2 }}>
                                    <IconPicker
                                        label="Trip Rating"
                                        value={values.TripRating ?? 0}
                                        onChange={v => setFieldValue('TripRating', v)}
                                        icon={StarIcon}
                                        activeColor="warning"
                                    />
                                </Box>
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
                                    <Button startIcon={submitString ? <SaveAsIcon/> : <AddIcon />} type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isSubmitting} onClick={() => setFieldTouched('CanyonId', true)}>
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
