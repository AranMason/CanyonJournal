import i18n from '../i18n';
import { WaterLevel } from "../types/CanyonRecord";
import { CanyonTypeEnum } from "../types/CanyonTypeEnum";
import { ReportIssueType } from "../types/ReportIssueType";
import { ReportStatus } from "../types/ReportStatus";

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



export function GetWaterLevelDisplayName(type: WaterLevel): string {
    const key = waterLevelKey[type ?? WaterLevel.Unknown];
    return i18n.t(`enums:waterLevel.${key}`);
}

const reportIssueTypeKey: { [key in ReportIssueType]: string } = {
    [ReportIssueType.BrokenLink]: 'brokenLink',
    [ReportIssueType.IncorrectData]: 'incorrectData',
    [ReportIssueType.Other]: 'other',
};

const reportStatusKey: { [key in ReportStatus]: string } = {
    [ReportStatus.Pending]: 'pending',
    [ReportStatus.TBD]: 'tbd',
    [ReportStatus.Reviewed]: 'reviewed',
    [ReportStatus.Rejected]: 'rejected',
};

export function GetReportIssueTypeDisplayName(type: ReportIssueType): string {
    const key = reportIssueTypeKey[type];
    return i18n.t(`enums:reportIssueType.${key}`);
}

export function GetReportStatusDisplayName(status: ReportStatus): string {
    const key = reportStatusKey[status];
    return i18n.t(`enums:reportStatus.${key}`);
}
