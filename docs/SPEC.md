# Technical Specification (SPEC)

## 1. Visual Design System & Tokens

### 1.1 Color Palette (`:root` CSS Variables)
Replicated directly from `homistry.ai` stylesheets:
```css
:root {
  --hm-navy: #0F2340;
  --hm-navy-deep: #0B1C33;
  --hm-sky: #4A9FE0;
  --hm-blue: #2F80D1;
  --hm-blue-button: #2A72BC;
  --hm-blue-dark: #1B5FA3;
  --hm-blue-tint: #E4EEF9;
  --hm-panel: #E8F1FB;
  --hm-page: #F3F6FA;
  --hm-card: #FFFFFF;
  --hm-card-glass: rgba(255, 255, 255, 0.9);
  --hm-border: #E0E9F4;
  --hm-border-blue: #D3E3F5;
  --hm-border-dashed: #C3D6EC;
  --hm-text: #0F2340;
  --hm-body: #3D4757;
  --hm-secondary: #4D5868;
  --hm-muted: #6B7482;
  --hm-strike: #8A93A0;
  --hm-success-bg: #E3F3E8;
  --hm-success: #1F6B3A;
  --hm-assumed: #8A4B12;
  --hm-assumed-bg: #FDF1E3;
  --hm-error: #A23B2A;
  --hm-error-bg: #FCECE8;
  --hm-radius-button: 14px;
  --hm-radius-card: 22px;
  --hm-radius-panel: 28px;
  --hm-shadow-card: 0 24px 60px rgba(15, 35, 64, 0.08), 0 4px 14px rgba(15, 35, 64, 0.04);
  --hm-shadow-soft: 0 12px 32px rgba(15, 35, 64, 0.06);
  --hm-shadow-button: 0 10px 22px rgba(27, 95, 163, 0.28);
}
```
And for the Ridgeline v2 Architectural Home Stage (`.rh`):
```css
.rh {
  --paper: #ECEEE9;
  --paper-2: #E2E5DE;
  --ink: #111416;
  --ink-2: #52585E;
  --ink-3: #878D93;
  --accent: #E0245E;
}
```

### 1.2 Typography
- **Display**: `"Archivo"`, `"Outfit Variable"`, `"Outfit"`, system-ui
- **Body**: `"IBM Plex Sans"`, system-ui, -apple-system, sans-serif
- **Monospace**: `"JetBrains Mono"`, `"IBM Plex Mono"`, monospace
- Self-hosted font files served from `/site/ridgeline/fonts/archivo-wdth.woff2` and `/site/ridgeline/fonts/jetbrains-mono-{400,500,600}.woff2`.

---

## 2. Route & Component Specifications

### 2.1 Public Header & Footer (`SiteChrome`)
- **Skip link**: `<a href="#main" class="site_skip">Skip to content</a>`
- **Brand**: `/site/brand/homistry-mark.svg` + `/site/brand/homistry-wordmark.svg`
- **Desktop Nav**: `Features` (`/features`), `Pricing` (`/pricing`), `Guides` (`/guides`), `Live example` (`/demo`).
- **Right Actions**:
  - Unauthenticated: `Sign in` (`/signup`), `Create free account →` (`/signup`).
  - Authenticated: `My account` (`/account`), `Admin` (`/admin`, if `role === "ADMIN"`), `Upload your plans →` (`/build/new`).
- **Mobile Nav (`<= 900px`)**: `<details data-site-menu>` dropdown containing all navigation links and actions.

### 2.2 Invite-Only Registration & Auth Flow (`/signup`, `/admin`)
1. **Invitation Validation**:
   - Every new account registration requires an `inviteCode` string.
   - Invitation codes have the format `HM-XXXX-XXXX` (or custom code), a target `role` (`USER`, `BUILDER`, `AGENT`, `ADMIN`), `maxUses` (default `1` for single-use), `usedCount`, `expiresAt`, optional `boundEmail`, and `status` (`ACTIVE`, `USED`, `REVOKED`, `EXPIRED`).
