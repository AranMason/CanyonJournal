import { GoalRule } from "../../src/types/Goal";
import { GoalRuleRow } from "../goals";

export const mapRowToGoalRule = (ruleType: GoalRuleRow): GoalRule => {
    return {
        Id: ruleType.Id,
        RuleType: ruleType.RuleType as GoalRule['RuleType'],
        IsExclusion: ruleType.IsExclusion,
        IntValue: ruleType.IntValue,
        IntValues: ruleType.IntValues,
    }
}
