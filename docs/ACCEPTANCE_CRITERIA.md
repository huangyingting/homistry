# Acceptance Criteria

## AC-1: Zero Dummy Data & Authentic Assets
1. Fresh database migration creates all schema tables with **0 pre-seeded users**, **0 fake builds**, and **0 dummy records**.
2. All brand logos (`/site/brand/*.svg`), Ridgeline chapter stills (`/site/ridgeline/stills/*.webp`), photoreal comparison renders (`/site/ridgeline/pr/*.jpg`), guide SVGs (`/site/guides/corbel-house-ground-floor.svg`), fonts (`/site/ridgeline/fonts/*.woff2`), and the CC BY-SA 4.0 Southern Farmhouse sample (`public/demos/southern-farmhouse/{metadata.json,plan.json,page-1.png,page-2.png}`) are served from the original mirrored assets.

## AC-2: Invite-Only Registration, Roles, Revocation & Audit Logging
1. Attempting to register a new account on `/signup` or via `/api/commerce/auth/*` / `/api/auth/register` **without** a valid invitation code fails with `HTTP 400/403` and a clear error message.
2. When `User.count() === 0`, `/signup` offers a one-time **Bootstrap Admin Invitation** generator (`POST /api/admin/bootstrap-invite`) that creates a single-use `ADMIN` invitation code; once redeemed, bootstrap is permanently disabled.
3. Single-use invitation codes (`maxUses = 1`) transition to `status = "USED"` immediately upon registration and cannot be reused by a second user.
4. Expired invitation codes (`expiresAt <= now()`) and revoked invitation codes (`status = "REVOKED"`) are rejected during registration.
5. An `ADMIN` user can create new invitation codes (specifying `role`, `maxUses`, `expiresAt`, optional `boundEmail`, and `note`), revoke pending invitation codes, change user roles (`ADMIN`, `BUILDER`, `AGENT`, `USER`), and revoke user accounts from `/admin`.
6. Revoking a user account (`status = "REVOKED"`) immediately invalidates their session (`GET /api/commerce/session` returns unauthenticated/revoked and protected routes deny access).
7. Every invitation creation, redemption, revocation, login, role change, user revocation, draft upload, build creation, and share link action writes a persistent record to `AuditLog` visible in `/admin`.

## AC-3: Public Pages, Interactive Landing Stage & Guides
1. `/` renders the 9-chapter Ridgeline experience (`00 Home`–`08 Yours`), interactive Photoreal A/B comparison slider (`#tagA` / `#tagB` + `Living room` / `Kitchen` / `Front of house`), feature cards (`08.1`–`08.4`), currency-aware pricing (`USD` / `AUD` / `EUR`), and FAQ accordions.
2. `/features` and all 8 feature sub-pages (`/features/walkthrough`, `/features/exterior-finishes`, `/features/kitchens-and-cabinetry`, `/features/furniture`, `/features/electrical-plans`, `/features/photoreal-renders`, `/features/sun-study`, `/features/sharing`) render complete feature breakdowns and navigation.
3. `/pricing` switches prices accurately between `USD` (`US$19.99/mo`, `US$99/yr`), `AUD` (`A$27.99/mo`, `A$149/yr`), and `EUR` (`€19.99/mo`, `€99/yr`).
4. `/guides/choosing-cladding-for-a-new-build` allows interactive selection of upper cladding, lower cladding, roof type, and 5 architectural presets, updating the live house visualization and pros/cons details.
5. `/guides/how-to-read-a-floor-plan` allows interactive selection of floor plan layers (`Doors`, `Windows`, `Dimensions`, `Stairs`, `Kitchen & wet areas`, `North arrow`) on the Corbel House drawing.

## AC-4: Floor Plan Upload, Review & 2D/3D Studio
1. Uploading an unsupported file (e.g., `.txt`) on `/build/new` displays `"<filename> is not a PNG, JPEG, WebP, SVG or PDF file."` and returns `HTTP 400`.
2. Uploading a valid floor plan image (`page-1.png`) on `/build/new` creates a `Draft` (`HTTP 201`) and navigates to `/build/review?draft=<id>`, where the user can inspect the sheet, adjust zoom, enter optional house width/length in `Metres` or `Feet`, select currency, and confirm the build to open `/build?id=<buildId>`.
3. `/demo/try` and `/build` provide the full interactive Studio:
   - Left rail tabs: `Home`, `Furnish`, `Decorate`, `Edit`, `Settings`.
   - Storey switcher: `Whole house`, `Upper`, `Ground`.
   - View & dock controls: `Walk through` / `Leave walk`, `Roof`, `Room names`, `Plan drawing`, `3D` / `Plan` / `Split` / `Measure`.
   - Furnish catalog with true-scale items that can be added, rotated, duplicated, resized, and removed.
   - Decorate material & colour picker for `Floors`, `Walls`, `Outside`, and `Roof`.
   - Edit structural tools (`Select`, `Add wall`, `Add door`, `Add window`, `Add railing`).
   - Classic / Advanced tools: Smart Electrical planner (with printable schedule), Site Plan & Sun Study (time-of-day solar angle), Photoreal Render generator, and Version history.
4. Creating a share link for a build allows unauthenticated viewing at `/share/[token]`; revoking the share link or visiting `/share/nonexistent-token` displays `"This share link is unavailable. The owner may have stopped sharing."`.

## AC-5: Responsive Layout & Production Readiness
1. Desktop (`1440×900`), Tablet (`768×1024`), and Mobile (`375×812`) viewports render cleanly without horizontal overflow, with a functional mobile `<details data-site-menu>` navigation drawer.
2. Both `prisma/schema.prisma` (SQLite) and `prisma/schema.postgresql.prisma` (PostgreSQL) validate cleanly (`npx prisma validate`), `npm run build` succeeds with zero TypeScript/build errors, and all Playwright E2E tests pass.