2. **Bootstrap Admin Provisioning**:
   - No dummy or pre-seeded user accounts exist in the database.
   - When `User.count() === 0`, the `/signup` page displays a **First-Time System Bootstrap** banner allowing the operator to generate or use the initial single-use `ADMIN` invitation code (`POST /api/admin/bootstrap-invite`) to register the first administrator account. Once the first user is registered, bootstrap mode permanently locks.
3. **Authentication**:
   - Supports Email + 6-digit verification code (`/api/commerce/auth/code-request` and `/api/commerce/auth/code-verify`) as well as Password sign-in (`/api/auth/callback/credentials`) and Auth.js session cookies.
   - Revoked users (`status === "REVOKED"` or `revokedAt !== null`) are rejected at sign-in (`403 Account access has been revoked`) and any existing session is immediately invalidated on API/page checks.

### 2.3 Floor Plan Upload & Review (`/build/new`, `/build/review`)
1. **`POST /api/commerce/drafts`**:
   - Accepts `multipart/form-data` with 1–4 files (`file` or `files`).
   - Validates extension and MIME type against `PNG`, `JPEG`, `WebP`, `SVG`, `PDF` and max 10 MB total.
   - Invalid files return `HTTP 400` with `{"error": "<filename> is not a PNG, JPEG, WebP, SVG or PDF file."}`.
   - Valid uploads store `Draft` and `DraftFile` records and return `HTTP 201` with `{ id, createdAt, expiresAt, files, pageCount, pages, state: "open", limits }`.
2. **`/build/review?draft=<id>`**:
   - Displays sheet previews (`/api/commerce/drafts/[id]/pages/[index].png`), zoom in/out (`50%`–`200%`), optional house width and length with `Metres` / `Feet` toggle, currency selector (`AUD`, `USD`, `EUR`, `GBP`), and **Build 3D Home** checkout confirmation (`POST /api/commerce/drafts/[id]/checkout`).
   - Confirming the draft generates a persistent `HomeBuild` with an initial `HomeVersion` containing 2D/3D floor plan geometry and redirects to `/build?id=<buildId>`.

### 2.4 Interactive 2D/3D Studio (`/demo/try`, `/build`, `/share/[token]`)
1. **Data Structure (`PlanData`)**:
   - Uses the exact `plan.json` schema (`version`, `floors[]` with `id`, `name`, `level`, `floorHeight`, `ceilingHeight`, `walls[]`, `openings[]`, `rooms[]`, `stairs[]`, `roofs[]`, `fixtures[]`, `electrical[]`, `sitePlan`).
   - `/demo/try` loads `/demos/southern-farmhouse/plan.json` in client state (persisted to `localStorage` for demo sandbox edits, resettable at any time).
   - `/build?id=<id>` loads and persists to `/api/live/[id]/design`, `/api/live/[id]/pieces`, `/api/live/[id]/settings`, `/api/live/[id]/smart-electrical`, `/api/live/[id]/site-plan`, `/api/live/[id]/frame-images`, and `/api/live/[id]/share`.
2. **Studio Views & Modes**:
   - **3D Orbit View**: Interactive Three.js WebGL scene (with automatic 2D/Isometric Canvas/SVG fallback if WebGL is unavailable) supporting orbit, pan, zoom, room labels, roof toggle, plan drawing overlay on slab, and dynamic sun directional lighting (`6:00 am` to `8:00 pm` + `Night` mode).
   - **Walk-Through Mode**: First-person camera at `1.65 m` eye height with keyboard (`WASD`/Arrows) and on-screen directional buttons (`↑`, `↓`, `↶`, `↷`), room/area HUD indicator, storey jumper, and `Leave walk`.
   - **2D Plan / Split / Measure View**: Crisp architectural SVG floor plan showing walls, doors, windows, room names, dimensions, placed furniture, electrical symbols, and interactive distance measurement tool.
   - **Left Rail Panels**: `Home`, `Furnish`, `Decorate`, `Edit`, `Settings`, plus **Classic Studio** (`Electrical`, `Sun study`, `Photoreal`, `Versions`, `Share`).
