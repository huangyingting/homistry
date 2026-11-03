# Engineering Task Backlog

## Epic 1: Reverse-Engineering & Documentation
- [x] **TASK-101**: Explore `https://homistry.ai/` across all public and authenticated routes with Playwright.
- [x] **TASK-102**: Execute interactive scenarios (Studio tabs/walkthrough, floor plan upload/review & invalid file error, account/currency/share error, interactive guides, tablet & mobile responsive viewports).
- [x] **TASK-103**: Mirror all 45 original website assets (`public/site/*`, `public/demos/southern-farmhouse/*`, icons, fonts, RSS/sitemap).
- [x] **TASK-104**: Author Exploration Coverage Report, ADR, PRD, Technical Spec, Architecture & Data Model, Implementation Plan, Task Backlog, Acceptance Criteria, and Feature-Parity Matrix.

## Epic 2: Database, Auth, Invite-Only Governance, RBAC & Audit Logging
- [ ] **TASK-201**: Scaffold Next.js App Router + TypeScript + Prisma with SQLite (`prisma/schema.prisma`) and PostgreSQL (`prisma/schema.postgresql.prisma`) schemas and run initial migration with zero dummy data.
- [ ] **TASK-202**: Implement `AuditLog` service recording all authentication, invitation, role, revocation, build, share, and data-governance events.
- [ ] **TASK-203**: Implement Auth.js / NextAuth v5 + Homistry `/api/commerce/auth/*` and `/api/commerce/session` endpoints with active-status enforcement (`status === "ACTIVE"`).
- [ ] **TASK-204**: Implement Invite-Only Registration (single-use/bounded-use codes, expiration check, optional email binding, role assignment, and one-time initial Admin Bootstrap when `User.count() === 0`).
- [ ] **TASK-205**: Implement `/admin` Governance Console and `/api/admin/{invitations,users,audit-logs}` for creating/revoking invitation codes, changing user roles, revoking user accounts, and inspecting audit logs.

## Epic 3: Public Marketing, Features, Pricing & Interactive Guides
- [ ] **TASK-301**: Implement `SiteChrome` (Header, Mobile `<details data-site-menu>`, Footer) and global CSS design tokens (`--hm-*` and `.rh` Ridgeline tokens).
- [ ] **TASK-302**: Implement `/` (Ridgeline 9-chapter scrollytelling stage, Photoreal A/B slider, room switcher, feature cards, currency-aware pricing, FAQ accordions).
- [ ] **TASK-303**: Implement `/features` and all 8 feature sub-pages (`walkthrough`, `exterior-finishes`, `kitchens-and-cabinetry`, `furniture`, `electrical-plans`, `photoreal-renders`, `sun-study`, `sharing`).
- [ ] **TASK-304**: Implement `/pricing` with live currency switching (`USD`, `AUD`, `EUR`) and subscription checkout routing.
- [ ] **TASK-305**: Implement `/guides`, `/floor-plan-to-3d`, `/guides/rss.xml`, interactive Cladding Configurator (`/guides/choosing-cladding-for-a-new-build`), and interactive Floor Plan Layer Reader (`/guides/how-to-read-a-floor-plan`).
- [ ] **TASK-306**: Implement `/demo`, `/realestate`, `/contact`, `/privacy`, `/terms`, and `/data-deletion`.

## Epic 4: Floor Plan Upload, Review, 2D/3D Studio & Sharing
- [ ] **TASK-401**: Implement `/build/new` and `/api/commerce/drafts` with multi-file upload, MIME/extension validation, and exact error feedback.
- [ ] **TASK-402**: Implement `/build/review` and `/api/commerce/drafts/[id]/checkout` with uploaded sheet preview, zoom, Metres/Feet house dimensions, live currency quote, and 2D-to-3D `HomeBuild` generation.
- [ ] **TASK-403**: Implement the Interactive 2D/3D Studio (`StudioWorkspace`) on `/demo/try` and `/build` with `Home`, `Furnish`, `Decorate`, `Edit`, `Settings`, `Walk through`, `Plan drawing`, `Split`, `Measure`, and `Classic look` (Smart Electrical, Sun Study, Photoreal Renders, Version History).
- [ ] **TASK-404**: Implement `/share/[token]` and `/api/live/[id]/share` + `/api/share/[token]` with view-only 3D walkthrough and revoked/invalid token handling.
- [ ] **TASK-405**: Implement `/account` dashboard (profile, subscription management, currency switcher, homes list, support inbox, JSON data export, and account deletion).

## Epic 5: Testing, Validation & Deployment Readiness
- [ ] **TASK-501**: Configure Playwright E2E test suite verifying all acceptance criteria on the local Next.js server.
- [ ] **TASK-502**: Add `Dockerfile`, `docker-compose.yml`, `.env.example`, and production PostgreSQL scripts.
- [ ] **TASK-503**: Run production build (`npm run build`) and full E2E test suite (`npx playwright test`) and verify 100% pass rate.
