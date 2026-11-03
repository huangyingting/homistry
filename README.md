# Homistry (`homistry.ai` Full-Stack Replication)

A production-ready full-stack replication of **Homistry (`https://homistry.ai/`)** built with **Next.js 15 (App Router, TypeScript)**, **Auth.js / NextAuth v5**, and **Prisma ORM** supporting **SQLite for local development** and **PostgreSQL for production**.

## Key Capabilities

1. **Interactive 2D/3D Architectural Studio (`/demo/try`, `/build`, `/share/[token]`)**:
   - **5-Tab Left Rail (`Home`, `Furnish`, `Decorate`, `Edit`, `Settings`)** + **Bottom Floating Dock (`Whole house`, `Upper`, `Ground`, `Roof`, `Room names`, `Measure`)**.
   - **Walkthrough Mode (`1.65 m` eye level)**, **2D Plan Drawing Mode**, and **Interactive 2-Point Clearance Measurement**.
   - **Scaled Furniture Catalogue** with per-millimetre custom width, depth, height, and rotation controls.
   - **Classic Engineering Workspace (`"Use the classic look"`)**:
     - **Sun & Site Plan**: Solar azimuth/altitude simulation across Summer, Equinox, and Winter solstices.
     - **Smart Electrical Plan**: Interactive placement of GPO power points, light switches, recessed downlights, pendants, and data points.
     - **Photoreal Camera Renders**: Frame-based architectural rendering with credit tracking.
     - **Version History & Revocable View-Only Share Links**.
2. **Floor Plan Upload & Conversion Wizard (`/build/new` → `/build/review` → `/build`)**:
   - Multi-file upload (`PNG`, `JPEG`, `WebP`, `SVG`, `PDF`, up to 10 files / 20 MB each) with exact MIME/extension validation.
   - Storeys (`Single-storey` / `Two-storey`), units (`Metres & millimetres` / `Feet & inches`), ceiling heights, and roof style configuration.
3. **Invite-Only Registration, Single-Use / Expiring Codes, RBAC Roles, Revocation & Audit Logging (`/signup`, `/account`, `/admin`)**:
   - **Zero Dummy Data**: No pre-seeded demo users exist in the database.
   - **First-Run Bootstrap Admin**: When `User.count() === 0`, `/signup` exposes a one-time Bootstrap Admin invitation generator (`POST /api/admin/bootstrap-invite`) that permanently locks once the first admin registers.
   - **Single-Use & Expiring Invitations**: Atomic validation and consumption inside `prisma.$transaction`.
   - **RBAC Roles (`ADMIN`, `AGENT`, `BUILDER`, `USER`) & Instant Session Revocation**: Revoking a user sets `status = 'REVOKED'` and deletes all active sessions immediately.
   - **Immutable Audit Trail**: Every security, governance, and workspace mutation is recorded in `AuditLog`.

## Documentation Suite (`docs/`)

- [`docs/exploration/EXPLORATION_COVERAGE.md`](docs/exploration/EXPLORATION_COVERAGE.md) — Playwright exploration matrix & 61 screenshots
- [`docs/ADR.md`](docs/ADR.md) — Architecture Decision Records
- [`docs/PRD.md`](docs/PRD.md) — Product Requirements Document
- [`docs/SPEC.md`](docs/SPEC.md) — Technical & API Specification
- [`docs/ARCHITECTURE_AND_DATA_MODEL.md`](docs/ARCHITECTURE_AND_DATA_MODEL.md) — System Architecture & 15-Model Dual-DB Schema
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — Phased Implementation Plan
- [`docs/TASK_BACKLOG.md`](docs/TASK_BACKLOG.md) — Engineering Task Backlog
- [`docs/ACCEPTANCE_CRITERIA.md`](docs/ACCEPTANCE_CRITERIA.md) — Testable Acceptance Criteria
- [`docs/FEATURE_PARITY.md`](docs/FEATURE_PARITY.md) — Route-by-Route Feature Parity Matrix

## Local Development (SQLite)

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Production Deployment (PostgreSQL)

```bash
# Validate both SQLite and PostgreSQL Prisma schemas
npm run db:validate

# Or launch with Docker Compose + PostgreSQL 16
docker compose up --build -d
```

## Running Tests

```bash
# Unit tests (Vitest)
npm test

# End-to-End tests (Playwright)
npm run test:e2e
```
