import { WaterLevel } from "../types/CanyonRecord";
import { CanyonTypeEnum } from "../types/CanyonTypeEnum";
import RegionType from "../types/RegionEnum";

const CanyonTypeDisplayName: {[key in CanyonTypeEnum]: string} = {
    [CanyonTypeEnum.Unknown]: "-",
    [CanyonTypeEnum.Sports]: "Sports",
    [CanyonTypeEnum.Adventure]: "Adventure",
    [CanyonTypeEnum.GorgeWalk]: "Gorge Scramble"
}

export function GetCanyonTypeDisplayName(type: CanyonTypeEnum): string {
    return CanyonTypeDisplayName[type  ?? CanyonTypeEnum.Unknown];
}

const CanyonRegionDisplayName: {[key in RegionType]: string} = {
    [RegionType.Unknown]: "-",
    [RegionType.Scotland]: "Scotland",
    [RegionType.England]: "England",
    [RegionType.Wales]: "Wales",
    [RegionType.NorthernIreland]: "Northern Ireland",
    [RegionType.IsleOfMan]: "Isle of Man"
}

export function GetRegionDisplayName(type: RegionType): string {

    return CanyonRegionDisplayName[type ?? RegionType.Unknown];
}

const WaterLevelDisplay: { [key in WaterLevel]: string } = {
  // eslint-disable-next-line
  [WaterLevel.Unknown]: '-',
  [WaterLevel.VeryLow]: 'Very Low',
  [WaterLevel.Low]: 'Low',
  [WaterLevel.Medium]: 'Medium',
  [WaterLevel.High]: 'High',
  [WaterLevel.VeryHigh]: 'Very High'
};

export function GetWaterLevelDisplayName(type: WaterLevel): string {

    return WaterLevelDisplay[type ?? WaterLevel.Unknown];
}