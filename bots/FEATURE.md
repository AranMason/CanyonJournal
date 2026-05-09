

# [Tech] Unify canyon tables in EditCanyons and SettingsCanyonsTab

- `EditCanyons` (admin) and `SettingsCanyonsTab` (user settings) both render a canyon table with Name, Grade, Region, Type columns
- They differ in one column: admin has "Verified", settings has "Descents"
- Could share a base canyon table component with optional column slots

# [Priority] We should be able to report issues with a canyon on the Canyon Page

- Dropdown for common issues, like 'Incorrect Rating', or 'Broken Link', combined with a free text
- In a modal pop-up
- Add to the admin only area to review, mark a report as reviewed, rejected or tbd - And allow us to edit the canyon in question, this will likely be seperated by Tabs
- We want an report state style flag (could be an enum flag, with different states) and Admin notes as well for documentation. As well as a date reviewed, and who reviewed it.
- By default we shouldn't show resolved reports, but we should be able to still discover them if need be.
- Could be a mailto: link initially, with a admin panel changes as a seperate feature work


# [Low Priority] Import from Rope Wiki data

- See ropewiki_*.csv files
- Want a SQL script to create the data in the DB
- This is a one-time sync

# [Low] Add colour picker support for ropes, so we can visualize the colour of them in the UI

# [Low] Add support for 'splitting' a rope

- Sometimes in a canyon your rope will be damaged, and we will want to be able to split it into smaller pieces 
- These pieces might sum to less than the original rope (IE: 2x30m rope from a 70m rope)
- I want to be able to track the history of a rope, so if a rope is cut I can see it's history when it was still a full rope.


# [Medium] Add Localization

# [Medium] Admin Audit Trails for Canyons

**Implemented:** "Add Canyon" button on Admin Panel opens existing `AddCanyonModal`. Admin-created canyons are auto-verified (`IsVerified=1`).

**Still pending (future work):**
- CSV import option (out of scope for now)
- Date added / UserId audit fields on Canyon creation
- Last updated audit field


# [Medium] Fully suppprt deleting canyons
- Mark IsDeleted as true
- Should still be able to access the canyon page
- Deleted canyons shouldn't be included in the Canyon List page, or selectable for creating Journal Entries for.
- Deleted Canyons should be marked as such
- This same logic should also be extended to users custom canyons
  - These user delete ones should be hidden on the user page, but still discoverable via a filter toggle such as [ ] Show Retired
  - Users we should use terms like retired, rather than deleted. We should also include a tooltip for what this means to the user.


# [Medium] Set the page title based on the users current page viewed

# [Medium] Improve dashboard overview

# [Medium] Make countries data driven
- Stored in data
- 
- Each will be stored against a continent, so similar regions can be displayed next to each other.
- When the user is creating a new Canyon we should
  - Display thier 5 most popular regions at the top
  - These regions should still show up in there respective category
- Each region 'group' should be alphabetical based on the group name, and items within it should also be alphabetical
- Each item should have an 'icon', 'display name key' and 'region'