import { GoalRuleRow } from "../goals";
import { GoalRule, GoalRuleType } from "../../src/types/Goal";
import { sql } from "../middleware/sqlserver";
import { CANYON_KEY_PREFIX, USERCANYON_KEY_PREFIX } from "../../src/utils/canyonKey";

type GoalLogicLookup = {
    [key in GoalRuleType]: {
        buildRule: (rule: GoalRule) => string[]
    };
};

export enum GoalRuleField {
    // Descent Info
    DescentId = "[DescentId]",
    DescentDate = "[DescentDate]",
    Comments = "[Comments]",
    WaterLevel = "[WaterLevel]",
    TripRating = "[TripRating]",
    // Canyon Info
    IsUserCanyon = "[IsUserCanyon]",
    Id = "[Id]",
    Key = "[Key]",
    CanyonId = "[CanyonId]",
    UserCanyonId = "[UserCanyonId]",
    Name = "[Name]",
    TopoUrl = "[TopoUrl]",
    CanyonType = "[CanyonType]",
    IsFavourite = "[IsFavourite]",
    IsVerified = "[IsVerified]",
    IsDeleted = "[IsDeleted]",
    DetailsUrl = "[DetailsUrl]",
    // Region Info
    RegionId = "[RegionId]",
    RegionSlug = "[RegionSlug]",
    RegionSymbol = "[RegionSymbol]",
    // Rating Info
    AquaticRating = "[AquaticRating]",
    VerticalRating = "[VerticalRating]",
    CommitmentRating = "[CommitmentRating]",
    StarRating = "[StarRating]",
    IsUnrated = "[IsUnrated]",
    // Source Info
    SourceName = "[SourceName]",
    SourceLogoUrl = "[SourceLogoUrl]",
    SourceWebsiteUrl = "[SourceWebsiteUrl]",
    SourceId = "[SourceId]"
}

type AggregationFields = {
    outputField: string;
    inputFields: GoalRuleField[];
    clause: string;
};

export class GoalBuilder {

    private baseQueryTable: string;
    private bindings: { name: string; type: any; value: any }[] = [];
    private conditionClauses: string[] = [];
    private userBindingName: string = 'userId';

