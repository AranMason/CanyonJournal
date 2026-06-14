import { useTranslation } from "react-i18next"
import SettingsGoalsTab from "../components/settings/SettingsGoalsTab"
import PageTemplate from "./PageTemplate"

const GoalSettingPage = () => {

    const {t } = useTranslation("translation");

    return (
        <PageTemplate pageTitle={t("goals.title")} isAuthRequired={true}>
            <SettingsGoalsTab />
        </PageTemplate>
    )
}

export default GoalSettingPage