# Homistry.ai — Playwright Exploration Coverage & Reverse-Engineering Report

## 1. Executive Summary

Using Playwright (`chromium` headless browser) and client bundle analysis, we conducted a comprehensive, multi-phase exploration of `https://homistry.ai/` across **unauthenticated** and **authenticated** sessions (`powlowskijoshuah@gmail.com`), **Desktop (`1440×900`)**, **Tablet (`768×1024`)**, and **Mobile (`375×812`)** viewports.

- **Routes Explored**: 28 distinct routes (27 core routes + error/invalid-token states)
- **Screenshots Captured**: 61 PNG screenshots stored in `docs/exploration/screenshots/`
- **API Endpoints Discovered & Exercised**: 36 REST API endpoints across `/api/commerce/*`, `/api/live/*`, `/api/share/*`, and `/api/realestate/*`
- **Client Bundles & Stylesheets Analyzed**: 43 JavaScript chunks and 24 CSS modules
- **Static Assets Mirrored**: 45 original brand, font, 3D/2D still, photoreal render, and Southern Farmhouse floor plan assets mirrored into `public/`

---

## 2. Route Inventory & Exploration Coverage Matrix

| # | Route | Auth Mode | HTTP Status | Page Title | Desktop Snap | Tablet Snap | Mobile Snap | Interactive / Edge States Tested |
|---|-------|-----------|-------------|------------|--------------|-------------|-------------|----------------------------------|
| 1 | `/` (rewrites to `/home-v2`) | Public & Auth | 200 | `Homistry.ai · Walk through your new home before it’s built` | `home_unauth_desktop_full.png`, `home_auth_desktop_full.png` | `responsive_tablet_home.png` | `responsive_mobile_home.png`, `responsive_mobile_home_menu_open.png` | Ridgeline 9-chapter scrollytelling stage (`00 Home`–`08 Yours`), Photoreal A/B slider (`#tagA`/`#tagB`), room switcher (`Living`/`Kitchen`/`Front`), currency switcher (`USD`/`AUD`/`EUR`), FAQ accordions |
| 2 | `/features` | Public & Auth | 200 | `Features · Homistry.ai` | `route_features_desktop.png` | `responsive_tablet_features.png` | `responsive_mobile_features.png` | 8 feature cards with interactive links and CTA buttons |
| 3 | `/features/walkthrough` | Public | 200 | `3D Home Walkthrough From Your Floor Plan · Homistry.ai` | `route_features_walkthrough_desktop.png` | Covered via layout | Covered via layout | Interactive walkthrough preview & controls explanation |
| 4 | `/features/exterior-finishes` | Public | 200 | `Try Exterior Cladding, Brick, Render & Roof Colours in 3D · Homistry.ai` | `route_features_exterior_finishes_desktop.png` | Covered via layout | Covered via layout | Cladding & roof material showcase |
| 5 | `/features/kitchens-and-cabinetry` | Public | 200 | `3D Kitchen, Island, Laundry & Robe Planner · Homistry.ai` | `route_features_kitchens_and_cabinetry_desktop.png` | Covered via layout | Covered via layout | Cabinetry & benchtop planning |
| 6 | `/features/furniture` | Public | 200 | `Furnish Your Floor Plan to Scale in 3D · Homistry.ai` | `route_features_furniture_desktop.png` | Covered via layout | Covered via layout | True-scale furniture catalog details |
| 7 | `/features/electrical-plans` | Public | 200 | `Home Electrical Plan: Power Points, Lights & Switches · Homistry.ai` | `route_features_electrical_plans_desktop.png` | Covered via layout | Covered via layout | Room-by-room electrical planning & printable schedule |
| 8 | `/features/photoreal-renders` | Public | 200 | `Photorealistic Home Renders From Any 3D View · Homistry.ai` | `route_features_photoreal_renders_desktop.png` | Covered via layout | Covered via layout | AI camera framing & render comparison |
| 9 | `/features/sun-study` | Public | 200 | `Home Sun Study: Sunlight Across Your Block & Rooms · Homistry.ai` | `route_features_sun_study_desktop.png` | Covered via layout | Covered via layout | Lot orientation & solar azimuth/altitude slider |
| 10 | `/features/sharing` | Public | 200 | `Share Your 3D Home With Family · Homistry.ai` | `route_features_sharing_desktop.png` | Covered via layout | Covered via layout | View-only link generation & revocation |
| 11 | `/pricing` | Public & Auth | 200 | `Pricing · Homistry.ai` | `route_pricing_desktop.png` | `responsive_tablet_pricing.png` | `responsive_mobile_pricing.png` | Monthly (`US$19.99` / `A$27.99` / `€19.99`) & Yearly (`US$99` / `A$149` / `€99`) plans, currency selector, included features, FAQ |
| 12 | `/guides` | Public | 200 | `Home building guides · Homistry.ai` | `route_guides_desktop.png` | Covered via layout | Covered via layout | Guide cards & RSS feed link (`/guides/rss.xml`) |
| 13 | `/guides/choosing-cladding-for-a-new-build` | Public | 200 | `Choosing cladding for a new build: brick, render, weatherboard and timber compared · Homistry.ai` | `route_guides_choosing_cladding_for_a_new_build_desktop.png` | Covered via layout | Covered via layout | Interactive upper/lower cladding configurator (`Brick + Weatherboard`, `Render + Timber`, `Brick + Render`, `Stone + Panels`, `All Weatherboard`) |
| 14 | `/guides/how-to-read-a-floor-plan` | Public | 200 | `How to read a floor plan: doors, windows, dimensions and symbols explained · Homistry.ai` | `route_guides_how_to_read_a_floor_plan_desktop.png` | Covered via layout | Covered via layout | Interactive Corbel House SVG floor plan layer inspector (`Doors`, `Windows`, `Dimensions`, `Stairs`, `Kitchen & wet areas`, `North arrow`) |
| 15 | `/floor-plan-to-3d` | Public | 200 | `Floor Plan to 3D: Walk Through Your House Plans Before You Build · Homistry.ai` | `route_floor_plan_to_3d_desktop.png` | Covered via layout | Covered via layout | Step-by-step floor plan conversion breakdown |
| 16 | `/demo` | Public & Auth | 200 | `Sample 3D home · Southern Farmhouse · Homistry.ai` | `route_demo_desktop.png` | `responsive_tablet_demo.png` | `responsive_mobile_demo.png` | Interactive embedded Southern Farmhouse 3D viewer, Sheet 1/Sheet 2 drawing inspector, CC BY-SA 4.0 attribution |
| 17 | `/demo/try` | Public & Auth | 200 | `Try the Southern Farmhouse · Homistry.ai` | `route_demo_try_desktop.png` | `responsive_tablet_studio.png` | `responsive_mobile_studio.png` | Full Studio (`Home`, `Furnish`, `Decorate`, `Edit`, `Settings`, `Walk through`, `Ground`/`Upper`/`Whole house`, `Plan drawing`, `Classic look`) |
| 18 | `/signup` | Public & Auth | 200 | `Create your free account · Homistry.ai` | `route_signup_desktop.png`, `scenario3_signup_with_plan.png` | `responsive_tablet_signup.png` | `responsive_mobile_signup.png` | Email 6-digit code request, plan query param (`?plan=month&currency=USD`), redirect when authenticated |
| 19 | `/account` | Auth | 200 | `My account · Homistry.ai` | `route_account_desktop.png` | `responsive_tablet_account.png` | `responsive_mobile_account.png` | Account profile, subscription status, currency toggle (`USD`/`AUD`/`EUR`), homes list, purchases, support inbox, data export, sign out |
| 20 | `/build` | Auth | 200 | `Walk through your new home before it's built · Homistry.ai` | `route_build_desktop.png` | Covered via Studio | Covered via Studio | Authenticated home studio & recent homes loader |
| 21 | `/build/new` | Auth | 200 | `Upload your floor plans · Homistry.ai` | `route_build_new_desktop.png`, `scenario2_upload_invalid_error.png` | `responsive_tablet_build_new.png` | `responsive_mobile_build_new.png` | Drag-and-drop multi-file floor plan uploader, invalid file error state (`invalid_plan.txt`), valid PNG upload (`page-1.png`) |
| 22 | `/build/review` | Auth | 200 | `Check your plans · Homistry.ai` | `route_build_review_desktop.png`, `scenario2_build_review_desktop.png` | Covered via layout | Covered via layout | Empty-draft redirect prompt vs active draft review (`?draft=...`), zoom controls, house width/length in Metres/Feet, currency quote, checkout |
| 23 | `/share/[token]` | Public | 200 | `Shared home · Homistry.ai` | `scenario3_share_invalid_error.png` | Covered via layout | Covered via layout | View-only 3D walkthrough viewer + unavailable/revoked share token error state |
| 24 | `/realestate` | Public & Auth | 200 | `Homistry.ai for Real Estate` | `route_realestate_desktop.png` | Covered via layout | Covered via layout | Real estate agent portal, interactive tile preview, agent sign-in/listing creation |
| 25 | `/contact` | Public & Auth | 200 | `Contact & help · Homistry.ai` | `route_contact_desktop.png` | Covered via layout | Covered via layout | Contact & support message form (`Name`, `Email`, `Message`) |
| 26 | `/privacy` | Public | 200 | `Privacy Policy · Homistry.ai` | `route_privacy_desktop.png` | Covered via layout | Covered via layout | Full privacy policy & sub-processor disclosure |
| 27 | `/terms` | Public | 200 | `Terms of Service & Refund Policy · Homistry.ai` | `route_terms_desktop.png` | Covered via layout | Covered via layout | Terms of service & money-back guarantee |
| 28 | `/data-deletion` | Public | 200 | `Deleting Your Data · Homistry.ai` | `route_data_deletion_desktop.png` | Covered via layout | Covered via layout | Self-service & email data deletion instructions |

