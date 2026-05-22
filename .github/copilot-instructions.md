# Hand Linne — Copilot Instructions

Hand Linne is a canyoneering trip journal web app. Users log descents, manage custom canyon entries, track gear/ropes, and browse a verified canyon directory.

See `/bots/APP_OVERVIEW.md` for full architecture, API, and database documentation.
See `/bots/FEATURE.md` for the current feature backlog. Please update this file as you work on features, to remove actioned items. If you think of a new feature, request user permission to add that to the document.

---

## Tech Stack

- **Frontend:** React + TypeScript, Material UI, React Router DOM, Formik + Yup
- **Backend:** Express.js + TypeScript
- **Database:** SQL Server via `mssql`
- **Auth:** Auth0 via `express-openid-connect` (stateless OIDC cookie — no Passport, no express-session)

---

### Coding Strategy

- Follow existing patterns and conventions in the codebase. When in doubt, look for a similar or ask the user.
- Proactively identify code re-use opportunities. If you find yourself writing similar code to an existing function, consider refactoring into a shared helper.
- Proactively identify maintainability improvements. If you see a pattern of code that could be improved with better abstractions, error handling, or type safety, suggest and implement those improvements.
- Proactively identify componentization opportunities. If you find yourself writing similar UI code in multiple places, consider creating a reusable component.
- Keep things clean and simple. Avoid over-engineering or adding unnecessary abstractions. The goal is to write code that is easy to understand and maintain for future developers (including yourself). This includes compilation warnings — if you see a way to fix or eliminate a TypeScript warning, do it.
- If working on a complex feature, document key decisions and assumptions in code comments or in the `/bots/` documentation files, to help future developers understand the context.

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

### UI copy conventions
- Prefer **"trip"** over "descent" when referring to a canyon outing in UI labels, buttons, and messages. Reserve "descent" for technical contexts (e.g. API field names, sort labels like "Last Descent").

### Canyon sources
`SourceId` values are hardcoded in the frontend for source-specific logic:
- `1` = **CanyonJournal** (own curated data)
- `2` = **CanyonLog** (`canyonlog.org`)

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

- `index.html` — Landing page with features and call-to-action linking to `https://app.handlinne.co.uk`
- `privacy.html` — Privacy statement
- `contact.html` — Contact page
- `styles.css` — Standalone styles (no framework)

> Do not confuse `/docs/` with `/public/` — `/public/` is the CRA template folder for the React SPA app shell.