    private buildBaseQuery = (): string => {
        return `WITH ${this.baseQueryTable} AS (
              SELECT 
                0 As ${GoalRuleField.IsUserCanyon},
                CONCAT('${CANYON_KEY_PREFIX}', c.Id) as ${GoalRuleField.Key},
                c.Id as ${GoalRuleField.Id},
                c.Id as ${GoalRuleField.CanyonId},
                NULL as ${GoalRuleField.UserCanyonId},
                c.Name as ${GoalRuleField.Name},
                c.Url as ${GoalRuleField.TopoUrl},
                CONCAT('/canyons/', c.Id) AS ${GoalRuleField.DetailsUrl},
                c.AquaticRating as ${GoalRuleField.AquaticRating},
                c.VerticalRating as ${GoalRuleField.VerticalRating}, 
                c.StarRating as ${GoalRuleField.StarRating},
                c.CommitmentRating as ${GoalRuleField.CommitmentRating}, 
                c.IsVerified as ${GoalRuleField.IsVerified}, 
                c.IsUnrated as ${GoalRuleField.IsUnrated}, 
                c.CanyonType as ${GoalRuleField.CanyonType}, 
                c.IsDeleted as ${GoalRuleField.IsDeleted},
                c.SourceId as ${GoalRuleField.SourceId}, 
                c.RegionId as ${GoalRuleField.RegionId},
                rgn.Symbol AS ${GoalRuleField.RegionSymbol},
                rgn.Slug AS ${GoalRuleField.RegionSlug},
                cs.DisplayName AS ${GoalRuleField.SourceName},
                cs.LogoUrl AS ${GoalRuleField.SourceLogoUrl},
                cs.WebsiteUrl AS ${GoalRuleField.SourceWebsiteUrl},
                cr.Id AS ${GoalRuleField.DescentId},
                cr.Date AS ${GoalRuleField.DescentDate},
                cr.Comments AS ${GoalRuleField.Comments},
                cr.WaterLevel AS ${GoalRuleField.WaterLevel},
                cr.TripRating AS ${GoalRuleField.TripRating},
                CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS ${GoalRuleField.IsFavourite}
              FROM Canyons c
              LEFT JOIN CanyonSources cs ON c.SourceId = cs.Id
              LEFT JOIN CanyonRecords cr ON cr.CanyonId = c.Id AND cr.UserId = @${this.userBindingName}
              LEFT JOIN CanyonFavourites cf ON cf.CanyonId = c.Id AND cf.UserId = @${this.userBindingName}
              LEFT JOIN Regions rgn ON c.RegionId = rgn.Id
              WHERE c.${GoalRuleField.IsVerified} = 1            
              
              UNION ALL
              
              SELECT 1 As ${GoalRuleField.IsUserCanyon},
                   CONCAT('${USERCANYON_KEY_PREFIX}', uc.Id) as ${GoalRuleField.Key},
                   uc.Id as ${GoalRuleField.Id},
                   NULL as ${GoalRuleField.CanyonId},
                   uc.Id as ${GoalRuleField.UserCanyonId},
                   uc.Name as ${GoalRuleField.Name}, 
                   NULL as ${GoalRuleField.TopoUrl},
                   CONCAT('/canyons/users/', uc.Id) AS ${GoalRuleField.DetailsUrl},
                   uc.AquaticRating as ${GoalRuleField.AquaticRating}, 
                   uc.VerticalRating as ${GoalRuleField.VerticalRating}, 
                   uc.StarRating as ${GoalRuleField.StarRating}, 
                   uc.CommitmentRating as ${GoalRuleField.CommitmentRating}, 
                   NULL AS ${GoalRuleField.IsVerified}, 
                   uc.IsUnrated as ${GoalRuleField.IsUnrated}, 
                   uc.CanyonType as ${GoalRuleField.CanyonType},
                   0 AS ${GoalRuleField.IsDeleted},
                   NULL AS ${GoalRuleField.SourceId},
                   uc.RegionId as ${GoalRuleField.RegionId},
                    rgn.Symbol AS ${GoalRuleField.RegionSymbol},
                    rgn.Slug AS ${GoalRuleField.RegionSlug},
                    NULL as ${GoalRuleField.SourceName},
                    NULL as ${GoalRuleField.SourceLogoUrl},
                    NULL as ${GoalRuleField.SourceWebsiteUrl},
                    cr.Id AS ${GoalRuleField.DescentId},
                    cr.Date AS ${GoalRuleField.DescentDate},
                    cr.Comments AS ${GoalRuleField.Comments},
                    cr.WaterLevel AS ${GoalRuleField.WaterLevel},
                    cr.TripRating AS ${GoalRuleField.TripRating},
                    CAST(CASE WHEN cf.Id IS NOT NULL THEN 1 ELSE 0 END AS BIT) AS ${GoalRuleField.IsFavourite}
              FROM UserCanyons uc
              LEFT JOIN CanyonRecords cr ON cr.UserCanyonId = uc.Id
              LEFT JOIN CanyonFavourites cf ON cf.UserCanyonId = uc.Id AND cf.UserId = @${this.userBindingName}
              LEFT JOIN Regions rgn ON uc.RegionId = rgn.Id
              WHERE uc.UserId = @${this.userBindingName}
          )`
    }

    public constructor(userId: number, baseQueryTable: string = "all_canyons") {
        this.bindings.push({ name: this.userBindingName, type: sql.Int, value: userId });
        this.baseQueryTable = baseQueryTable;
        this.conditionClauses = [];
    }

