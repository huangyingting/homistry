# Product Requirements Document (PRD) — Homistry.ai Platform

## 1. Product Vision & Overview
**Homistry.ai** (*"Walk through your new home before it’s built"*) enables home buyers, owner-builders, and real estate professionals to upload 2D builder floor plans (PDF, PNG, JPG, WebP, SVG, up to 4 storeys) and convert them into an interactive, true-to-scale 2D/3D home model. Users can walk through rooms at eye level, test exterior cladding and roof finishes, configure kitchens and cabinetry, place true-scale furniture, plan electrical layouts room-by-room, run solar sun studies across their block, generate photorealistic AI renders, and share view-only links with family or trades.

In addition to full feature parity with `https://homistry.ai/`, this production platform includes **Enterprise Invite-Only Access Control**: single-use/expiring invitation codes, role-based access control (`ADMIN`, `BUILDER`, `AGENT`, `USER`), instant user/invitation revocation, and immutable security audit logging—with **zero dummy data or pre-seeded demo accounts**.

---

## 2. Target User Personas

1. **New Home Buyer / Owner-Builder (`USER`)**
   - Has a builder brochure or architectural floor plan PDF/image and wants to experience room proportions, ceiling heights, furniture fit, cladding combinations, sunlight, and electrical point placement before signing off on pre-start / colour selections.
2. **Custom Builder / Draftsperson (`BUILDER`)**
   - Creates and manages multiple client home builds, customizes structural walls/openings, exports electrical schedules, and shares interactive walkthrough links with clients.
3. **Real Estate Agent (`AGENT`)**
   - Uses `/realestate` to turn off-the-plan or listing floor plans into interactive 3D home tours for prospective buyers.
4. **Platform Administrator (`ADMIN`)**
   - Generates single-use or expiring invitation codes, assigns roles, monitors platform usage, revokes invitations or user sessions when needed, and inspects the immutable audit log.

---

## 3. Functional Requirements

### FR-1: Public Marketing, Interactive Guides & Live Example
- **FR-1.1 Landing Page (`/`)**: Replicate the Ridgeline 9-chapter interactive story (`00 Home`, `01 Plans`, `02 Walls`, `03 Outside`, `04 Inside`, `05 Kitchen`, `06 Furniture`, `07 Photoreal`, `08 Yours`), interactive Photoreal A/B slider (`3D view` vs `Photoreal`, switchable across `Living room`, `Kitchen`, `Front of house`), Feature cards (`08.1`–`08.4`), Pricing (`09` with `USD`/`AUD`/`EUR` toggle), and FAQ accordions (`10`).
- **FR-1.2 Feature Deep-Dive Pages (`/features` + 8 sub-routes)**: Complete pages for `/features/walkthrough`, `/features/exterior-finishes`, `/features/kitchens-and-cabinetry`, `/features/furniture`, `/features/electrical-plans`, `/features/photoreal-renders`, `/features/sun-study`, and `/features/sharing`.
- **FR-1.3 Pricing Page (`/pricing`)**: Monthly (`US$19.99` / `A$27.99` / `€19.99`) and Yearly (`US$99` / `A$149` / `€99`) plans with dynamic currency switching (`USD`, `AUD`, `EUR`), included capabilities checklist, and pricing FAQs.
- **FR-1.4 Architectural Guides (`/guides`, `/floor-plan-to-3d`, `/guides/rss.xml`)**:
  - `/guides/choosing-cladding-for-a-new-build`: Interactive 2-storey cladding & roof colour combiner with 5 presets (`Brick + Weatherboard`, `Render + Timber`, `Brick + Render`, `Stone + Panels`, `All Weatherboard`).
  - `/guides/how-to-read-a-floor-plan`: Interactive Corbel House SVG floor plan reader with layer highlighting (`Doors`, `Windows`, `Dimensions`, `Stairs`, `Kitchen & wet areas`, `North arrow`).
- **FR-1.5 Southern Farmhouse Live Demo (`/demo` & `/demo/try`)**:
  - Uses the official CC BY-SA 4.0 Southern Farmhouse drawing set (`page-1.png`, `page-2.png`, `plan.json`, `metadata.json` mirrored from `homistry.ai`)—not fake user data.
  - `/demo` provides an embedded 3D preview and original architectural sheet switcher (`Sheet 1 · Ground floor` and `Sheet 2 · Upper floor`).
  - `/demo/try` launches the full interactive Studio pre-loaded with Southern Farmhouse.

### FR-2: Invite-Only Registration, Authentication, Roles, Revocation & Audit Logging
- **FR-2.1 Invite-Only Registration (`/signup`)**:
  - Registration requires a valid **Invitation Code** (single-use or bounded-use, with expiration timestamp `expiresAt`, optional `boundEmail`, and assigned `role`).
  - Supports both password-based and 6-digit email verification code workflows.
  - If the database has zero users (`User.count() === 0`), provides a one-time **Initial Admin Bootstrap** flow that creates the first `ADMIN` user and logs `SYSTEM_BOOTSTRAP_ADMIN` + `INVITE_CREATED` in `AuditLog`.
