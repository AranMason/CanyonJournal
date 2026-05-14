import i18n from '../i18n';
import { WaterLevel } from "../types/CanyonRecord";
import { CanyonTypeEnum } from "../types/CanyonTypeEnum";
import RegionType from "../types/RegionEnum";

const regionKey: { [key in RegionType]: string } = {
    [RegionType.Unknown]: 'unknown',
    [RegionType.Scotland]: 'scotland',
    [RegionType.England]: 'england',
    [RegionType.Wales]: 'wales',
    [RegionType.NorthernIreland]: 'northernIreland',
    [RegionType.IsleOfMan]: 'isleOfMan',
    [RegionType.Spain]: 'spain',
    [RegionType.France]: 'france',
    [RegionType.Italy]: 'italy',
    [RegionType.USA]: 'usa',
    [RegionType.Canada]: 'canada',
    [RegionType.Mexico]: 'mexico',
    [RegionType.Australia]: 'australia',
    [RegionType.NewZealand]: 'newZealand',
    [RegionType.Switzerland]: 'switzerland',
    [RegionType.Austria]: 'austria',
    [RegionType.Norway]: 'norway',
    [RegionType.Portugal]: 'portugal',
    [RegionType.Greece]: 'greece',
    [RegionType.Morocco]: 'morocco',
    [RegionType.Nepal]: 'nepal',
    [RegionType.Brazil]: 'brazil',
    [RegionType.Argentina]: 'argentina',
    [RegionType.Chile]: 'chile',
    [RegionType.Peru]: 'peru',
    [RegionType.CostaRica]: 'costaRica',
    [RegionType.Iceland]: 'iceland',
    [RegionType.Germany]: 'germany',
    [RegionType.China]: 'china',
    [RegionType.Japan]: 'japan',
    [RegionType.Turkey]: 'turkey',
    [RegionType.SouthAfrica]: 'southAfrica',
};

const canyonTypeKey: { [key in CanyonTypeEnum]: string } = {
    [CanyonTypeEnum.Unknown]: 'unknown',
    [CanyonTypeEnum.Sports]: 'sports',
    [CanyonTypeEnum.Adventure]: 'adventure',
    [CanyonTypeEnum.GorgeWalk]: 'gorgeWalk',
    [CanyonTypeEnum.Dry]: 'dry',
};

const waterLevelKey: { [key in WaterLevel]: string } = {
    [WaterLevel.Unknown]: 'unknown',
    [WaterLevel.VeryLow]: 'veryLow',
    [WaterLevel.Low]: 'low',
    [WaterLevel.Medium]: 'medium',
    [WaterLevel.High]: 'high',
    [WaterLevel.VeryHigh]: 'veryHigh',
};

export function GetCanyonTypeDisplayName(type: CanyonTypeEnum): string {
    const key = canyonTypeKey[type ?? CanyonTypeEnum.Unknown];
    return i18n.t(`enums:canyonType.${key}`);
}

export function GetRegionDisplayName(type?: RegionType, isShort: boolean = false): string {
    const key = regionKey[type ?? RegionType.Unknown];
    const symbol = i18n.t(`regions:${key}.symbol`);
    if (isShort) return symbol;
    const name = i18n.t(`regions:${key}.name`);
    return symbol ? `${symbol} ${name}` : name;
}

export function GetWaterLevelDisplayName(type: WaterLevel): string {
    const key = waterLevelKey[type ?? WaterLevel.Unknown];
    return i18n.t(`enums:waterLevel.${key}`);
}
