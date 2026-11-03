# Implementation Plan

## Phase 1: Project Scaffolding & Dual-Database Prisma Layer
1. Initialize Next.js (App Router, TypeScript) in `/home/azadmin/homistry` while preserving `public/` (45 mirrored original assets) and `docs/` (exploration screenshots and engineering documentation).
2. Configure `.gitignore` to strictly exclude `.cred`, `.env*`, `node_modules/`, `.next/`, and SQLite `.db` files.
3. Create `prisma/schema.prisma` (SQLite for local dev) and `prisma/schema.postgresql.prisma` (PostgreSQL for production) with all 15 models (`User`, `Session`, `InvitationCode`, `VerificationCode`, `AuditLog`, `Draft`, `DraftFile`, `HomeBuild`, `HomeVersion`, `PlacedPiece`, `FrameRender`, `ShareLink`, `SupportThread`, `SupportMessage`, `RealEstateListing`).
4. Run `npx prisma migrate dev --name init` to generate the initial migration and Prisma Client with zero dummy or pre-seeded user rows.

## Phase 2: Authentication, Invite-Only Registration, RBAC, Revocation & Audit Logging
1. Implement `src/lib/prisma.ts`, `src/lib/audit.ts` (immutable `AuditLog` writer), and `src/lib/auth.ts` (Auth.js / NextAuth v5 + custom session token & cookie verification that checks `user.status === "ACTIVE"` on every request).
2. Implement Invite-Only Registration & Bootstrap Admin logic:
   - `POST /api/admin/bootstrap-invite`: Only active when `User.count() === 0`; generates the first single-use `ADMIN` invitation code so the system can be initialized without any pre-seeded user accounts.
   - `POST /api/commerce/auth/code-request` & `POST /api/commerce/auth/code-verify` + `POST /api/auth/register`: Validates invitation code (`ACTIVE`, non-expired, `usedCount < maxUses`, optional `boundEmail`), creates the user with the invitation's assigned `role`, increments `usedCount`, and writes `INVITE_REDEEMED` and `USER_REGISTERED` audit events.
3. Implement Admin Governance APIs & UI (`/admin`):
   - `GET/POST/PATCH /api/admin/invitations`: Generate single-use or multi-use expiring invitation codes, filter by status, and revoke codes.
   - `GET/PATCH /api/admin/users`: View registered users, change roles (`ADMIN`, `BUILDER`, `AGENT`, `USER`), and revoke/restore user access (immediately terminating active sessions).
   - `GET /api/admin/audit-logs`: Filterable immutable audit log explorer.

## Phase 3: Public Marketing, Feature Deep-Dives, Pricing & Interactive Guides
1. Implement global design tokens (`src/app/globals.css`) and shared `SiteHeader` / `SiteFooter` (`src/components/SiteChrome.tsx`) matching `homistry.ai`.
2. Build the Ridgeline v2 Home Page (`src/app/page.tsx` + `src/components/RidgelineHome.tsx`):
   - 9-chapter scrollytelling stage (`00 Home` through `08 Yours`) using the original `/site/ridgeline/stills/*.webp` and interactive WebGL/canvas stage.
   - Interactive Photoreal A/B comparison slider (`#tagA` / `#tagB`) and room switcher (`Living room`, `Kitchen`, `Front of house`) using `/site/ridgeline/pr/{room}-{a,b}.jpg`.
   - Feature cards (`08.1`–`08.4`), currency-aware Pricing (`09`), and 9 collapsible FAQ items (`10`).
3. Build `/features` and all 8 feature sub-pages (`/features/walkthrough`, `/features/exterior-finishes`, `/features/kitchens-and-cabinetry`, `/features/furniture`, `/features/electrical-plans`, `/features/photoreal-renders`, `/features/sun-study`, `/features/sharing`).
4. Build `/pricing` with interactive `USD` / `AUD` / `EUR` currency switching (`Monthly` and `Yearly` plans).
5. Build `/guides`, `/floor-plan-to-3d`, `/guides/rss.xml`, and the two interactive architectural tools:
   - `/guides/choosing-cladding-for-a-new-build` (interactive upper/lower cladding & roof configurator with 5 presets).
   - `/guides/how-to-read-a-floor-plan` (interactive Corbel House SVG floor plan layer reader).
6. Build `/demo`, `/realestate`, `/contact`, `/privacy`, `/terms`, and `/data-deletion`.

## Phase 4: Floor Plan Upload Wizard, 2D/3D Studio Engine & Account Workflows
1. Implement Commerce & Build Draft APIs (`/api/commerce/session`, `/api/commerce/rates`, `/api/commerce/quote`, `/api/commerce/subscribe`, `/api/commerce/drafts`, `/api/commerce/drafts/[id]`, `/api/commerce/drafts/[id]/pages/[page]`, `/api/commerce/drafts/[id]/checkout`, `/api/commerce/inbox`, `/api/commerce/contact`, `/api/commerce/account/export`).
2. Implement `/build/new` (drag-and-drop multi-file uploader with strict file validation matching `"<filename> is not a PNG, JPEG, WebP, SVG or PDF file."`) and `/build/review` (sheet preview, zoom, house width/length in `Metres`/`Feet`, currency quote, and build creation).
3. Implement the full **2D/3D Home Studio** (`src/components/studio/StudioWorkspace.tsx`) used by `/demo/try`, `/build`, and `/share/[token]`:
   - Consumes `plan.json` (Southern Farmhouse on `/demo/try`, database `HomeBuild` on `/build` and `/share/[token]`).
   - Synchronized Three.js 3D viewport + 2D Architectural SVG Plan / Split / Measure viewport.
   - Left Rail Tabs: `Home`, `Furnish` (true-scale catalog + rotate/duplicate/resize/delete gizmos), `Decorate` (18 floor/wall/outside/roof materials + colours, room vs whole-house scope), `Edit` (`Select`, `Add wall`, `Add door`, `Add window`, `Add railing`), and `Settings` (`Roof`, `Room names`, `Plan drawing`, `Night`, `Time of day` slider, `Units`, `Home settings`, `Share a view-only link`, and `Use the classic look`).
   - Classic Studio Tools: **Smart Electrical Plan** (room-by-room power/light/switch placement + printable schedule), **Site Plan & Sun Study** (block boundaries, North angle, solar shadow angle), **Photoreal Renders** (camera framing & render gallery), and **Version History**.
   - First-Person **Walk-Through Mode** (`Walk through` / `Leave walk`, eye-level camera, keyboard `WASD`/Arrows + on-screen directional pad `↑ ↓ ↶ ↷`, floor switcher).

## Phase 5: Verification, Automated Tests & Deployment Configuration
1. Write unit/integration tests and comprehensive Playwright E2E tests covering public pages, interactive guides, invite-only registration, RBAC, invitation/user revocation, audit logging, floor plan upload/review, 2D/3D studio interactions, and view-only share links.
2. Add production deployment configuration (`Dockerfile`, `docker-compose.yml` for PostgreSQL production, `.env.example`, and scripts in `package.json`).
3. Run build, typecheck, and Playwright E2E test suite against the running local server and verify all checks pass.
