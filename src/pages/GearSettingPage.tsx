import { Typography } from "@mui/material"
import SettingsGearTab from "../components/settings/SettingsGearTab"
import PageTemplate from "./PageTemplate"
import { useTranslation } from "react-i18next"

const GearSettingPage = () => {

    const { t } = useTranslation();

    return (
        <PageTemplate pageTitle={t('gear.title')} isAuthRequired={true}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('gear.descriptionText')}
                  </Typography>
            <SettingsGearTab />
        </PageTemplate>
    )
}

export default GearSettingPage