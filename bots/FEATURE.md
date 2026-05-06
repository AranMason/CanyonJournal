# 1) Add Canyons to the Search option that the user has already visited

- This is for the Record Descent Page primarily initially, with scope to add these to the Canyon List Page as well.
- We should treat each unique URL as it's own entry.
- The Unique descents should also be updated to reflect this change
- We should add some basic checks, to normalize URLs so that two similar URLs are treated as the same
- CanyonId should be preferred, but if possible we should try defencively protect against duplication from custom canyons

# 2) We should be able to report issues with a canyon on the Canyon Page

- Dropdown for common issues, like 'Incorrect Rating', or 'Broken Link', combined with a free text
- In a modal pop-up
- Add to the admin only area to review, mark a report as reviewed, rejected or tbd - And allow us to edit the canyon in question, this will likely be seperated by Tabs
- We want an report state style flag (could be an enum flag, with different states) and Admin notes as well for documentation. As well as a date reviewed, and who reviewed it.
- By default we shouldn't show resolved reports, but we should be able to still discover them if need be.

# 3) I want to be able to easily search and find the appropriate Canyon in the admin area

- Either by Name, Region, or by IsVerified based filtering
- Lets lean local client side for now for filtering, given the smaller data sizes. Can revisit in the future.
- We do already have a local client cache in CanyonDataStore, we should try leverage that pattern more.

# 4) Import from Rope Wiki data

- See ropewiki_*.csv files
- Want a SQL script to create the data in the DB
- This is a one-time sync
