# CanyonJournal — Application Overview

CanyonJournal is a web application for canyoneers to log, track, and review their canyon descents. Users can maintain a personal journal of trips, manage custom canyon entries, manage their gear inventory, tag their trips, and browse a verified canyon directory.

## What we are not
- Canyon Discoverability
- Public recent descent records

This is for platforms like CanyonLog and RopeWiki, to which we will defer to for information about a Canyon Topography, Conditions and more

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (TypeScript), Material UI, React Router DOM, Formik + Yup |
| Backend | Express.js (TypeScript) |
| Authentication | Auth0 via `express-openid-connect` (stateless OIDC cookie) |
| Database | SQL Server (`mssql`), pooled connection |
| Hosting | Heroku |
| Security | Helmet (CSP), `express-rate-limit` (1000 req/min), `compression` |

---

## Directory Structure

```
/
├── index.ts              # Express entry point — server setup, Auth0 config, auth routes
├── routes/               # API route handlers (all mounted under /api/, all auth-protected)
│   ├── index.ts          # Aggregates all routers
│   ├── user.ts           # Current user info
│   ├── dashboard.ts      # Dashboard widget data
│   ├── canyons.ts        # Verified canyon directory CRUD
│   ├── userCanyons.ts    # User-created custom canyon CRUD
│   ├── record.ts         # Canyon descent records CRUD (includes tag upsert logic)
│   ├── gear.ts           # Gear and rope inventory CRUD
│   ├── favourites.ts     # Canyon favourites toggle
│   ├── regions.ts        # Hierarchical region tree CRUD (admin-gated writes)
│   ├── tags.ts           # User tags CRUD (GET with stats, PATCH rename, DELETE)
│   ├── helpers/
│   │   ├── user.helper.ts       # getUserIdByRequest, isAdmin utilities
│   │   ├── dashboard.helper.ts  # Dashboard stats queries
│   │   └── urlHelper.ts         # canyonDetailUrl — single source of truth for internal canyon routes
│   └── middleware/
│       └── sqlserver.ts         # SQL Server connection pool (getPool, sql)
├── src/                  # React frontend
│   ├── pages/            # Page-level components
│   ├── components/       # Shared/reusable components
│   │   ├── settings/     # SettingsCanyonsTab, SettingsGearTab, SettingsTagsTab
│   │   ├── admin/        # EditCanyons, EditUserCanyons, RegionsTab
│   │   ├── table/        # Shared table cell components (CanyonNameCell, CanyonTypeCell)
│   │   ├── CanyonRecordAccordion/  # Journal entry accordion
│   │   ├── FilterPanel.tsx         # Config-driven filter panel (see below)
│   │   ├── MobileAppBar.tsx        # Hamburger AppBar shown on mobile only
│   │   ├── RecordEditor.tsx        # Shared form for creating/editing descent records
│   │   ├── GearRopeSelector.tsx    # Gear and rope multi-select for record editor
│   │   ├── RegionTreeView.tsx      # Reusable MUI SimpleTreeView wrapper for region trees
│   │   ├── RegionTreePicker.tsx    # Dialog-based region picker (with prune/elevate logic)
│   │   └── IconPicker.tsx          # Generic icon-based value picker (ratings, water level)
│   ├── helpers/
│   │   ├── CanyonDataStore.ts      # Promise cache for /api/canyons
│   │   ├── EquipmentDataStore.ts   # Promise cache for /api/equipment
│   │   ├── UserCanyonDataStore.ts  # Promise cache for /api/user-canyons
│   │   ├── FavouritesDataStore.ts  # Promise cache for /api/favourites
│   │   ├── TagsDataStore.ts        # Promise cache for /api/tags
│   │   ├── RegionDataStore.ts      # Promise cache for /api/regions; resolves display names from i18n
│   │   ├── filterConfigs.ts        # Atomic FilterConfig builder functions (single source of truth)
│   │   └── EnumMapper.ts           # Display name / colour helpers for enums
│   ├── types/            # TypeScript types and enums
│   ├── utils/            # Frontend utility functions (api, canyonKey)
│   ├── locales/          # i18n translation files (en/, cy/ etc.) — regions.json keyed by slug
│   └── styles/           # Global styles (MuiTheme, breakpoints, overrides)
├── public/               # CRA app shell (index.html etc.) — NOT the marketing site
├── docs/                 # Static marketing website (GitHub Pages) — index.html, privacy.html, contact.html
├── sql/                  # Database schema setup and migration scripts
└── bots/                 # AI-facing documentation files
```

---

## API Routes

All routes are mounted under `/api/` and require the user to be authenticated. Unauthenticated requests return `401 Unauthenticated`.

