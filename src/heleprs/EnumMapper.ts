import { CanyonTypeEnum } from "../types/CanyonTypeEnum";
import RegionType from "../types/RegionEnum";

const CanyonTypeDisplayName: {[key in CanyonTypeEnum]: string} = {
    [CanyonTypeEnum.Unknown]: "-",
    [CanyonTypeEnum.Sports]: "Sports",
    [CanyonTypeEnum.Adventure]: "Adventure",
    [CanyonTypeEnum.GorgeWalk]: "Gorge Walk"
}

export function GetCanyonTypeDisplayName(type: CanyonTypeEnum): string {
    return CanyonTypeDisplayName[type  ?? CanyonTypeEnum.Unknown];
}

const CanyonRegionDisplayName: {[key in RegionType]: string} = {
    [RegionType.Unknown]: "-",
    [RegionType.Scotland]: "Scotland",
    [RegionType.England]: "England",
    [RegionType.Wales]: "Wales",
    [RegionType.NorthernIreland]: "Northern Ireland"
}

export function GetRegionDisplayName(type: RegionType): string {

    return CanyonRegionDisplayName[type ?? RegionType.Unknown];
}