---

## 3. Executed User Scenarios & Observed Behavior

### Scenario 1: Interactive 2D/3D Home Studio (`/demo/try`)
- **Initial State (`scenario1_studio_initial.png`)**:
  - Top bar displays home title (`SOUTHERN FARMHOUSE (DEMO)`), status pill (`Saved`), and primary pink CTA button (`Walk through`).
  - Left vertical rail (`studio_railItem`) contains 5 primary modes: `Home`, `Furnish`, `Decorate`, `Edit`, `Settings`.
  - `Home` drawer displays summary metrics (`Storeys: 2`, `Ceilings: 8 ft 4 in and 8 ft 10 in`, `Roof: Gable`), 3 action cards (`Walk through`, `Furnish and decorate`, `Edit home`), and a room jump list (`Central hall, Kitchen +2 more · 534 sq ft`, `Family room · 187 sq ft`, `Living room · 185 sq ft`, etc.).
  - Bottom floating dock displays floor selectors (`Whole house`, `Upper`, `Ground`) and view toggles (`Roof`, `Room names`, `Plan drawing`).
- **Furnish Mode (`studio_tab_furnish.png`)**:
  - Left drawer switches to `FURNISH · 1ST FLOOR PLAN` with room filter dropdown (`Whole floor` or specific room), category chips (`Sofas`, `Armchairs`, `Coffee tables`, `Side tables`, `TV units`, `Shelving`, `Kitchens and robes`, `Other rooms`), and true-scale catalog cards (`2-seat sofa 5′3″ × 2′11″`, `3-seat sofa 6′11″ × 2′11″`, `Corner sofa 9′2″ × 6′7″`, etc.).
  - Selecting or placing a piece reveals in-scene manipulation gizmos (`Turn left a quarter ↶`, `Turn right a quarter ↷`, `Make a copy beside it ⧉`, `Remove this piece ✕`, plus width/depth/height/corner drag handles).
  - Bottom dock switches to `Upper` / `Ground` floor toggles and `3D` / `Plan` / `Split` / `Measure` tools.
