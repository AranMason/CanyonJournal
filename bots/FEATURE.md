
---
When a feature is completed, the entry and text should be removed. If there is only a partial implementation, then the title and description should be updated to reflect that.
When asked to review, you should provide outline, priority and ease of implementation overview.
---

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

# [Gear] Hide retired items
We will want a toggle to include them, and if we are filtering to Retired Items, we will also want to show them as well.

# [Gear] Add way to mass service gear
Currently it's hard to track what has, and has not been serviced recently. Would be good to be able to easily visualize what needs to be serviced

# [Gear] Highlight Gear in the Dashboard
1) Items that have been more than 6 months since last service.
2) Gear that is passed it's Retirement Date
We will want to limit it to the 'Top 5' with a 'See More' link to the general equipment page.
Users should be able to add a service on the page. But don't worry about updating the list once that service has been completed. We can add a 'Refresh' button however
The section shouldn't be visible, if there is no Gear to worry about.