| File | Method & Path | Description |
|------|--------------|-------------|
| `user.ts` | `GET /api/user` | Returns current user: `id`, `first_name`, `picture_url`, `isAdmin` |
| `dashboard.ts` | `GET /api/dashboard/:widget` | Widget data — values: `RecentDescents`, `TotalDescents`, `UniqueDescents` |
| `canyons.ts` | `GET /api/canyons` | List all verified canyons; `?withDescents=1` includes descent count and merges user-created canyons |
| `canyons.ts` | `GET /api/canyons/:id` | Single canyon by ID; supports `?withDescents=1` |
| `canyons.ts` | `GET /api/canyons/verify` | **Admin only** — list all canyons regardless of verification status |
| `canyons.ts` | `GET /api/canyons/:id/record-count` | **Admin only** — count of all records linked to a canyon |
| `canyons.ts` | `POST /api/canyons` | Add a new canyon; if admin and `id > 0`, updates and verifies existing canyon |
| `canyons.ts` | `DELETE /api/canyons/:id` | **Admin only** — delete a canyon and cascade-delete all linked records |
| `userCanyons.ts` | `GET /api/user-canyons` | List all custom canyons for the current user |
| `userCanyons.ts` | `GET /api/user-canyons/:id` | Single custom canyon by ID (must belong to user) |
| `userCanyons.ts` | `POST /api/user-canyons` | Create a new custom canyon |
| `userCanyons.ts` | `PATCH /api/user-canyons/:id` | Update a custom canyon (must belong to user) |
| `userCanyons.ts` | `DELETE /api/user-canyons/:id` | Delete a custom canyon; orphans linked journal entries (`UserCanyonId = NULL`) |
| `record.ts` | `GET /api/record` | List the user's descent records; supports `?canyon=`, `?userCanyon=`, `?max=` filters |
| `record.ts` | `GET /api/record/:id` | Single descent record by ID (must belong to user); includes `Tags` array |
| `record.ts` | `POST /api/record` | Log a new canyon descent record; accepts `TagNames: string[]` |
| `record.ts` | `PATCH /api/record` | Edit an existing descent record; accepts `TagNames: string[]` |
| `record.ts` | `DELETE /api/record/:id` | Delete a descent record |
| `gear.ts` | `GET /api/equipment` | Get all gear and ropes for the current user |
| `gear.ts` | `POST /api/equipment/gear` | Add a gear item |
| `gear.ts` | `PUT /api/equipment/gear/:id` | Edit a gear item |
| `gear.ts` | `DELETE /api/equipment/gear/:id` | Delete a gear item |
| `gear.ts` | `POST /api/equipment/rope` | Add a rope item |
| `gear.ts` | `PUT /api/equipment/rope/:id` | Edit a rope item |
| `gear.ts` | `DELETE /api/equipment/rope/:id` | Delete a rope item |
| `favourites.ts` | `GET /api/favourites` | List the user's favourited canyon IDs |
| `favourites.ts` | `POST /api/favourites` | Add a canyon to favourites |
| `favourites.ts` | `DELETE /api/favourites` | Remove a canyon from favourites |
| `tags.ts` | `GET /api/tags` | List all user tags with `UsageCount` and `LastUsed` stats |
| `tags.ts` | `PATCH /api/tags/:id` | Rename a tag (conflict-checked; 409 if name already exists) |
| `tags.ts` | `DELETE /api/tags/:id` | Delete a tag and cascade-remove from all records |
| `regions.ts` | `GET /api/regions` | Returns full nested region tree (`Id`, `ParentId`, `Slug`, `Symbol`, `SortOrder`, `Children[]`) |
| `regions.ts` | `GET /api/regions/:id` | **Admin only** — single region detail (`RegionAdmin` shape incl. `IsActive`) |
| `regions.ts` | `POST /api/regions` | **Admin only** — create a region (409 if slug exists) |
| `regions.ts` | `PUT /api/regions/:id` | **Admin only** — update a region; 400 if `parentId` would create a circular reference |
| `regions.ts` | `DELETE /api/regions/:id` | **Admin only** — delete a region; 409 if region has children or assigned canyons |
| `reports.ts` | `POST /api/reports` | Submit an issue report for a verified canyon |
| `reports.ts` | `GET /api/reports` | **Admin only** — list all reports with canyon and reporter info |
| `reports.ts` | `PATCH /api/reports/:id` | **Admin only** — update report status and/or admin notes |