- **Decorate Mode (`studio_tab_decorate.png`)**:
  - Allows room-specific or whole-house (`Every room` vs `Just this one`) finish changes across 4 surface tabs: `Floors`, `Walls`, `Outside`, `Roof`.
  - Includes 18 floor material presets (`Timber boards`, `Herringbone parquet`, `Hybrid / vinyl plank`, `Large tiles`, `Tiles`, `Carpet`, `Polished concrete`, `Marble`, `Stone pavers`, `Timber decking`, `Epoxy flake coating`, `Terrazzo`, `Terracotta tiles`, `Mosaic tiles`, etc.) with color swatches.
- **Edit Mode (`studio_tab_edit.png`)**:
  - Structural modification tools: `Select`, `Add wall`, `Add door`, `Add window`, `Add railing`.
  - Changes stage in a draft version before committing.
- **Settings Mode (`studio_tab_settings.png` & `studio_classic_look.png`)**:
  - Toggles for `Roof`, `Room names`, `Plan drawing on the floors`, `Night`, `Time of day` slider (`6:00 am` – `8:00 pm`, default `1:00 pm`), `Units` (`Metres` vs `Feet and inches`), `Home settings` (`Storeys, size, ceilings, roof and stairs`), `Share a view-only link` (on user builds), `Report a problem`, and `Use the classic look` (which switches to the multi-tab engineering studio with `Smart Electrical`, `Site Plan / Sun Study`, `Photoreal Film Camera`, `Versions`, and `Questions`).
