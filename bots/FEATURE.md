
---
When a feature is completed, the entry and text should be removed. If there is only a partial implementation, then the title and description should be updated to reflect that.
When asked to review, you should provide outline, priority and ease of implementation overview.
---

# [Brand] Get a new Logo
Need a Logo that represents 'Hand Linne', something that ideally invokes some mixture of Ropes, Writing and Deep Water/Waterfalls in a minimalist way. 

External Clients that will need to be updated are:
- Update Auth0
- Update Facebook
- Add a Logo to Google

# [Tech] Unify canyon tables display behaviour in EditCanyons and SettingsCanyonsTab etc

- `EditCanyons` (admin) and `SettingsCanyonsTab` (user settings) both render a canyon table with Name, Grade, Region, Type columns
- They differ in one column: admin has "Verified", settings has "Descents"
- Could share a base canyon table component with optional column slots

# [Low] Add colour picker support for ropes, so we can visualize the colour of them in the UI

# [Low] Add support for 'splitting' a rope

- Sometimes in a canyon your rope will be damaged, and we will want to be able to split it into smaller pieces 
- These pieces might sum to less than the original rope (IE: 2x30m rope from a 70m rope)
- I want to be able to track the history of a rope, so if a rope is cut I can see it's history when it was still a full rope.


# [Medium] Admin Audit Trails for Canyons

- Last updated date, date created, who made the last change etc


# [Medium] Fully support deleting canyons
- Mark IsDeleted as true
- Should still be able to access the canyon page
- Deleted canyons shouldn't be included in the Canyon List page, or selectable for creating Journal Entries for.
- Deleted Canyons should be marked as such
- This same logic should also be extended to users custom canyons
  - These user delete ones should be hidden on the user page, but still discoverable via a filter toggle such as [ ] Show Retired
  - Users we should use terms like retired, rather than deleted. We should also include a tooltip for what this means to the user.

# [Low] Add ability to enable to disable data sources personally
- User settings — allow a user to disable a source (e.g. CanyonLog) so canyons from that source don't appear in their lists
- Low priority until there are more data sources

# [Low] Support Trips that span multiple days

# [Goals] Add Support for the following Goals
- [ ] When Logging Unique Canyons, group same canyon together in audit trip list (both summary and Goal Page)
- **Implemented**: Region rules, distinct regions, all-in-region, canyon type filter, min rating rules, first-time rule, rolling time window, tag rules, exclusion rules — all via GoalRules table.

# [Goals] We should only load Completed Goals when they're requested to be shown in the settings
- **Partially done**: Active vs Completed goals are loaded separately. The completed goals list is still fetched eagerly on load via `?includeCompleted=true`. Defer this fetch until the user clicks "Show Completed".

# [Marketting] Include the fact that you can set Goals - Personal or Professional

# [Goals] Default Goals
- New User should get a 'Descend 5 Canyons Goal' to teach them the system.
- Default Goal Packs for various standards (IE: UKCA) - Don't know what other ones there are TBH

# [General] Add a Change Log
- Available from the corner, pop-up when someone logs in and something has changed.

# [General] New User Pop-up with a Application Overview
- Also potentially starting new Users with a Goal of 'Do X Canyons'