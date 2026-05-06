# CanyonJournal — Application Overview

CanyonJournal is a web application for canyoneers to log, track, and review their canyon descents. Users can maintain a personal journal of trips, manage their gear inventory, and browse a verified canyon directory.

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
├── index.ts              # Express entry point — server setup, Auth0/Passport config, auth routes
├── routes/               # API route handlers (all mounted under /api/, all auth-protected)
│   ├── index.ts          # Aggregates all routers
│   ├── user.ts           # Current user info
│   ├── dashboard.ts      # Dashboard widget data
│   ├── canyons.ts        # Canyon directory CRUD
│   ├── record.ts         # Canyon descent records CRUD
│   ├── gear.ts           # Gear and rope inventory CRUD
│   ├── helpers/
│   │   ├── user.helper.ts       # getUserIdByRequest, isAdmin utilities
│   │   └── dashboard.helper.ts  # Dashboard stats queries
│   └── middleware/
│       └── sqlserver.ts         # SQL Server connection pool (getPool, sql)
├── src/                  # React frontend
│   ├── pages/            # Page-level components
│   ├── components/       # Shared/reusable components
│   ├── types/            # TypeScript types and enums
│   ├── utils/            # Frontend utility functions
│   └── styles/           # Global styles
├── public/               # Static marketing website (homepage)
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
| `canyons.ts` | `GET /api/canyons` | List all verified canyons; supports `?withDescents=1` to include user's descent count |
| `canyons.ts` | `GET /api/canyons/:id` | Single canyon by ID; supports `?withDescents=1` |
| `canyons.ts` | `GET /api/canyons/verify` | **Admin only** — list all canyons regardless of verification status |
| `canyons.ts` | `POST /api/canyons` | Add a new canyon; if admin and `id > 0`, updates and verifies existing canyon |
| `record.ts` | `POST /api/record` | Log a new canyon descent record |
| `record.ts` | `PATCH /api/record` | Edit an existing descent record |
| `record.ts` | `GET /api/record` | List the user's descent records |
| `record.ts` | `DELETE /api/record` | Delete a descent record |
| `gear.ts` | `GET /api/equipment` | Get all gear and ropes for the current user |
| `gear.ts` | `POST /api/equipment/gear` | Add a gear item |
| `gear.ts` | `PUT /api/equipment/gear/:id` | Edit a gear item |
| `gear.ts` | `DELETE /api/equipment/gear/:id` | Delete a gear item |
| `gear.ts` | `POST /api/equipment/rope` | Add a rope item |
| `gear.ts` | `PUT /api/equipment/rope/:id` | Edit a rope item |
| `gear.ts` | `DELETE /api/equipment/rope/:id` | Delete a rope item |

### Auth Routes (on `index.ts`, outside `/api/`, handled by `express-openid-connect`)
- `GET /login` — Initiates Auth0 OAuth flow (always shows login screen via `prompt=login`)
- `GET /api/callback` — Auth0 redirect callback (custom path to match Auth0 dashboard setting)
- `GET /logout` — Clears session and redirects to Auth0 logout (`auth0Logout: true`)

> **Note:** These are Express-level routes, not React Router routes. In the browser, navigating to `/login` or `/logout` triggers an immediate server-side redirect — the React SPA never renders for these paths.

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
Visit **http://localhost:8000**. `/login`, `/logout`, and all API routes are handled by Express directly.

**Frontend-only (fast UI iteration):**
```
npm run watch:server  # Express on port 8000 (API + auth)
npm run dev           # CRA dev server on port 3000 (proxied to Express)
```
Visit **http://localhost:3000**. `setupProxy.js` proxies `/api`, `/login`, and `/logout` to port 8000, so auth works correctly.

> ⚠️ **Common mistake:** Testing auth on port 3000 without `nodemon` running on 8000 — `/login` and `/logout` will be served as blank React pages because the proxy target is unavailable.

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
| `Region` | INT | FK to region enum |
| `CanyonType` | INT | FK to canyon type enum |
| `IsDeleted` | BIT | Soft delete |

### `CanyonRecords`
| Column | Type | Notes |
|--------|------|-------|
| `Id` | INT IDENTITY PK | |
| `UserId` | INT FK → Users | |
| `Name` | NVARCHAR(200) | Canyon name (freeform or from Canyons table) |
| `Date` | DATE | Cannot be in the future |
| `Url` | NVARCHAR(255) | |
| `TeamSize` | INT | Must be ≥ 1 |
| `WaterLevel` | INT NULL | |
| `Comments` | NVARCHAR(MAX) NULL | |
| `CanyonId` | INT NULL FK → Canyons | Nullable — record can be freeform |
| `Region` | INT NULL | |
| `Timestamp` | DATETIME | Auto-set on insert |

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
| `Unit` | NVARCHAR(20) | e.g. `m`, `ft` |
| `Notes` | NVARCHAR(500) NULL | |
| `Created` / `Updated` | DATETIME | |

### `CanyonRecordGear` / `CanyonRecordRope`
Many-to-many join tables linking a `CanyonRecord` to the gear and ropes used on that descent.

---

## Key Conventions

- **Auth guard:** All `/api/` routes are protected by a middleware check in `index.ts`. Individual routes do not need to re-check authentication, but should call `getUserIdByRequest(req)` to get the DB user ID.
- **`getUserIdByRequest(req)`** — from `routes/helpers/user.helper.ts`. Standard way to get the current user's integer DB `Id`. Returns `undefined` if not found (not `0` — callers must handle undefined).
- **`isAdmin(req)`** — from the same helper. Returns `boolean`. Use to gate admin-only operations.
- **Session:** `express-openid-connect` uses a stateless encrypted cookie (`appSession`) — no server-side session store. `express-session` and `passport` are not used.
- **Canyon verification:** Canyons have an `IsVerified` flag. Only verified canyons appear in public listings. Admins can view and verify unverified canyons via `GET /api/canyons/verify`.
- **Freeform vs linked records:** A `CanyonRecord` can be linked to a verified `Canyon` via `CanyonId`, or exist as a freeform entry with just a name and URL. Both are valid.
- **Unique canyon counting:** The dashboard's `UniqueDescents` widget counts `DISTINCT(COALESCE(CanyonId, Name))` — so freeform records are deduplicated by name.
- **SQL migrations:** Named `YYYYMMDD_Description.sql` and kept in `/sql/`. Run manually against the SQL Server instance.