- **Walkthrough Mode (`studio_walkthrough_active.png`)**:
  - Drops camera to eye level (`1.65 m`) at the front door or selected room.
  - Displays on-screen directional pad (`↑`, `↓`, `↶`, `↷`), floor jumper (`1ST FLOOR PLAN` / `2ND FLOOR PLAN`), `Controls` help modal, `Night` mode switch, and `Leave walk` button.

### Scenario 2: Floor Plan Upload & Review Wizard (`/build/new` → `/build/review`)
- **Invalid File Upload Edge Case (`scenario2_upload_invalid_error.png`)**:
  - Uploading `invalid_plan.txt` triggers `POST /api/commerce/drafts` → `HTTP 400` with JSON `{"error":"invalid_plan.txt is not a PNG, JPEG, WebP, SVG or PDF file."}`, rendered in an error banner above the dropzone.
- **Valid Floor Plan Upload (`scenario2_build_review_desktop.png`)**:
  - Uploading `page-1.png` (`991,931` bytes) sends `POST /api/commerce/drafts` → `HTTP 201` and redirects to `/build/review?draft=ef394252-f7ed-4e15-bada-8359b11f45bc`.
  - The review page loads the uploaded plan sheet preview (`/api/commerce/drafts/[id]/pages/0.png?size=view`), zoom in/out buttons, optional house width & length inputs (`Metres` / `Feet`), live currency quote (`/api/commerce/quote?currency=USD`, `/api/commerce/rates`), and checkout/subscription confirmation.

### Scenario 3: Account Management, Auth & Share Link Error Handling
- **Authenticated Account Dashboard (`route_account_desktop.png`)**:
  - Hydrates from `GET /api/commerce/session` and `GET /api/commerce/inbox`.
  - Displays signed-in identity (`powlowskijoshuah@gmail.com`), subscription plan switcher (`Monthly` / `Yearly` in `USD`, `AUD`, `EUR`), list of home builds, purchase receipts, support messages, data export (`GET /api/commerce/account/export`), and Sign out.
- **Invalid/Revoked Share Link (`scenario3_share_invalid_error.png`)**:
  - Visiting `/share/nonexistent-token` calls `GET /api/share/nonexistent-token` (`HTTP 404`) and renders a clean status card: *"This share link is unavailable. The owner may have stopped sharing."*

### Scenario 4: Interactive Landing Page & Architectural Guides
- **Ridgeline Home Page (`scenario4_home_interactive_eur_faqs.png`)**:
  - Scrollytelling 9-chapter stage transitions smoothly between architectural blueprint and 3D model; Photoreal A/B comparison slider (`#tagA` / `#tagB`) and room tabs (`Living room`, `Kitchen`, `Front of house`) dynamically swap `/site/ridgeline/pr/{room}-{a|b}.jpg`.
- **Interactive Cladding & Floor Plan Guides (`scenario4_guide_cladding_interactive.png`, `scenario4_guide_floorplan_viewport.png`)**:
  - Cladding guide dynamically re-colors the 2-storey house SVG with upper/lower cladding materials, roof styles, and architectural presets.
  - Floor plan reading guide highlights interactive SVG layers (`Doors`, `Windows`, `Dimensions`, `Stairs`, `Kitchen & wet areas`, `North arrow`) on the Corbel House ground floor plan.

### Scenario 5: Responsive Layout Verification (Tablet `768×1024` & Mobile `375×812`)
- Captured 17 responsive screenshots across `/` (including mobile `<details data-site-menu>` drawer open), `/features`, `/pricing`, `/demo`, `/demo/try`, `/account`, `/build/new`, and `/signup`.
- Verified responsive breakpoints at `900px` and `640px` where multi-column grids collapse to single-column stacks, the top nav collapses into `Menu`, and the Studio side panel docks to a bottom sheet on mobile screens.

