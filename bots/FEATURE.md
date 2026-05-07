

# We should be able to report issues with a canyon on the Canyon Page

- Dropdown for common issues, like 'Incorrect Rating', or 'Broken Link', combined with a free text
- In a modal pop-up
- Add to the admin only area to review, mark a report as reviewed, rejected or tbd - And allow us to edit the canyon in question, this will likely be seperated by Tabs
- We want an report state style flag (could be an enum flag, with different states) and Admin notes as well for documentation. As well as a date reviewed, and who reviewed it.
- By default we shouldn't show resolved reports, but we should be able to still discover them if need be.

# I want to be able to easily search and find the appropriate Canyon in the admin area

- Either by Name, Region, or by IsVerified based filtering
- Lets lean local client side for now for filtering, given the smaller data sizes. Can revisit in the future.
- We do already have a local client cache in CanyonDataStore, we should try leverage that pattern more.

# Import from Rope Wiki data

- See ropewiki_*.csv files
- Want a SQL script to create the data in the DB
- This is a one-time sync

# Add colour picker support for ropes, so we can visualize the colour of them in the UI

# Add support for 'splitting' a rope

- Sometimes in a canyon your rope will be damaged, and we will want to be able to split it into smaller pieces 
- These pieces might sum to less than the original rope (IE: 2x30m rope from a 70m rope)
- I want to be able to track the history of a rope, so if a rope is cut I can see it's history when it was still a full rope.

# Add the ability to favourite canyons

# Add the ability to rate the trip out of 5 stars

# Use the iconography for Water Level in trip recording

- This could also be used for the 5 star rating, so should be a re-usable component
- X X X X X - Five Icons X, and you select how far across you want to rate it, rather than a dropdown

# When recording a descent from a canyon page (user or official) we should auto populate the canyon field

