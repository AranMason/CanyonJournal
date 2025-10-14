import React, { useEffect, useState } from "react";
import { CanyonWithDescents } from "../types/Canyon";
import { Box, Chip, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import RegionType, { RegionTypeList } from "../types/RegionEnum";
import { GetCanyonTypeDisplayName, GetRegionDisplayName } from "../heleprs/EnumMapper";
import { CanyonTypeEnum, CanyonTypeList } from "../types/CanyonTypeEnum";

type CanyonFilterProps = {
    canyons: CanyonWithDescents[]
    children: (canyons: CanyonWithDescents[]) => React.ReactNode
}

type FilterOptions = {
    region: RegionType[]
    type: CanyonTypeEnum[],
    verticalRating: number[],
    aquaRating: number[],
    starRating: number[]
}

const initialFilterOptions: FilterOptions = {
    region: [],
    type: [],
    verticalRating: [],
    aquaRating: [],
    starRating: []
}

const CanyonFilter: React.FC<CanyonFilterProps> = ({ canyons, children }) => {

    const [filteredCanyons, setCanyons] = useState<CanyonWithDescents[]>(canyons)
    const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilterOptions)


    useEffect(() => {

        var filtersList: ((value: CanyonWithDescents) => boolean)[] = []

        if (filterOptions.region.length > 0) {
            filtersList.push(s => filterOptions.region.includes(s.Region ?? RegionType.Unknown))
        }

        if (filterOptions.type.length > 0) {
            filtersList.push(s => filterOptions.type.includes(s.CanyonType ?? RegionType.Unknown))
        }

        if(filterOptions.verticalRating.length > 0 || filterOptions.aquaRating.length > 0 || filterOptions.starRating.length > 0) {
            filtersList.push(s => !s.IsUnrated)
        }

        if (filterOptions.verticalRating.length > 0) {
            filtersList.push(s => filterOptions.verticalRating.includes(s.VerticalRating ?? 0))
        }
        if (filterOptions.aquaRating.length > 0) {
            filtersList.push(s => filterOptions.aquaRating.includes(s.AquaticRating ?? 0))
        }
        if (filterOptions.starRating.length > 0) {
            filtersList.push(s => filterOptions.starRating.includes(s.StarRating ?? 0))
        }

        if (filtersList.length === 0) {
            setCanyons(canyons);
        } else {
            var newCanyonsList = canyons.filter(canyon => filtersList.every(filter => filter(canyon)))

            setCanyons(newCanyonsList);
        }


    }, [filterOptions, canyons])

    return <Box>
        <Box display="flex" flexDirection="column" mb={2}>


            <Box display="flex" flexDirection="row" gap={2}>
                <FormControl fullWidth sx={{ mb: 2, mt: 2 }}>
                    <InputLabel id="canyon-region">Canyon Region</InputLabel>
                    <Select
                        multiple
                        labelId="canyon-region"
                        label="Canyon Region"
                        value={filterOptions.region}
                        onChange={e => setFilterOptions({
                            ...filterOptions,
                            region: e.target.value as RegionType[]
                        })}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected).map((region) => {
                                    return <Chip size="small" key={region} label={GetRegionDisplayName(region)} />;
                                })}
                            </Box>
                        )}
                    >
                        {RegionTypeList.map((region) => (
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
                        value={filterOptions.type}
                        onChange={e => setFilterOptions({
                            ...filterOptions,
                            type: e.target.value as CanyonTypeEnum[]
                        })}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected).map((type) => {
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
                        value={filterOptions.verticalRating}
                        onChange={e => setFilterOptions({
                            ...filterOptions,
                            verticalRating: e.target.value as number[]
                        })}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((rating) => {
                                    return <Chip size="small" key={rating} label={rating} />;
                                })}
                            </Box>
                        )}
                    >
                        {[...Array(7).keys()].map((rating) => (
                            <MenuItem key={rating} value={rating + 1}>{rating + 1}</MenuItem>
                        ))}
                    </Select>

                </FormControl>
                <FormControl style={{flex: 1}}>
                    <InputLabel id="aqua-rating">Aquatic Rating</InputLabel>
                    <Select
                        multiple
                        labelId="aqua-rating"
                        label="Aquatic Rating"
                        value={filterOptions.aquaRating}
                        onChange={e => setFilterOptions({
                            ...filterOptions,
                            aquaRating: e.target.value as number[]
                        })}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((rating) => {
                                    return <Chip size="small" key={rating} label={rating} />;
                                })}
                            </Box>
                        )}
                    >
                        {[...Array(7).keys()].map((rating) => (
                            <MenuItem key={rating} value={rating + 1}>{rating + 1}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl style={{flex: 1}}>
                    <InputLabel id="star-rating">Star Rating</InputLabel>
                    <Select
                        multiple
                        labelId="star-rating"
                        label="Star Rating"
                        value={filterOptions.starRating}
                        onChange={e => setFilterOptions({
                            ...filterOptions,
                            starRating: e.target.value as number[]
                        })}
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