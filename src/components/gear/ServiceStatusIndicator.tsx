import React from "react";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { Box, Tooltip, Typography } from "@mui/material";
import { GearServiceStatus } from "../../types/GearStatusType";
import { useTranslation } from "react-i18next";

type ServiceStatusIndicatorProps = {
  isRetired: boolean;
  statusCode: GearServiceStatus | undefined;
  size?: "small" | "medium";
  showText?: boolean;
};

const getResolvedStatus = (isRetired: boolean, statusCode?: GearServiceStatus | null): GearServiceStatus | null => {
  if (isRetired) {
    return GearServiceStatus.Retired;
  }

  if (statusCode === undefined || statusCode === null) {
    return null;
  }

  return statusCode;
};

const getColor = (status: GearServiceStatus | null): string => {
  switch (status) {
    case GearServiceStatus.Good:
      return "success.main";
    case GearServiceStatus.Watch:
      return "warning.main";
    case GearServiceStatus.Bad:
      return "error.main";
    case GearServiceStatus.Retired:
      return "grey.800";
    default:
      return "grey.500";
  }
};

const getIconPixelSize = (size: "small" | "medium"): number => {
  return size === "medium" ? 16 : 14;
};

const ServiceStatusIndicator: React.FC<ServiceStatusIndicatorProps> = ({
  isRetired,
  statusCode,
  size = "small",
  showText = false,
}) => {
  const { t } = useTranslation();
  const resolvedStatus = getResolvedStatus(isRetired, statusCode);
  const label = t('gear.serviceStatus', { context: resolvedStatus });

  return (
    <Tooltip title={label}>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <FiberManualRecordIcon
          fontSize={size ?? "medium"}
          sx={{ color: getColor(resolvedStatus), fontSize: getIconPixelSize(size), verticalAlign: "middle" }}
          aria-label={label}
        />
        {showText && (
          <Typography component="span" variant="body2" color="text.primary">
            {label}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

export default ServiceStatusIndicator;