### Auth Routes (on `index.ts`, outside `/api/`, handled by `express-openid-connect`)
- `GET /login` — Initiates Auth0 OAuth flow (always shows login screen via `prompt=login`)
- `GET /api/callback` — Auth0 redirect callback (custom path to match Auth0 dashboard setting)
- `GET /logout` — Clears session and redirects to Auth0 logout (`auth0Logout: true`)

> **Note:** These are Express-level routes, not React Router routes. Navigating to `/login` or `/logout` triggers an immediate server-side redirect.

---

## Local Development

### Ports

| Port | Process | Command |
|------|---------|---------|
| **8000** | Express backend (full stack) | `npm run watch:server` (`nodemon index.ts`) |
| **3000** | CRA dev server (frontend only, with HMR) | `npm run dev` (`react-scripts start`) |

### Development Workflows

**Full-stack (recommended for auth and API testing):**
```
npm run build        # Compiles React → build/, TypeScript → build/index.js
npm run watch:server # Runs Express via ts-node on port 8000
```
Visit **http://localhost:8000**.

**Frontend-only (fast UI iteration):**
```
npm run watch:server  # Express on port 8000 (API + auth)
npm run dev           # CRA dev server on port 3000 (proxied to Express)
```
Visit **http://localhost:3000**. `setupProxy.js` proxies `/api`, `/login`, and `/logout` to port 8000.

> ⚠️ **Common mistake:** Testing auth on port 3000 without `watch:server` running — `/login` and `/logout` will serve blank React pages.

### Auth0 Dashboard Settings (required)
- **Allowed Callback URLs:** `http://localhost:8000/api/callback`, `https://app.canyonjournal.co.uk/api/callback`
- **Allowed Logout URLs:** `http://localhost:8000`, `https://app.canyonjournal.co.uk`
- **Allowed Web Origins:** `http://localhost:8000`, `https://app.canyonjournal.co.uk`

### Environment Variables (`.env`)
| Variable | Description |
|---|---|
| `SESSION_SECRET` | Secret for signing the OIDC session cookie |
| `AUTH0_CLIENT_SECRET` | Auth0 application client secret |
| `AUTH0_DOMAIN` | Auth0 domain (e.g. `your-tenant.auth0.com`) |
| `AUTH0_CLIENT_ID` | Auth0 application client ID |
| `BASE_URL` | Full base URL of the app (e.g. `http://localhost:8000`) |
| `PORT` | Server port (default `8000`) |
| `DB_*` | SQL Server connection variables |

---

## Database Schema

SQL Server. Scripts are in `/sql/`. Migration files are named `YYYYMMDD_Description.sql`.

### `Users`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `Guid` | NVARCHAR(255) UNIQUE | Auth0 email or user_id |
| `FirstName` | NVARCHAR(100) | |
| `ProfilePicture` | NVARCHAR(255) | |
| `IsAdmin` | BIT | Admin flag |

### `Regions`
Hierarchical region tree replacing the old flat `Region` INT enum.

| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `ParentId` | INT NULL FK → Regions | Self-referencing; `NULL` = continent/top-level |
| `Slug` | NVARCHAR(100) UNIQUE | Kebab-case key matching `src/locales/*/regions.json` |
| `Symbol` | NVARCHAR(20) NULL | Optional flag emoji |
| `SortOrder` | INT | Controls display order within a parent |
| `IsActive` | BIT | Inactive regions are hidden from the tree |

> Display names are **not** stored in the DB — they are resolved client-side from `src/locales/{lang}/regions.json` using the `Slug` as the key. To add a new language, create the corresponding JSON file and register the namespace in `src/i18n.ts`.

### `Canyons`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `Name` | NVARCHAR(200) UNIQUE | |
| `Url` | NVARCHAR(255) | Link to external info (e.g. RopeWiki) |
| `AquaticRating` | INT | |
| `VerticalRating` | INT | |
| `CommitmentRating` | INT | |
| `StarRating` | INT | |
| `IsVerified` | BIT | Only verified canyons appear in public listings |
| `IsUnrated` | BIT | |
| `RegionId` | INT NULL FK → Regions | Replaced old `Region` INT enum |
| `CanyonType` | INT | FK to `CanyonTypeEnum` |
| `IsDeleted` | BIT | Soft delete |
| `zzz_Region_Legacy` | INT NULL | Retired column — original flat enum value kept for recovery |

### `UserCanyons`
User-created canyon entries (custom canyons not in the verified directory).

| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `UserId` | INT FK → Users | |
| `Name` | NVARCHAR(200) | |
| `Url` | NVARCHAR(255) NULL | Optional reference link |
| `RegionId` | INT NULL FK → Regions | Replaced old `Region` INT enum |
| `CanyonType` | INT NULL | FK to `CanyonTypeEnum` |
| `AquaticRating` | INT | |
| `VerticalRating` | INT | |
| `CommitmentRating` | INT | |
| `StarRating` | INT | |
| `IsUnrated` | BIT | |
| `Notes` | NVARCHAR(1000) NULL | Personal notes about the canyon |
| `Created` / `Updated` | DATETIME | |
| `zzz_Region_Legacy` | INT NULL | Retired column — original flat enum value kept for recovery |

### `CanyonRecords`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `UserId` | INT FK → Users | |
| `Date` | DATE | Cannot be in the future |
| `TeamSize` | INT | Must be ≥ 1 |
| `WaterLevel` | INT NULL | FK to `WaterLevel` enum (0=Unknown … 5=VeryHigh) |
| `TripRating` | INT NULL | Star rating for the trip (1–5) |
| `Comments` | NVARCHAR(MAX) NULL | |
| `CanyonId` | INT NULL FK → Canyons | Linked verified canyon |
| `UserCanyonId` | INT NULL FK → UserCanyons | Linked custom canyon |
| `Timestamp` | DATETIME | Auto-set on insert |

> Every record must have either `CanyonId` or `UserCanyonId` set. `Name`, `Url`, and `Region` columns no longer exist on this table — those values are derived via JOIN at query time.

### `GearItems`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `UserId` | INT FK → Users | |
| `Name` | NVARCHAR(200) | |
| `Category` | NVARCHAR(100) | |
| `Notes` | NVARCHAR(500) NULL | |
| `Created` / `Updated` | DATETIME | |

### `RopeItems`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `UserId` | INT FK → Users | |
| `Name` | NVARCHAR(200) | |
| `Diameter` | FLOAT | |
| `Length` | FLOAT | |
| `Unit` | NVARCHAR(20) | e.g. `Metres`, `Feet` |
| `Notes` | NVARCHAR(500) NULL | |
| `Created` / `Updated` | DATETIME | |

### `CanyonRecordGear` / `CanyonRecordRope`
Many-to-many join tables linking a `CanyonRecord` to the gear and ropes used on that descent.

### `Tags`
User-specific tags for categorising descent records.

| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `UserId` | INT FK → Users | |
| `Name` | NVARCHAR(100) | Unique per user |

### `CanyonRecordTags`
Junction table linking `CanyonRecords` to `Tags`.

| Column | Type | Notes |
|--------|------|-------|
| `CanyonRecordId` | INT FK → CanyonRecords | Cascade delete |
| `TagId` | INT FK → Tags | Cascade delete |

### `CanyonFavourites`
Stores which canyons a user has favourited.

| Column | Type | Notes |
|--------|------|-------|
| `UserId` | INT FK → Users | |
| `CanyonId` | INT FK → Canyons | Verified canyon only |

---

## Key Enums

> **Regions are no longer an enum.** The old `Region` INT enum has been replaced by the `Regions` table (hierarchical tree). Display names come from `src/locales/{lang}/regions.json` keyed by slug. See `RegionDataStore` and `RegionTreePicker` for usage.

