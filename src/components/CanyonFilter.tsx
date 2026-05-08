import React, { useMemo, useState } from "react";
import { CanyonListEntry } from "../types/Canyon";
import { Box, Chip, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import RegionType, { RegionTypeList } from "../types/RegionEnum";
import { GetCanyonTypeDisplayName, GetRegionDisplayName } from "../helpers/EnumMapper";
import { CanyonTypeEnum, CanyonTypeList } from "../types/CanyonTypeEnum";

type CanyonFilterProps = {
    canyons: CanyonListEntry[]
    children: (canyons: CanyonListEntry[]) => React.ReactNode
}

const CanyonFilter: React.FC<CanyonFilterProps> = ({ canyons, children }) => {

    const [regionFilter, setRegionFilter] = useState<RegionType[]>([]);
    const [typeFilter, setTypeFilter] = useState<CanyonTypeEnum[]>([]);
    const [verticalRatingFilter, setVerticalRatingFilter] = useState<number[]>([]);
    const [aquaRatingFilter, setAquaRatingFilter] = useState<number[]>([]);
    const [starRatingFilter, setStarRatingFilter] = useState<number[]>([]);

    const availableRegions = useMemo(() => {
        const regionSet = new Set(
            canyons
                .filter(c => (c.Descents ?? 0) > 0)
                .map(c => c.Region)
                .filter((r): r is RegionType => r !== null && r !== undefined)
        );
        return RegionTypeList.filter(r => regionSet.has(r));
    }, [canyons]);

    const filteredCanyons = useMemo(() => {

        return canyons.filter(canyon => {
            if (regionFilter.length > 0) {
                const region = canyon.Region ?? RegionType.Unknown;
                if (!regionFilter.includes(region)) return false;
            }

            if (typeFilter.length > 0) {
                const canyonType = canyon.CanyonType;
                if (canyonType === null || canyonType === undefined) return false;
                if (!typeFilter.includes(canyonType)) return false;
            }

            if (verticalRatingFilter.length > 0 || aquaRatingFilter.length > 0 || starRatingFilter.length > 0) {
                if (canyon.IsUnrated) return false;
            }

            if (verticalRatingFilter.length > 0) {
                if (!verticalRatingFilter.includes(canyon.VerticalRating ?? 0)) return false;
            }

            if (aquaRatingFilter.length > 0) {
                if (!aquaRatingFilter.includes(canyon.AquaticRating ?? 0)) return false;
            } 

            if (starRatingFilter.length > 0) {
                if (!starRatingFilter.includes(canyon.StarRating ?? 0)) return false;
            }

            return true;
        });
    }, [canyons, regionFilter, typeFilter, verticalRatingFilter, aquaRatingFilter, starRatingFilter]);

    return <Box>
        <Box display="flex" flexDirection="column" mb={2}>


            <Box display="flex" flexDirection="row" gap={2}>
                <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                    <InputLabel id="canyon-region">Canyon Region</InputLabel>
                    <Select
                        multiple
                        labelId="canyon-region"
                        label="Canyon Region"
                        value={regionFilter}
                        onChange={e => setRegionFilter(e.target.value as RegionType[])}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as RegionType[]).map((region) => {
                                    return <Chip size="small" key={region} label={GetRegionDisplayName(region)} />;
                                })}
                            </Box>
                        )}
                    >
                        {availableRegions.map((region) => (
                            <MenuItem key={region} value={region}>{GetRegionDisplayName(region)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                    <InputLabel id="canyon-type">Canyon Type</InputLabel>
                    <Select
                        multiple
                        labelId="canyon-type"
                        label="Canyon Type"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as CanyonTypeEnum[])}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as CanyonTypeEnum[]).map((type) => {
                                    return <Chip size="small" key={type} label={GetCanyonTypeDisplayName(type)} />;
                                })}
                            </Box>
                        )}
                    >
                        {CanyonTypeList.map((type) => (
                            <MenuItem key={type} value={type}>{GetCanyonTypeDisplayName(type)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box display="flex" flexDirection="row" gap={2}>
                <FormControl style={{flex: 1}}>
                    <InputLabel id="vert-rating">Vertical Rating</InputLabel>
                    <Select
                        multiple
                        labelId="vert-rating"
                        label="Vertical Rating"
                        value={verticalRatingFilter}
                        onChange={e => setVerticalRatingFilter((e.target.value as number[]).sort())}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((rating) => {
                                    return <Chip size="small" key={rating} label={`V${rating}`} />;
                                })}
                            </Box>
                        )}
                    >
                        {[...Array(7).keys()].map((rating) => (
                            <MenuItem key={rating} value={rating + 1}>{`V${rating+1}`}</MenuItem>
                        ))}
                    </Select>

                </FormControl>
                <FormControl style={{flex: 1}}>
                    <InputLabel id="aqua-rating">Aquatic Rating</InputLabel>
                    <Select
                        multiple
                        labelId="aqua-rating"
                        label="Aquatic Rating"
                        value={aquaRatingFilter}
                        onChange={e => setAquaRatingFilter((e.target.value as number[]).sort())}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((rating) => {
                                    return <Chip size="small" key={rating} label={`A${rating}`} />;
                                })}
                            </Box>
                        )}
                    >
                        {[...Array(7).keys()].map((rating) => (
                            <MenuItem key={rating} value={rating + 1}>{`A${rating+1}`}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl style={{flex: 1}}>
                    <InputLabel id="star-rating">Star Rating</InputLabel>
                    <Select
                        multiple
                        labelId="star-rating"
                        label="Star Rating"
                        value={starRatingFilter}
                        onChange={e => setStarRatingFilter((e.target.value as number[]).sort())}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((rating) => {
                                    return <Chip size="small" key={rating} label={rating > 0 ? '★'.repeat(rating ?? 0) : "None"} />;
                                })}
                            </Box>
                        )}
                    >
                        {[...Array(6).keys()].map((rating) => (
                            <MenuItem key={rating} value={rating}>{rating > 0 ? '★'.repeat(rating ?? 0) : "None"}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
        {children(filteredCanyons)}
    </Box>
}

export default CanyonFilter