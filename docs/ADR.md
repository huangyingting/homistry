# Architectural Decision Records (ADR)

## ADR-001: Full-Stack Framework — Next.js App Router (Latest Stable)

### Status
Accepted

### Context
`homistry.ai` is built on Next.js App Router combining server-rendered marketing/guide pages, interactive client islands (`RidgelineStage`, Cladding Configurator, Floor Plan Layer Inspector), a WebGL/Three.js + SVG 2D/3D Home Studio (`/demo/try`, `/build`, `/share/[token]`), and a rich REST API surface (`/api/commerce/*`, `/api/live/*`, `/api/share/*`, `/api/realestate/*`).

### Decision
Use **Next.js (App Router, TypeScript)** as a unified full-stack framework serving:
1. Public marketing, feature deep-dives, pricing, interactive guides, and live demo routes.
2. Authenticated studio, floor plan upload/review workflow, account dashboard, and real estate portal.
3. Invite-only registration, RBAC administration, and REST API route handlers.

### Consequences
- Single deployable artifact with shared TypeScript types between API route handlers, Prisma models, and React client components.
- Faithful reproduction of URL structure, SEO metadata, CSS custom properties, and responsive layouts observed on `homistry.ai`.

---

## ADR-002: Dual-Database Prisma Architecture (SQLite Local Dev + PostgreSQL Production)

### Status
Accepted

### Context
The application must run out-of-the-box in local development using **SQLite** while supporting **PostgreSQL** in production deployments without code changes. Furthermore, the database must start clean with **zero dummy data or pre-seeded demo user accounts**.

### Decision
Use **Prisma ORM** with:
- `prisma/schema.prisma` configured for SQLite (`provider = "sqlite"`) in local development (`DATABASE_URL="file:./dev.db"`).
- `prisma/schema.postgresql.prisma` configured for PostgreSQL (`provider = "postgresql"`) for production deployments, paired with migration scripts (`npm run db:migrate:prod`).
- Scalar types and JSON string/structured serialization compatible with both SQLite and PostgreSQL.
- Zero seed scripts that insert fake users or dummy records. The first user to register with the bootstrap admin invitation token (configured via environment variable `BOOTSTRAP_INVITE_CODE` or generated via CLI `npm run invite:create`) is granted the `ADMIN` role, or admins can generate single-use/expiring invitation codes for specific roles.

### Consequences
- Developers and automated E2E tests can run locally with zero external database containers.
- Production deployments switch seamlessly to PostgreSQL via `prisma/schema.postgresql.prisma`.

---

## ADR-003: Authentication, Invite-Only Registration, RBAC, Revocation & Audit Logging

### Status
Accepted

### Context
While replicating `homistry.ai`'s authentication UX (email verification / credentials sign-in and session management), the platform requires production-grade access control:
1. **Invite-Only Registration**: New accounts can only be registered using a valid, non-expired, non-revoked, single-use (or bounded-use) **Invitation Code**.
2. **Role-Based Access Control (RBAC)**: Users hold explicit roles (`ADMIN`, `BUILDER`, `AGENT`, `USER`) enforced at both middleware/page and API route levels.
3. **Revocation**: Both **Invitation Codes** (before redemption) and **User Accounts / Sessions** (post-registration) can be immediately revoked by an `ADMIN`, terminating active sessions.
4. **Immutable Audit Logging**: Every security-sensitive and state-mutating action (invite creation, invite revocation, invite redemption, user sign-in, failed sign-in, role change, user revocation, floor plan draft upload, build creation, design save, share token creation/revocation, data export/deletion) is recorded in the `AuditLog` table with actor ID, action type, target entity, IP/user-agent metadata, and timestamp.

### Decision
Implement **Auth.js / NextAuth v5 (`next-auth`)** integrated with Prisma and `/api/commerce/session` compatibility:
- Support both Auth.js standard endpoints (`/api/auth/*`) and Homistry's `/api/commerce/auth/*` + `/api/commerce/session` endpoints using a unified session layer that validates user `status === "ACTIVE"` on every request.
- Enforce invitation code validation inside an atomic Prisma transaction (`$transaction`) during registration:
  - Verify code exists, `status === "ACTIVE"`, `expiresAt > now()`, `usedCount < maxUses`, and optional `boundEmail` matches the registering email.
  - Increment `usedCount`, mark `status = "USED"` when `usedCount === maxUses`, link `redeemedByUserId`, assign the invitation's `role` to the newly created `User`, and write an `INVITE_REDEEMED` + `USER_REGISTERED` audit log entry.
- Provide a first-time **Bootstrap Admin Setup** flow on `/signup` and `/admin` when `User.count() === 0` (using a cryptographically generated one-time bootstrap invite code or admin setup token) so a fresh production deployment can be initialized without any pre-seeded demo user accounts.

### Consequences
- Eliminates unauthorized public signups while preserving the clean Homistry sign-in/sign-up UX.
- Immediate session invalidation when a user's access is revoked (`revokedAt != null` or `status === "REVOKED"`).
- Complete forensic visibility via the `/admin` Audit Log viewer and `/api/admin/audit-logs`.

---

## ADR-004: 2D/3D Architectural Studio & Procedural Scene Engine

### Status
Accepted

### Context
`homistry.ai` features two interactive 3D/2D engines:
1. **Ridgeline Landing Stage (`/`)**: A 9-chapter scrollytelling experience (`00 Home` through `08 Yours`) that blends architectural stills (`/site/ridgeline/stills/*.webp`), live Three.js WebGL rendering (`#gl`), interactive room callouts, and an A/B photoreal comparison slider (`/site/ridgeline/pr/*.jpg`).
2. **Interactive Home Studio (`/demo/try`, `/build`, `/share/[token]`)**: Loads a structured multi-storey floor plan JSON (`plan.json` for Southern Farmhouse or user-created builds from uploaded floor plans) and supports:
   - Synchronized **3D Perspective / Orbit / Eye-level Walkthrough** and **2D Architectural Plan / Split View / Measure** modes.
   - **Storey Switching** (`Whole house`, `Ground` / `1st floor`, `Upper` / `2nd floor`) and visibility toggles (`Roof`, `Room names`, `Plan drawing`, `Night`, `Time of day` sun angle `6:00 am`–`8:00 pm`).
   - **Furnish Mode**: True-scale furniture & cabinetry catalog with placement, rotation (`↶`/`↷`), duplication (`⧉`), resize, and deletion (`✕`).
   - **Decorate Mode**: Room-by-room or whole-house floor, wall, exterior cladding, and roof material/colour customization.
   - **Edit Mode**: Structural editing (`Select`, `Add wall`, `Add door`, `Add window`, `Add railing`).
   - **Classic / Advanced Engineering Tools**: Room-by-room **Smart Electrical Plan** (power points, lights, switches, printable schedule), **Site Plan & Sun Study** (lot boundaries, North arrow, date/time shadow simulation), **Photorealistic Renders** (camera framing & render generation), **Version History**, and **View-Only Share Links**.

### Decision
Build a modular, hardware-accelerated **Three.js + Interactive SVG/Canvas 2D/3D Studio Engine** that consumes the exact `plan.json` schema from `homistry.ai` (`/demos/southern-farmhouse/plan.json` for the public live example, and database-backed `HomeBuild` plans for authenticated user builds) with graceful WebGL / Canvas / SVG rendering so it performs at 60 FPS on desktop/mobile and works deterministically in headless Playwright tests.

### Consequences
- 100% compatibility with the original Southern Farmhouse `plan.json` dataset and all Studio tools.
- Fast, deterministic rendering in both interactive browsers and headless CI environments.