### `CanyonTypeEnum`
| Value | Name | Icon | Colour |
|-------|------|------|--------|
| 0 | Unknown | — | — |
| 1 | Sports | GestureIcon | Red |
| 2 | Adventure | TerrainIcon | Default |
| 3 | Gorge Scramble | HikingIcon | Green |
| 4 | Dry | WbSunnyIcon | Dusty brown (#a0714f) |

### `WaterLevel`
| Value | Name |
|-------|------|
| 0 | Unknown |
| 1 | Very Low |
| 2 | Low |
| 3 | Medium |
| 4 | High |
| 5 | Very High |

---

## Key Conventions

### Backend
- **Auth guard:** All `/api/` routes are protected by middleware in `index.ts`. Individual routes do not re-check authentication, but must call `getUserIdByRequest(req)` to get the DB user ID.
- **`getUserIdByRequest(req)`** — from `routes/helpers/user.helper.ts`. Returns the current user's integer DB `Id`, or `undefined` if not found. Callers must handle `undefined`.
- **`isAdmin(req)`** — from the same helper. Returns `boolean`. Use to gate admin-only operations.
- **`canyonDetailUrl(canyonId?, userCanyonId?)`** — from `routes/helpers/urlHelper.ts`. Single source of truth for internal `/canyons/:id` and `/canyons/users/:id` route construction. Used in API responses as `DetailUrl`. The frontend never builds these URLs itself.
- **Session:** `express-openid-connect` uses a stateless encrypted cookie (`appSession`) — no server-side session store. `express-session` and `passport` are not used.
- **Canyon verification:** Canyons have an `IsVerified` flag. Only verified canyons appear in public listings. Admins can view/verify unverified canyons via `GET /api/canyons/verify`.
- **Verified vs custom canyons:** A `CanyonRecord` must be linked to either a verified `Canyon` (via `CanyonId`) or a user-created `UserCanyon` (via `UserCanyonId`). Freeform name-only records are not supported.
- **Tag upsert pattern:** `record.ts` contains a `upsertTags()` helper using SQL `MERGE` to insert-if-not-exists, then returns the tag ID. Frontend sends `TagNames: string[]` (not IDs) — the backend creates new tags as needed.
- **Unique canyon counting:** The dashboard's `UniqueDescents` widget prefixes IDs (`c<CanyonId>` or `u<UserCanyonId>`) to avoid collisions between the two ID spaces.
- **SQL migrations:** Named `YYYYMMDD_Description.sql` and kept in `/sql/`. Run manually against the SQL Server instance.

### Frontend
- **Canyon composite key:** The frontend uses a composite key (`canyon:123` or `usercanyon:456`) to distinguish verified vs custom canyons in shared list components. Use `parseCanyonKey` / `canyonKey` / `userCanyonKey` from `src/utils/canyonKey.ts`.
- **`DetailUrl` field:** Computed by the API on all `CanyonRecord` and `CanyonListEntry` responses. The frontend never constructs `/canyons/...` URLs itself.
- **DataStore pattern:** Module-level `var loadPromise: Promise<T> | null = null`. Uses `??=` to deduplicate concurrent calls. On error, sets `loadPromise = null` so the next call retries. `invalidate()` simply sets it to `null`. All follow `CanyonDataStore.ts` as the reference. DataStores: `CanyonDataStore`, `EquipmentDataStore`, `UserCanyonDataStore`, `FavouritesDataStore`, `TagsDataStore`, `RegionDataStore`.
- **FilterPanel:** `src/components/FilterPanel.tsx` — config-driven filter component. All filter configs are defined as atomic builder functions in `src/helpers/filterConfigs.ts` (e.g. `getCanyonNameFilterConfig()`, `getTagFilterConfig()`). The `region-tree` filter type accepts an optional `availableRegionIds` to scope the picker to regions the user has data in. Async filters (`async-multi-select`) are disabled when options are empty or loading.
- **Region display names:** Resolved client-side from `src/locales/{lang}/regions.json` keyed by `RegionSlug`. Use `GetRegionDisplayName(slug, symbol)` from `EnumMapper.ts`. Never stored in the DB.
- **`RegionTreePicker`** — `src/components/RegionTreePicker.tsx`. Dialog-based region selector. Pass `availableRegionIds` to scope the tree; the component automatically prunes unreachable branches and elevates the root past single-branch grouping ancestors. Uses `RegionTreeView` internally.
- **`RegionTreeView`** — `src/components/RegionTreeView.tsx`. Reusable `SimpleTreeView` wrapper. Accepts optional `renderActions` for per-node buttons (used by admin `RegionsTab`).
- **`CanyonTypeDisplay`** — from `src/components/CanyonTypeDisplay.tsx`. Use to render canyon type with icon and label.
- **`IconPicker`** — from `src/components/IconPicker.tsx`. Use for any integer 1–N rating UI (water level, star rating, etc.).
- **Enums:** live in `src/types/`. `CanyonTypeEnum` values: Unknown=0, Sports=1, Adventure=2, GorgeWalk=3, Dry=4. `WaterLevel` values: Unknown=0 … VeryHigh=5.
- **Display name / colour helpers:** in `src/helpers/EnumMapper.ts`.
- **Mobile layout:** On `xs`/`sm`, a `MobileAppBar` with a hamburger button is shown. The sidebar switches to `variant="temporary"` (overlay drawer). On `md+`, the permanent mini/expanded drawer is used. Content area is offset by toolbar height on mobile.
- **Bug report:** Sidebar includes a "Report a Bug" item that opens `mailto:hello@canyonjournal.co.uk` pre-filled with the user's ID and current page URL.

---

## Static Marketing Website (`/docs/`)

Served via **GitHub Pages** (configured to serve from `docs/` on `main`). Completely independent of the React SPA and Express backend — pure HTML/CSS, no build step.

- `index.html` — Landing page with features and call-to-action linking to `https://app.canyonjournal.co.uk`
- `privacy.html` — Privacy statement
- `contact.html` — Contact page (`hello@canyonjournal.co.uk`)
- `styles.css` — Standalone styles (no framework)

> Do not confuse `/docs/` with `/public/` — `/public/` is the CRA template folder for the React SPA app shell.
