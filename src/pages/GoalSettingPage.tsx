import { useTranslation } from "react-i18next"
import GoalSettings from "../components/goals/GoalSettings"
import PageTemplate from "./PageTemplate"

const GoalSettingPage = () => {

    const {t } = useTranslation("translation");

    return (
        <PageTemplate pageTitle={t("goals.title")} isAuthRequired={true}>
            <GoalSettings />
        </PageTemplate>
    )
}

export default GoalSettingPage