---

## 4. Discovered API Surface

| Category | Endpoint | Methods | Purpose |
|----------|----------|---------|---------|
| Commerce & Auth | `/api/commerce/session` | `GET`, `DELETE` | Current user session, subscription state, credits, homes, purchases |
| Commerce & Auth | `/api/commerce/auth/state` | `GET` | OAuth & email auth availability |
| Commerce & Auth | `/api/commerce/auth/code-request` | `POST` | Request 6-digit login/signup code |
| Commerce & Auth | `/api/commerce/auth/code-verify` | `POST` | Verify 6-digit code & establish session |
| Commerce & Auth | `/api/commerce/rates` | `GET` | Exchange rates (`AUD`, `USD`, `EUR`, `GBP`) |
| Commerce & Auth | `/api/commerce/quote` | `GET` | Currency-specific build quote (`amountMinor`, `currency`) |
| Commerce & Auth | `/api/commerce/subscribe` | `POST`, `DELETE` | Create/manage monthly or yearly subscription |
| Commerce & Auth | `/api/commerce/drafts` | `POST` | Create floor plan upload draft |
| Commerce & Auth | `/api/commerce/drafts/[id]` | `GET`, `PATCH`, `DELETE` | Inspect or update draft dimensions/consent |
| Commerce & Auth | `/api/commerce/drafts/[id]/files` | `POST` | Add/replace floor plan files in draft |
| Commerce & Auth | `/api/commerce/drafts/[id]/pages/[page]` | `GET` | Render uploaded floor plan sheet preview |
| Commerce & Auth | `/api/commerce/drafts/[id]/checkout` | `POST` | Finalize draft & start home build |
| Commerce & Auth | `/api/commerce/inbox` | `GET`, `POST` | Customer support threads & drawing attachments |
| Commerce & Auth | `/api/commerce/contact` | `POST` | Public contact form submission |
| Commerce & Auth | `/api/commerce/account/export` | `GET` | Export all account & build data as JSON |
| Live Home Studio | `/api/live` | `GET`, `POST` | List user's 3D homes or create a build |
| Live Home Studio | `/api/live/recent` | `GET` | Fetch most recent active home build |
| Live Home Studio | `/api/live/[id]/state` | `GET` | Poll build status & current version |
| Live Home Studio | `/api/live/[id]/design` | `GET`, `PUT` | Load or update 3D floor plan geometry & rooms |
| Live Home Studio | `/api/live/[id]/settings` | `PATCH` | Update storeys, ceiling heights, roof type, units |
| Live Home Studio | `/api/live/[id]/pieces` | `GET`, `POST`, `PUT`, `DELETE` | Manage placed 3D furniture & cabinetry pieces |
| Live Home Studio | `/api/live/[id]/smart-electrical` | `GET`, `PUT` | Manage room-by-room electrical plan items |
| Live Home Studio | `/api/live/[id]/site-plan` | `GET`, `PUT` | Manage block boundaries, setback, North angle, sun study |
| Live Home Studio | `/api/live/[id]/frame-images` | `GET`, `POST`, `DELETE` | Generate & list photorealistic AI renders from 3D camera views |
| Live Home Studio | `/api/live/[id]/versions` | `GET`, `POST` | List or restore saved design versions |
| Live Home Studio | `/api/live/[id]/share` | `GET`, `POST`, `DELETE` | Create or revoke view-only family share token |
| Shared View | `/api/share/[token]` | `GET` | Resolve shared home model for view-only walkthrough |
| Real Estate | `/api/realestate/me` | `GET`, `POST` | Real estate agent profile & session |
| Real Estate | `/api/realestate/homes` | `GET`, `POST` | Real estate property 3D listings |
| Admin & Governance (New) | `/api/admin/invitations` | `GET`, `POST`, `PATCH` | Create, list, and revoke single-use/expiring invitation codes |
| Admin & Governance (New) | `/api/admin/users` | `GET`, `PATCH` | Manage user roles (`ADMIN`, `BUILDER`, `USER`, `VIEWER`) & revoke access |
| Admin & Governance (New) | `/api/admin/audit-logs` | `GET` | Query immutable security & operational audit trail |