    /***
     * Build the final SQL query based on the select fields, where clauses, group by fields, and order by fields.
     * @param select - The fields to select in the query.
     * @param clauses - Additional where clauses to apply to the query.
     * @param groupOn - The fields to group the results by.
     * @param orderBy - The fields to order the results by.
     * @returns An object containing the final SQL query and the bindings for the parameters.
     */
    public buildQuery = (select: GoalRuleField[], clauses: string[] = [], aggregateSelect: AggregationFields[] = [], orderBy: (GoalRuleField | string)[] = []): { query: string; bindings: { name: string; type: any; value: any }[] } => {
        
        const allClauses = [...this.conditionClauses, ...clauses];
        const whereClause = allClauses.length > 0 ? `WHERE ${allClauses.map(s => `(${s})`).join(' AND ')}` : '';
        // Group by all selected fields except fields that are used as aggregate inputs.
        
        const aggregateInputFields = new Set<GoalRuleField>(
            aggregateSelect.flatMap(agg => agg.inputFields.map(field => field as GoalRuleField)
            )
        );

        if(select.some(field => aggregateInputFields.has(field))) {
            // TODO: We could probably just handle this quitely and safely. But the logic is easier this way.
            throw new Error(`Cannot select fields that are used as aggregate inputs. Selected fields: ${select.join(', ')}, Aggregate input fields: ${[...aggregateInputFields].join(', ')}`);
        }

        const selectedFields = select.map(field => `${this.baseQueryTable}.${field}`);
        const groupByClause = aggregateSelect && aggregateSelect.length > 0 && selectedFields.length > 0
            ? `GROUP BY ${selectedFields.join(', ')}`
            : '';
        const orderByClause = orderBy && orderBy.length > 0 ? `ORDER BY ${orderBy.map(field => `${this.baseQueryTable}.${field}`).join(', ')}` : '';
        
        var outputFields = [...selectedFields, ...aggregateSelect.map(agg => `${agg.clause} AS ${agg.outputField}`)].join(', ');

        if(outputFields.length === 0) {
            throw new Error(`No output fields specified. Please specify at least one field to select or aggregate.`);
        }

        const queryPartsInOrder: string[] = [this.buildBaseQuery(), `SELECT ${outputFields} FROM ${this.baseQueryTable}`, whereClause, groupByClause, orderByClause];

        var query = queryPartsInOrder.filter(part => part.trim() !== '').join(' ').trim();

        return { query, bindings: this.bindings };
    }

    private bindRuleIfCreated = (clause: string) => {
        if (clause) {
            this.conditionClauses.push(clause);
        }
    };

    public async addRegion(regionId: number[]): Promise<GoalBuilder> {
        this.conditionClauses.push(`${this.baseQueryTable}.${GoalRuleField.RegionId} IN (${regionId.join(',')})`);
        return this;
    }

    public async addStartDate(startDate: string | null, rollingDays: number | null, includeUndescended: boolean): Promise<GoalBuilder> {
        const effectiveStartDate = this.resolveStartDate(startDate, rollingDays);

        // If we don't have a start date, then bail.
        if(effectiveStartDate == null) {
            return this;
        }

        const bindingName = `startDate`;
        this.bindings.push({ name: bindingName, type: sql.DateTime, value: effectiveStartDate });

        var baseCondition = `${this.baseQueryTable}.${GoalRuleField.DescentDate} >= @${bindingName}`;
        if(includeUndescended) {
            baseCondition += ` OR ${this.baseQueryTable}.${GoalRuleField.DescentId} IS NULL`;
        }

        this.conditionClauses.push(baseCondition);
        return this;
    }

    private resolveStartDate(startDate: string | null, rollingDays: number | null): string | null {
        if (rollingDays != null) {
            const d = new Date();
            d.setDate(d.getDate() - rollingDays);
            return d.toISOString().slice(0, 10);
        }
        return startDate ?? null;
    }

    public async addRule(rule: GoalRule): Promise<GoalBuilder> {
        // Implementation for adding a where clause based on the rule
        const clauseBuilder = this.goalRuleMap[rule.RuleType];
        if (!clauseBuilder) {
            throw new Error(`Unsupported rule type: ${rule.RuleType}`)
        }

        const clauses = await clauseBuilder.buildRule(rule);

        for (let clause of clauses) {
            if (rule.IsExclusion) {
                clause = `NOT (${clause})`;
            }

            this.bindRuleIfCreated(clause);
        }

        return this;
    }

