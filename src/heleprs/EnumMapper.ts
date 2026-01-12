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

const CanyonRegionDisplayName: {[key in RegionType]: {
    symbol: string;
    name: string;
}} = {
    [RegionType.Unknown]: { symbol: "", name: "-" },
    [RegionType.Scotland]: { symbol: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", name: "Scotland" },
    [RegionType.England]: { symbol: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", name: "England" },
    [RegionType.Wales]: { symbol: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", name: "Wales" },
    [RegionType.NorthernIreland]: { symbol: "🇬🇧", name: "Northern Ireland" },
    [RegionType.IsleOfMan]: { symbol: "🇬🇧", name: "Isle of Man" }
}

export function GetRegionDisplayName(type: RegionType, isShort: boolean = false): string 
{
    var region = CanyonRegionDisplayName[type ?? RegionType.Unknown];
    return isShort ? `${region.symbol}` : [region.symbol, region.name].join(" ");
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