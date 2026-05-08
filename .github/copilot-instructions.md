# CanyonJournal — Copilot Instructions

CanyonJournal is a canyoneering trip journal web app. Users log descents, manage custom canyon entries, track gear/ropes, and browse a verified canyon directory.

See `/bots/APP_OVERVIEW.md` for full architecture, API, and database documentation.
See `/bots/FEATURE.md` for the current feature backlog.

---

## Tech Stack

- **Frontend:** React + TypeScript, Material UI, React Router DOM, Formik + Yup
- **Backend:** Express.js + TypeScript
- **Database:** SQL Server via `mssql`
- **Auth:** Auth0 via `express-openid-connect` (stateless OIDC cookie — no Passport, no express-session)

---

## Key Conventions

### Backend
- All API routes live under `/routes/` and are mounted at `/api/`. All routes require authentication.
- Use `getUserIdByRequest(req)` from `routes/helpers/user.helper.ts` to get the current user's integer DB ID. Never assume it's non-null — handle `undefined`.
- Use `isAdmin(req)` from the same helper for admin-only gates.
- Use `canyonDetailUrl(canyonId?, userCanyonId?)` from `routes/helpers/urlHelper.ts` when building internal canyon page URLs. Never build `/canyons/...` paths inline.
- Every `CanyonRecord` must have either `CanyonId` (verified canyon) or `UserCanyonId` (custom canyon) set — freeform name-only records no longer exist.
- Canyon `Name`, `Url`, and `Region` are no longer columns on `CanyonRecords` — they are derived via JOIN from `Canyons` or `UserCanyons` at query time.

### Frontend
- Canyon list entries use a composite key (`canyon:123` / `usercanyon:456`) to distinguish verified vs custom. Use `parseCanyonKey`, `canyonKey`, `userCanyonKey` from `src/utils/canyonKey.ts`.
- The `DetailUrl` field on `CanyonRecord` and `CanyonListEntry` is computed by the API. The frontend never constructs `/canyons/...` URLs itself.
- Use `CanyonTypeDisplay` (from `src/components/CanyonTypeDisplay.tsx`) to render canyon type with icon and label.
- Use `IconPicker` (from `src/components/IconPicker.tsx`) for any integer 1–N rating UI (water level, star rating, etc.).
- Enums live in `src/types/`. `CanyonTypeEnum` values: Unknown=0, Sports=1, Adventure=2, GorgeWalk=3, Dry=4. `WaterLevel` values: Unknown=0 … VeryHigh=5.
- Display name / colour helpers are in `src/helpers/EnumMapper.ts`.

### Canyoneering domain notes
- **Canyoneering** is the sport of descending canyons — don't conflate with hiking or climbing.
- Ratings (Aquatic, Vertical, Commitment, Star) follow standard canyoneering grading conventions — don't assume generic meanings.
- Water level refers to the flow conditions in a canyon on the day of the descent, not a general property of the canyon.

---

## Project Structure (summary)

```
routes/          Express API handlers
  helpers/       Shared backend utilities (user, dashboard, urlHelper)
  middleware/    SQL Server pool
src/
  components/    Reusable React components
    settings/    SettingsCanyonsTab, SettingsGearTab
  pages/         Page-level components
  types/         TypeScript types and enums
  utils/         Frontend utilities (api, canyonKey, etc.)
  helpers/       Enum mappers and CanyonDataStore
public/          CRA app shell (index.html, favicon, manifest) — NOT the marketing site
docs/            Static marketing website (GitHub Pages) — index.html, privacy.html, contact.html, styles.css
sql/             Migration scripts (YYYYMMDD_Description.sql)
bots/            AI-facing documentation
```

---

## Static Marketing Website (`/docs/`)

Served via **GitHub Pages** (configured to serve from `docs/` on `main`). Completely independent of the React SPA and Express backend — pure HTML/CSS, no build step.

- `index.html` — Landing page with features and call-to-action linking to `https://app.canyonjournal.co.uk`
- `privacy.html` — Privacy statement
- `contact.html` — Contact page
- `styles.css` — Standalone styles (no framework)

> Do not confuse `/docs/` with `/public/` — `/public/` is the CRA template folder for the React SPA app shell.