- **FR-2.2 Role-Based Access Control (RBAC)**:
  - Roles: `ADMIN`, `BUILDER`, `AGENT`, `USER`.
  - Admin console (`/admin`) and `/api/admin/*` endpoints are strictly restricted to active `ADMIN` users.
- **FR-2.3 Invitation & User Revocation**:
  - Admins can revoke any pending `InvitationCode` (`status = "REVOKED"`, `revokedAt = now()`).
  - Admins can revoke any user account (`status = "REVOKED"`, `revokedAt = now()`), immediately invalidating all active sessions for that user.
- **FR-2.4 Immutable Audit Logging**:
  - Records actor, action, target type/ID, IP address, user agent, metadata JSON, and timestamp for all authentication, invitation, role, revocation, build, share, and data-deletion events.

### FR-3: Floor Plan Upload, Review & Home Build Pipeline (`/build/new` → `/build/review` → `/build`)
- **FR-3.1 Upload Floor Plans (`/build/new`)**:
  - Drag-and-drop or file picker accepting PDF, PNG, JPG, WebP, or SVG (up to 4 files, 10 MB total, up to 4 storeys).
  - Rejects unsupported file extensions/MIME types with exact validation messaging (`"<filename> is not a PNG, JPEG, WebP, SVG or PDF file."`).
- **FR-3.2 Review & Configure Scale (`/build/review`)**:
  - Displays uploaded plan sheets with zoom in/out controls, optional house width & length inputs (`Metres` or `Feet`), currency quote selector (`AUD`, `USD`, `EUR`, `GBP`), and build confirmation / subscription redemption.
- **FR-3.3 Automated 2D-to-3D Plan Extraction**:
  - Converts confirmed drafts into a structured `HomeBuild` with storeys, rooms, walls, doors, windows, stairs, ceilings, roof, and initial fixtures, ready to open in `/build?id=<buildId>`.

### FR-4: Interactive 2D/3D Studio (`/build` & `/demo/try`)
- **FR-4.1 Studio Rail & Modes**:
  - `Home`: Overview metrics (storeys, ceilings, roof), quick actions, and clickable room directory with floor areas.
  - `Furnish`: Room filter, 8 furniture/cabinetry categories, true-scale item cards, add/drag/rotate/duplicate/resize/remove gizmos.
  - `Decorate`: Room or whole-house surface selector (`Floors`, `Walls`, `Outside`, `Roof`), 18+ materials, and colour palette swatches.
  - `Edit`: Structural editing tools (`Select`, `Add wall`, `Add door`, `Add window`, `Add railing`) with version saving.
  - `Settings`: View switches (`Roof`, `Room names`, `Plan drawing on the floors`, `Night`), `Time of day` slider (`6:00 am` – `8:00 pm`), `Units` (`Metres` / `Feet and inches`), `Home settings` (storeys, ceiling height, roof style), `Share a view-only link`, and `Use the classic look`.
- **FR-4.2 Classic / Engineering Tools**:
  - **Smart Electrical Plan**: Place power points (single/double/USB/weatherproof), lights (downlight, pendant, batten, wall sconce, exhaust fan), switches, and data/TV points per room, plus printable electrician schedule.
  - **Site Plan & Sun Study**: Configure lot dimensions, setbacks, North orientation, month/season, and time-of-day solar shadows.
  - **Photorealistic Renders**: Frame any 3D camera view, choose lighting/style, generate high-resolution renders using monthly AI credits, and compare with 3D view.
- **FR-4.3 Walk-Through Mode**:
  - Eye-level first-person navigation with keyboard (`WASD`/Arrows, `E` to open doors) and on-screen touch/mouse directional controls (`↑`, `↓`, `↶`, `↷`), floor switcher, and `Night` toggle.

### FR-5: View-Only Sharing, Account Dashboard, Real Estate & Support
- **FR-5.1 View-Only Share Links (`/share/[token]`)**:
  - Owners can generate and revoke a tokenized share link from the Studio (`POST /api/live/[id]/share`, `DELETE /api/live/[id]/share`).
  - Recipients can orbit, zoom, switch floors, and walk through in 3D without modifying the owner's saved design.
  - Revoked or nonexistent tokens render the exact unavailable state (`"This share link is unavailable. The owner may have stopped sharing."`).
- **FR-5.2 Account Dashboard (`/account`)**:
  - Manage profile, subscription (`Monthly`/`Yearly` across `USD`/`AUD`/`EUR`), AI credits, saved home builds, support inbox, JSON data export (`/api/commerce/account/export`), self-service account deletion, and link to `/admin` for administrators.
- **FR-5.3 Real Estate Portal (`/realestate`) & Contact (`/contact`)**:
  - Real estate listing management and customer support contact form backed by Prisma persistence.
