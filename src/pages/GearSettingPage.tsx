import { Typography } from "@mui/material"
import PageTemplate from "./PageTemplate"
import { useTranslation } from "react-i18next"
import GearOverview from "../components/gear/GearOverview";

const GearSettingPage = () => {

    const { t } = useTranslation();

    return (
        <PageTemplate pageTitle={t('gear.title')} isAuthRequired={true}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('gear.descriptionText')}
                  </Typography>
            <GearOverview />
        </PageTemplate>
    )
}

export default GearSettingPage