import { test, expect } from '@playwright/test';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe.serial('Homistry Full-Stack Parity, Invite-Only RBAC & 2D/3D Studio Suite', () => {
  test.beforeAll(async () => {
    // Ensure a clean database before running E2E lifecycle verification
    await prisma.auditLog.deleteMany({});
    await prisma.shareLink.deleteMany({});
    await prisma.frameRender.deleteMany({});
    await prisma.placedPiece.deleteMany({});
    await prisma.homeVersion.deleteMany({});
    await prisma.homeBuild.deleteMany({});
    await prisma.draftFile.deleteMany({});
    await prisma.draft.deleteMany({});
    await prisma.supportMessage.deleteMany({});
    await prisma.supportThread.deleteMany({});
    await prisma.realEstateListing.deleteMany({});
    await prisma.verificationCode.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.invitationCode.deleteMany({});
  });

  test.afterAll(async () => {
    // Reset test records so the production SQLite database remains free of dummy users
    await prisma.auditLog.deleteMany({});
    await prisma.shareLink.deleteMany({});
    await prisma.frameRender.deleteMany({});
    await prisma.placedPiece.deleteMany({});
    await prisma.homeVersion.deleteMany({});
    await prisma.homeBuild.deleteMany({});
    await prisma.draftFile.deleteMany({});
    await prisma.draft.deleteMany({});
    await prisma.supportMessage.deleteMany({});
    await prisma.supportThread.deleteMany({});
    await prisma.realEstateListing.deleteMany({});
    await prisma.verificationCode.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.invitationCode.deleteMany({});
    await prisma.$disconnect();
  });

  test('1. Public Marketing, Photoreal A/B Slider, Multi-Currency Pricing, Interactive Guides & Mobile Drawer', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /SEE YOUR HOUSE STANDING BEFORE THE SLAB IS POURED/i,
      })
    ).toBeVisible();

    // Test Photoreal A/B Comparison Slider & Room Switcher
    await page.getByRole('button', { name: /Show the living/i }).click();
    const slider = page.getByRole('slider', {
      name: /Drag to compare 3D view and photoreal render/i,
    });
    await expect(slider).toBeVisible();

    // Test Currency Switcher on Home Page
    await page.getByLabel('Currency selector').selectOption('AUD');
    await expect(page.getByText('A$27.99').first()).toBeVisible();

    // Verify all visible images on Home page loaded with naturalWidth > 0
    const brokenHomeImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => !img.complete || img.naturalWidth === 0)
        .map(img => img.getAttribute('src'));
    });
    expect(brokenHomeImages).toEqual([]);

    // Test FAQ Accordion
    const faqBtn = page.getByRole('button', {
      name: /What plans can I upload\?/i,
    });
    await expect(faqBtn).toHaveAttribute('aria-expanded', 'true');

    // Test all 8 canonical /features/[slug] pages & image integrity
    for (const slug of [
      'walkthrough',
      'exterior-finishes',
      'kitchens-and-cabinetry',
      'furniture',
      'electrical-plans',
      'photoreal-renders',
      'sun-study',
      'sharing',
    ]) {
      await page.goto(`/features/${slug}`);
      await expect(page.getByText('WHAT YOU CAN DO')).toBeVisible();
      await expect(page.getByText('HOW IT WORKS')).toBeVisible();
      const brokenImgs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.getAttribute('src'))
      );
      expect(brokenImgs).toEqual([]);
    }

    // Test /floor-plan-to-3d, /builders, /realestate, and /guides/feed.xml
    await page.goto('/floor-plan-to-3d');
    await expect(
      page.getByRole('heading', { name: /Turn any 2D builder plan into an interactive 3D home/i })
    ).toBeVisible();

    await page.goto('/builders');
    await expect(
      page.getByRole('heading', {
        name: /Turn every brochure floor plan into a 3D display home/i,
      })
    ).toBeVisible();

    await page.goto('/realestate');
    await expect(
      page.getByRole('heading', {
        name: /Walk through every home before you list it/i,
      })
    ).toBeVisible();
    await expect(page.getByRole('group', { name: 'Sort and filter' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Where the homes are' })).toBeVisible();

    // Test /demo embedded 3D preview & About this example attribution
    await page.goto('/demo');
    await expect(page.getByRole('heading', { name: /Explore a home\./i })).toBeVisible();
    await expect(page.getByTestId('demo-try')).toBeVisible();
    await expect(page.getByText('About this example')).toBeVisible();

    // Test /sitemap.xml and /robots.txt
    const sitemapRes = await page.request.get('/sitemap.xml');
    expect(sitemapRes.status()).toBe(200);
    expect(await sitemapRes.text()).toContain('https://homistry.ai/floor-plan-to-3d');
    const robotsRes = await page.request.get('/robots.txt');
    expect(robotsRes.status()).toBe(200);

    // Test Interactive Cladding Guide
    await page.goto('/guides/choosing-cladding-for-a-new-build');
    await page.getByRole('button', { name: 'Brick' }).click();
    await page.getByRole('button', { name: 'Charcoal' }).click();
    await expect(page.getByText(/Durable brick veneer/i)).toBeVisible();

    // Test Interactive Floor Plan Decoder Guide
    await page.goto('/guides/how-to-read-a-floor-plan');
    await page.getByRole('button', { name: 'Doors' }).click();
    await expect(
      page.getByRole('heading', { name: /Hinged, Cavity Slider & Stacker Doors/i })
    ).toBeVisible();

    // Test Responsive Mobile Menu Drawer at 375x812
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('button', { name: 'Close menu' })).toBeVisible();
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('2. Invite-Only Registration, Single-Use Code Consumption, RBAC Roles, User Revocation & Audit Logging', async ({
    page,
    request,
  }) => {
    // Verify zero dummy users initially -> bootstrapAvailable is true
    const bootRes = await request.get('/api/admin/bootstrap-invite');
    const bootJson = await bootRes.json();
    expect(bootJson.bootstrapAvailable).toBe(true);

    // Attempting to register without an invitation code must be rejected with 403
    const otpReq1 = await request.post('/api/commerce/auth/code-request', {
      data: { email: 'uninvited@example.com' },
    });
    const otpData1 = await otpReq1.json();
    const noInviteVerify = await request.post('/api/commerce/auth/code-verify', {
      data: {
        email: 'uninvited@example.com',
        code: otpData1.devCode,
      },
    });
    expect(noInviteVerify.status()).toBe(403);

    // Register first ADMIN via /signup Bootstrap flow
    await page.goto('/signup');
    await expect(page.getByText(/FIRST-RUN ADMIN BOOTSTRAP/i)).toBeVisible();
    await page.getByRole('button', { name: /Generate Bootstrap Admin Code/i }).click();

    const inviteInput = page.locator('input[placeholder="HM-XXXX-XXXX"]');
    await expect(inviteInput).toHaveValue(/^HM-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    const bootstrapCode = await inviteInput.inputValue();

    await page.locator('input[placeholder="you@example.com"]').fill('admin@homistry.local');
    await page.getByRole('button', { name: /Send verification code/i }).click();
    await expect(page.getByText(/Verification code generated/i)).toBeVisible();

    await page.getByRole('button', { name: /Verify code & create account/i }).click();
    await page.waitForURL('**/account');
    await expect(page.getByText('Role: ADMIN')).toBeVisible();

    // Attempt to reuse the same single-use bootstrap code for another user -> must fail with 403
    const otpReq2 = await request.post('/api/commerce/auth/code-request', {
      data: { email: 'second@homistry.local' },
    });
    const otpData2 = await otpReq2.json();
    const reuseRes = await request.post('/api/commerce/auth/code-verify', {
      data: {
        email: 'second@homistry.local',
        code: otpData2.devCode,
        invitationCode: bootstrapCode,
      },
    });
    expect(reuseRes.status()).toBe(403);
    const reuseJson = await reuseRes.json();
    expect(reuseJson.error).toContain('already been used');

    // Navigate to /admin Governance Console and issue a single-use BUILDER invite
    await page.goto('/admin');
    await expect(
      page.getByRole('heading', { name: /Invitation Codes, RBAC Roles & Audit Logs/i })
    ).toBeVisible();

    await page.getByLabel('Assigned Role').selectOption('BUILDER');
    await page.getByRole('button', { name: 'Generate Code' }).click();
    const banner = page.locator('text=Created single-use/expiring invitation code:');
    await expect(banner).toBeVisible();
    const bannerText = await banner.textContent();
    const builderInviteMatch = bannerText?.match(/HM-[A-Z2-9]{4}-[A-Z2-9]{4}/);
    expect(builderInviteMatch).not.toBeNull();
    const builderInviteCode = builderInviteMatch![0];

    // Register second user with the BUILDER invite via API, then revoke them as ADMIN
    const otpReq3 = await request.post('/api/commerce/auth/code-request', {
      data: { email: 'builder@homistry.local' },
    });
    const otpData3 = await otpReq3.json();
    const regBuilder = await request.post('/api/commerce/auth/code-verify', {
      data: {
        email: 'builder@homistry.local',
        code: otpData3.devCode,
        invitationCode: builderInviteCode,
      },
    });
    expect(regBuilder.status()).toBe(200);

    // Switch to Users tab in Admin UI and revoke builder@homistry.local
    await page.getByRole('button', { name: /Users & Roles/i }).click();
    await expect(page.getByText('builder@homistry.local')).toBeVisible();

    const builderRow = page.locator('tr', { hasText: 'builder@homistry.local' });
    await builderRow.getByRole('button', { name: 'Revoke User' }).click();
    await expect(builderRow.getByText('REVOKED')).toBeVisible();

    // Verify Audit Logs tab records the security events
    await page.getByRole('button', { name: /Audit Logs/i }).click();
    await expect(page.getByText('USER_REVOKED').first()).toBeVisible();
    await expect(page.getByText('USER_REGISTERED').first()).toBeVisible();
    await expect(page.getByText('INVITE_CREATED').first()).toBeVisible();
  });

  test('3. Floor Plan Upload Validation, 3D Build Wizard, Interactive 2D/3D Studio & Share Revocation', async ({
    page,
  }) => {
    await page.goto('/build/new');
    await expect(page.getByTestId('quiet-flow-bar')).toBeVisible();
    await expect(page.getByText('Builder floor plan with room sizes')).toBeVisible();
    await expect(page.getByText('Photos of a finished room')).toBeVisible();

    // Test invalid file upload error message parity
    const fileInput = page.locator('#floorplan-file-input');
    await fileInput.setInputFiles({
      name: 'invalid_plan.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not an image'),
    });
    await expect(
      page.getByRole('alert').filter({
        hasText: 'invalid_plan.txt is not a PNG, JPEG, WebP, SVG or PDF file.',
      })
    ).toBeVisible();

    // Upload valid mirrored floor plan image (page-1.png)
    const validPlanPath = path.join(
      process.cwd(),
      'public/demos/southern-farmhouse/page-1.png'
    );
    await fileInput.setInputFiles(validPlanPath);
    await page.getByRole('button', { name: /Continue to review/i }).click();

    await page.waitForURL('**/build/review?draft=*');
    await expect(
      page.getByRole('heading', { name: /Review your floor plan details/i })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(page.getByText('125%')).toBeVisible();
    await expect(page.getByText('Built right, or your money back')).toBeVisible();

    await page.getByRole('button', { name: 'Two-storey' }).click();
    await page.getByRole('button', { name: /Build my 3D home/i }).click();

    await page.waitForURL('**/build?id=*');

    // Test Interactive 2D/3D Studio tabs (Home, Furnish, Decorate, Edit, Settings)
    await expect(page.getByRole('tab', { name: 'Home' })).toBeVisible();
    await page.getByRole('tab', { name: 'Furnish' }).click();
    await page.getByRole('button', { name: /AI room designer/i }).click();
    await page.getByRole('button', { name: 'Sofas' }).click();
    await page.getByRole('button', { name: '+ Place' }).first().click();
    await page.getByRole('button', { name: 'Turn right a quarter' }).click();
    await page.getByRole('button', { name: 'Make a copy beside it' }).click();

    await page.getByRole('tab', { name: 'Decorate' }).click();
    await expect(page.getByText('FLOOR COVERINGS NEEDED')).toBeVisible();
    await page.getByRole('button', { name: 'Herringbone parquet' }).click();
    await page.getByRole('button', { name: 'Trims' }).click();
    await page.getByRole('button', { name: 'Natural oak' }).click();
    await page.getByRole('button', { name: 'Fence' }).click();
    await page.getByRole('button', { name: 'Colorbond steel' }).click();
    await page.getByRole('button', { name: 'Soft Sage' }).click();

    await page.getByRole('tab', { name: 'Edit' }).click();
    await page.getByRole('button', { name: /Add door/i }).click();
    await expect(page.getByText('Sort of door')).toBeVisible();
    await page.getByRole('button', { name: 'Split' }).click();
    await page.getByRole('button', { name: '3D', exact: true }).click();

    // Test Walk-through D-Pad & Leave walk
    await page.getByRole('button', { name: 'Walk through' }).first().click();
    await expect(page.getByRole('button', { name: 'Walk forward' })).toBeVisible();
    await page.getByRole('button', { name: 'Walk forward' }).click();
    await page.getByRole('button', { name: 'Leave walk' }).click();

    await page.getByRole('tab', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Use the classic look' }).click();
    await expect(page.getByText('Solar Path & Lot Orientation')).toBeVisible();
    await page.getByRole('button', { name: 'Electrical' }).click();
    await page.getByTestId('smart-electrical-go').click();
    await expect(page.getByRole('button', { name: /Download schedule/i })).toBeVisible();

    // Test Share Link Creation & Revocation
    await page.getByRole('button', { name: 'Create view-only share link' }).click();
    const openShareLink = page.getByRole('link', { name: 'Open share link' });
    await expect(openShareLink).toBeVisible();
    const shareHref = await openShareLink.getAttribute('href');
    expect(shareHref).toMatch(/^\/share\//);

    // Revoke the share link and verify /share/[token] displays the unavailable message
    await page.getByRole('button', { name: 'Stop sharing' }).click();
    await page.goto(shareHref!);
    await expect(
      page.getByRole('heading', {
        name: /This share link is unavailable\. The owner may have stopped sharing\./i,
      })
    ).toBeVisible();
  });
});
