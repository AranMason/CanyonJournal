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
    [RegionType.IsleOfMan]: { symbol: "🇬🇧", name: "Isle of Man" },
    [RegionType.Spain]: { symbol: "🇪🇸", name: "Spain" },
    [RegionType.France]: { symbol: "🇫🇷", name: "France" },
    [RegionType.Italy]: { symbol: "🇮🇹", name: "Italy" },
    [RegionType.USA]: { symbol: "🇺🇸", name: "USA" },
    [RegionType.Canada]: { symbol: "🇨🇦", name: "Canada" },
    [RegionType.Mexico]: { symbol: "🇲🇽", name: "Mexico" },
    [RegionType.Australia]: { symbol: "🇦🇺", name: "Australia" },
    [RegionType.NewZealand]: { symbol: "🇳🇿", name: "New Zealand" },
    [RegionType.Switzerland]: { symbol: "🇨🇭", name: "Switzerland" },
    [RegionType.Austria]: { symbol: "🇦🇹", name: "Austria" },
    [RegionType.Norway]: { symbol: "🇳🇴", name: "Norway" },
    [RegionType.Portugal]: { symbol: "🇵🇹", name: "Portugal" },
    [RegionType.Greece]: { symbol: "🇬🇷", name: "Greece" },
    [RegionType.Morocco]: { symbol: "🇲🇦", name: "Morocco" },
    // [RegionType.Jordan]: { symbol: "🇯🇴", name: "Jordan" },
    // [RegionType.Nepal]: { symbol: "🇳🇵", name: "Nepal" },
    // [RegionType.Brazil]: { symbol: "🇧🇷", name: "Brazil" },
    // [RegionType.Argentina]: { symbol: "🇦🇷", name: "Argentina" },
    // [RegionType.Chile]: { symbol: "🇨🇱", name: "Chile" },
    // [RegionType.Peru]: { symbol: "🇵🇪", name: "Peru" },
    // [RegionType.Ecuador]: { symbol: "🇪🇨", name: "Ecuador" },
    [RegionType.CostaRica]: { symbol: "🇨🇷", name: "Costa Rica" },
    // [RegionType.Iceland]: { symbol: "🇮🇸", name: "Iceland" },
    // [RegionType.Slovenia]: { symbol: "🇸🇮", name: "Slovenia" },
    // [RegionType.Croatia]: { symbol: "🇭🇷", name: "Croatia" },
    // [RegionType.Germany]: { symbol: "🇩🇪", name: "Germany" },
    // [RegionType.China]: { symbol: "🇨🇳", name: "China" },
    // [RegionType.Japan]: { symbol: "🇯🇵", name: "Japan" }
}

export function GetRegionDisplayName(type?: RegionType, isShort: boolean = false): string 
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