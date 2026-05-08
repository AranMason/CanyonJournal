import React, { useMemo, useState } from "react";
import { CanyonListEntry } from "../types/Canyon";
import { Box } from "@mui/material";
import RegionType, { RegionTypeList } from "../types/RegionEnum";
import { GetCanyonTypeDisplayName, GetRegionDisplayName } from "../helpers/EnumMapper";
import { CanyonTypeEnum, CanyonTypeList } from "../types/CanyonTypeEnum";
import MultiSelectChipFilter from "./MultiSelectChipFilter";

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
                <MultiSelectChipFilter<RegionType>
                    label="Canyon Region"
                    labelId="canyon-region"
                    value={regionFilter}
                    onChange={setRegionFilter}
                    options={availableRegions.map(r => ({ value: r, label: GetRegionDisplayName(r) }))}
                    sx={{ mb: 2, mt: 2 }}
                />
                <MultiSelectChipFilter<CanyonTypeEnum>
                    label="Canyon Type"
                    labelId="canyon-type"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={CanyonTypeList.map(t => ({ value: t, label: GetCanyonTypeDisplayName(t) }))}
                    sx={{ mb: 2, mt: 2 }}
                />
            </Box>
            <Box display="flex" flexDirection="row" gap={2}>
                <MultiSelectChipFilter<number>
                    label="Vertical Rating"
                    labelId="vert-rating"
                    value={verticalRatingFilter}
                    onChange={v => setVerticalRatingFilter([...v].sort())}
                    options={[...Array(7).keys()].map(i => ({ value: i + 1, label: `V${i + 1}` }))}
                    sx={{ flex: 1 }}
                />
                <MultiSelectChipFilter<number>
                    label="Aquatic Rating"
                    labelId="aqua-rating"
                    value={aquaRatingFilter}
                    onChange={v => setAquaRatingFilter([...v].sort())}
                    options={[...Array(7).keys()].map(i => ({ value: i + 1, label: `A${i + 1}` }))}
                    sx={{ flex: 1 }}
                />
                <MultiSelectChipFilter<number>
                    label="Star Rating"
                    labelId="star-rating"
                    value={starRatingFilter}
                    onChange={v => setStarRatingFilter([...v].sort())}
                    options={[...Array(6).keys()].map(i => ({ value: i, label: i > 0 ? '★'.repeat(i) : 'None' }))}
                    sx={{ flex: 1 }}
                />
            </Box>
        </Box>
        {children(filteredCanyons)}
    </Box>
}

export default CanyonFilter