    /**
     * Build a Unique Parameter Name for a given rule and suffix. If the rule has an Id, it will be used in the parameter name, otherwise a generic name will be used.
     * @param rule 
     * @param suffix 
     * @returns 
     */
    private pn = (rule: GoalRule, suffix: string) => rule.Id ? `rp${rule.Id}_${suffix}` : `rp_${suffix}`;


    private buildContainsCondition(field: GoalRuleField, inList: any[], negate: boolean, bonusConditions: string[] = []): string {
        const condition = `${this.baseQueryTable}.${field} IN (${inList.join(',')})`;
        const allConditions = [condition, ...bonusConditions].join(' AND ');
        return negate ? `NOT (${allConditions})` : allConditions;
    }

    private buildMinRatingCondition(rule: GoalRule, field: GoalRuleField): string[] {
        const bindingName = this.pn(rule, `${rule.RuleType}_${rule.Id}`);
        this.bindings.push({ name: bindingName, type: sql.Int, value: rule.IntValue });
        return [`${this.baseQueryTable}.${field} >= @${bindingName}`, `${this.baseQueryTable}.${GoalRuleField.IsUnrated} = 0`];
    }

    private goalRuleMap: GoalLogicLookup = {
        canyon_type: {
            buildRule: (rule: GoalRule) => {
                const typeIds = (rule.IntValues ?? '').split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
                if (typeIds.length === 0) return [];
                return [this.buildContainsCondition(GoalRuleField.CanyonType, typeIds, rule.IsExclusion)];
            }
        },
        min_vertical: { buildRule: (rule: GoalRule) => this.buildMinRatingCondition(rule, GoalRuleField.VerticalRating) },
        min_aquatic: { buildRule: (rule: GoalRule) => this.buildMinRatingCondition(rule, GoalRuleField.AquaticRating) },
        min_commitment: { buildRule: (rule: GoalRule) => this.buildMinRatingCondition(rule, GoalRuleField.CommitmentRating) },
        min_star: { buildRule: (rule: GoalRule) => this.buildMinRatingCondition(rule, GoalRuleField.StarRating) },
        tag: {
            buildRule: (rule: GoalRule) => {
                const rawIds = rule.IntValues
                    ? rule.IntValues.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
                    : rule.IntValue != null ? [rule.IntValue] : [];

                const conditions: string[] = [];

                for (let ti = 0; ti < rawIds.length; ti++) {
                    const p = this.pn(rule, `tag${ti}`);
                    this.bindings.push({ name: p, type: sql.Int, value: rawIds[ti] });

                    const condition = `EXISTS (SELECT 1 FROM CanyonRecordTags crt WHERE crt.CanyonRecordId = cr.Id AND crt.TagId = @${p})`;
                    conditions.push(condition);
                }
                return conditions;
            }
        },
        first_time: {
            buildRule: (rule: GoalRule) => {
                // TODO: THIS IS MOST LIKELY BROKEN
                const condition = `NOT EXISTS (
                    SELECT 1 FROM CanyonRecords prev
                    WHERE prev.UserId = @${this.userBindingName}
                        AND (prev.Date < ${this.baseQueryTable}.${GoalRuleField.DescentDate} OR (prev.Date = ${this.baseQueryTable}.${GoalRuleField.DescentDate} AND prev.Id < ${this.baseQueryTable}.${GoalRuleField.Id}))
                        AND (
                            CASE WHEN  ${this.baseQueryTable}.${GoalRuleField.IsUserCanyon} = 1 
                            THEN 
                                prev.UserCanyonId 
                            ELSE 
                                prev.CanyonId 
                            END = ${this.baseQueryTable}.${GoalRuleField.Id}
                        )
                    )`;
                return [condition];
            }
        },
    }

}