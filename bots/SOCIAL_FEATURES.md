# Social Features — Proposals

CanyonJournal is currently fully personal/private. This document outlines proposed social features grouped by scope and complexity.

---

## Tier 1 — Light social (low complexity, high value)

### 1. Public trip reports
- Users can optionally mark a descent record as **public**
- Public records appear on the canyon's detail page (alongside verified data)
- Shows: date, team size, water level, trip rating, comments — no gear or private data
- Canyoneers can see real-world conditions for a canyon before descending it
- **DB change:** `IsPublic BIT NOT NULL DEFAULT 0` on `CanyonRecords`

### 2. Canyon conditions feed
- A shared feed of recent **public** records for a canyon, filterable by date range
- Canyoneers rely heavily on up-to-date condition reports — this is the #1 community utility
- Could replace or augment the current "Trip History" section on canyon pages

### 3. Verified canyon ratings / reviews
- Users can rate a verified canyon (1–5 stars + optional short comment)
- Aggregate rating shown on the canyon directory and detail page
- Separate from personal trip rating — this is a review of the canyon itself, not the trip

---

## Tier 2 — Community features (medium complexity)

### 4. User profiles
- Public profile page: display name, avatar (from Auth0), total descents, unique canyons, countries, recent public trips
- Foundation for all other social features
- **DB change:** optional `DisplayName`, `Bio` on `Users` table

### 5. Friends / following
- Users can follow other users
- A social feed shows followed users' recent public descent records
- Requires user profiles (feature 4) as a prerequisite

### 6. Team / group tracking
- Tag teammates (other CanyonJournal users) on a descent record
- The record appears in all tagged users' journals as a read-only linked copy
- Solves the friction of everyone manually logging the same trip
- **DB change:** `CanyonRecordTeammates` junction table (CanyonRecordId, UserId)

### 7. Shared gear lists
- Share a gear/rope loadout from a specific trip with teammates via link
- Useful for planning repeat descents with the same group

---

## Tier 3 — Community-driven content (higher complexity)

### 8. Canyon edit suggestions
- Users can suggest edits to verified canyon data (grade, type, notes, links)
- Admin reviews and approves or rejects changes via the admin panel
- Community-sourced accuracy improvement over time

### 9. Beta / hazard notes
- Users can add short, time-stamped **beta notes** to a verified canyon (e.g. "access road closed", "new fixed anchor at R3")
- Different from a trip report — short, factual, time-sensitive
- Admin or trusted users can pin or remove notes

### 10. Canyon wishlists
- Users mark canyons as "want to do" (separate from favourites)
- Visible on public user profiles
- If the user views a canyon someone has done, they can see who has done it

---

## Recommended starting point

**Feature 1 — Public trip reports** is the highest-value, lowest-risk entry point:
- Single `IsPublic BIT` flag on `CanyonRecords`
- No new user relationship model needed
- Surfaces real conditions data on canyon pages immediately
- Natural foundation for the conditions feed (feature 2)

# Record the data source against the verified Canyon

- Use the 'source name' instead of verified for tags
- Sources will potentially have thier own Icons
- 