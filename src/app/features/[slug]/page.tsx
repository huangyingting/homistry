import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteChrome } from '@/components/SiteChrome';

interface FeatureDetail {
  eyebrow: string;
  title: string;
  subtitle: string;
  heroImage: string;
  secondaryImage: string;
  whatYouCanDo: string[];
  howItWorks: string[];
  disclaimer: string;
  relatedGuide?: { title: string; href: string };
}

const CANONICAL_FEATURES: Record<string, FeatureDetail> = {
  walkthrough: {
    eyebrow: 'WALK-THROUGH',
    title: 'WALK THROUGH YOUR NEW HOME BEFORE IT’S BUILT',
    subtitle:
      'Your plans become a 3D home you can walk through at eye level: in the front door, room to room, and up and down the stairs. It runs in your browser on a phone, tablet or computer.',
    heroImage: '/site/ridgeline/stills/inside-desk.webp',
    secondaryImage: '/site/ridgeline/stills/home-desk.webp',
    whatYouCanDo: [
      'Start at the front door and walk room to room at a normal walking pace',
      'Climb and descend the stairs, or jump straight to any floor',
      'Open and shut doors as you go; they swing the way your plan draws them',
      'See ceiling heights, raked ceilings and double-height spaces from inside',
      'Fix a wall, door or window yourself if something doesn’t match your plan',
    ],
    howItWorks: [
      'Upload your builder’s or designer’s plans as a PDF or a clear, straight-on photo.',
      'AI reads every page: walls, doors, windows, stairs, room names and printed measurements.',
      'Each storey is built in 3D and stacked with its stairs, patios and roof.',
      'Press Walk and step inside.',
    ],
    disclaimer:
      'YOUR HOME IS A VISUAL MODEL FOR PLANNING AND IMAGINING. IT IS NOT A CONSTRUCTION DRAWING AND MUST NOT BE USED TO BUILD FROM.',
    relatedGuide: {
      title: 'Floor plan to 3D: how to turn your house plans into a 3D model',
      href: '/floor-plan-to-3d',
    },
  },
  'exterior-finishes': {
    eyebrow: 'EXTERIOR FINISHES',
    title: 'TRY CLADDING, RENDER AND ROOF COLOURS ON YOUR OWN HOME',
    subtitle:
      'See your house in render, brick, weatherboard, timber slats or stone before you sign off the colour selections. Change one wall, one floor or the whole outside, and pick the roof’s material and colour.',
    heroImage: '/site/ridgeline/stills/outside-desk.webp',
    secondaryImage: '/site/ridgeline/pr/front-b.jpg',
    whatYouCanDo: [
      'Render, brick, weatherboard, timber slats, cladding, stone and panels',
      'Apply a finish to the whole house, one storey or a single wall',
      'Choose the roof’s material and colour, including common metal roof colours',
      'Compare looks from the street, then walk around the outside',
      'Finishes never change your home’s shape or measurements',
    ],
    howItWorks: [
      'Open your home and choose Outside.',
      'Tap a finish, then the walls or floor it goes on.',
      'Pick the roof material and colour.',
      'Save the look you like, or keep trying.',
    ],
    disclaimer:
      'COLOURS ON SCREEN ARE CLOSE TO THE REAL PRODUCTS, NOT EXACT. CHECK PHYSICAL SAMPLES BEFORE YOU CHOOSE.',
    relatedGuide: {
      title: 'Choosing cladding for a new build',
      href: '/guides/choosing-cladding-for-a-new-build',
    },
  },
  'kitchens-and-cabinetry': {
    eyebrow: 'KITCHENS & CABINETRY',
    title: 'DESIGN YOUR KITCHEN, LAUNDRY AND ROBES ON YOUR REAL FLOOR PLAN',
    subtitle:
      'The kitchen, bathroom fittings and built-in robes drawn on your plan come into your home at their drawn size. From there you can design the cabinetry yourself: runs, islands, pantries, benchtops and fronts.',
    heroImage: '/site/ridgeline/stills/kitchen-desk.webp',
    secondaryImage: '/site/ridgeline/pr/kitchen-b.jpg',
    whatYouCanDo: [
      'Plan-drawn benches, islands and tall units become cabinets you can edit',
      'Fill a wall corner to corner; runs stop at doorways and never cross a window',
      'Appliances keep their real widths; the other cabinets share the rest',
      'Choose benchtop and front materials, then colours',
      'Add bulkheads, open shelves, pantries and full-height cupboards',
      'Laundries, vanities, walk-in robes and shelving walls work the same way',
    ],
    howItWorks: [
      'Open your home and tap the kitchen bench, or a wall.',
      'Pick the cabinets you want; the run fits the wall at true size.',
      'Change any cabinet’s type, width or contents.',
      'Choose benchtops and fronts, then save.',
    ],
    disclaimer:
      'CABINET SIZES ARE TYPICAL, REAL-WORLD SIZES. YOUR CABINETMAKER’S MEASURE ON SITE IS THE ONE TO BUILD FROM.',
    relatedGuide: {
      title: 'How to read a floor plan',
      href: '/guides/how-to-read-a-floor-plan',
    },
  },
  furniture: {
    eyebrow: 'FURNITURE TO SCALE',
    title: 'FURNISH YOUR NEW HOME AT TRUE SCALE',
    subtitle:
      'Will the king bed leave room to walk around? Does the dining table clear the kitchen? Place furniture at its real size in your own home and find out before you buy.',
    heroImage: '/site/ridgeline/stills/furniture-desk.webp',
    secondaryImage: '/site/ridgeline/pr/living-b.jpg',
    whatYouCanDo: [
      'Beds by mattress size, placed at a typical frame size',
      'Sofas, tables, chairs, storage and appliances at their real dimensions',
      'Enter your own measurements for a piece you already own',
      'A piece is never shrunk to fit; an overlap is shown and named',
      'Place pieces on the flat plan or on the 3D model, then walk among them',
    ],
    howItWorks: [
      'Open your home and choose Furniture.',
      'Drop a piece where you want it; it settles against a nearby wall.',
      'Move, turn or remove it any time.',
      'Walk through to see it in place.',
    ],
    disclaimer:
      'IF YOUR HOME’S SIZE WAS ESTIMATED RATHER THAN READ FROM PRINTED MEASUREMENTS, WE SAY SO, BECAUSE TRUE SCALE DEPENDS ON IT.',
    relatedGuide: {
      title: 'Floor plan to 3D: how to turn your house plans into a 3D model',
      href: '/floor-plan-to-3d',
    },
  },
  'electrical-plans': {
    eyebrow: 'ELECTRICAL PLANS',
    title: 'PLAN POWER POINTS, LIGHTS AND SWITCHES ROOM BY ROOM',
    subtitle:
      'Decide where you want power points, switches, lights, data, TV points and fans while you can still change them. Mark them on your home and get a tidy sheet to take to your electrician.',
    heroImage: '/site/ridgeline/pr/card-elec.jpg',
    secondaryImage: '/site/ridgeline/stills/plans-desk.webp',
    whatYouCanDo: [
      'Power points, switches, lights, data and TV points, fans and alarms',
      'Points line up with the ones already placed, in tidy rows',
      'Each switch is linked to the lights it works, with dashed switch lines',
      'A legend, totals and room-by-room counts on the plan sheet',
      'Download the schedule as a spreadsheet',
    ],
    howItWorks: [
      'Open your home and choose Electrical.',
      'Tap a wall for a wall point, or the ceiling for a light.',
      'Link switches to lights, and add a height or note where it matters.',
      'Download the plan sheet and schedule.',
    ],
    disclaimer:
      'THIS SHOWS WHERE YOU WOULD LIKE POINTS. IT IS NOT A WIRING DESIGN, AND IT DOESN’T CHECK ANY ELECTRICAL RULE; YOUR LICENSED ELECTRICIAN DECIDES THAT.',
    relatedGuide: {
      title: 'How to read a floor plan',
      href: '/guides/how-to-read-a-floor-plan',
    },
  },
  'photoreal-renders': {
    eyebrow: 'PHOTOREAL IMAGES',
    title: 'TURN A VIEW OF YOUR HOME INTO A PHOTOREAL IMAGE',
    subtitle:
      'Line up a view you love, inside or out, and turn it into a lifelike image using your AI credits. It is a quick way to show family what the home will feel like.',
    heroImage: '/site/ridgeline/stills/photoreal-desk.webp',
    secondaryImage: '/site/ridgeline/pr/kitchen-b.jpg',
    whatYouCanDo: [
      'Any view: the street front, the kitchen, the living room at dusk',
      'Uses your home’s own finishes and the furniture you placed',
      'Each image uses AI credits from your monthly allowance',
      'Save images to share or compare',
    ],
    howItWorks: [
      'Open your home and frame the view you want.',
      'Ask for a photoreal image of that view; it uses AI credits.',
      'Save or share the result.',
    ],
    disclaimer:
      'IMAGES ARE AN ARTIST’S IMPRESSION MADE BY AI. SMALL DETAILS CAN DIFFER FROM YOUR MODEL AND FROM THE FINISHED HOUSE.',
    relatedGuide: {
      title: 'Choosing cladding for a new build',
      href: '/guides/choosing-cladding-for-a-new-build',
    },
  },
  'sun-study': {
    eyebrow: 'SUN STUDY',
    title: 'SEE WHERE THE SUN FALLS ON YOUR NEW HOME',
    subtitle:
      'Put your home where it will stand and watch the sun move over it. See which rooms get morning light, where the afternoon sun lands and how winter differs from summer.',
    heroImage: '/site/ridgeline/pr/card-sun.jpg',
    secondaryImage: '/site/ridgeline/stills/outside-desk.webp',
    whatYouCanDo: [
      'Find your address and turn the house to face the way it will',
      'Move through the day and the seasons',
      'A compass on the ground and the day’s sun path overhead',
      'A few plain lines on which rooms get sun and when',
    ],
    howItWorks: [
      'Open your home and choose Outside, then Sun.',
      'Find your address and set which way the house faces.',
      'Drag through the day or pick a season.',
    ],
    disclaimer:
      'SUN POSITIONS ARE CALCULATED FOR YOUR LOCATION. TREES, NEIGHBOURS AND HILLS ARE NOT INCLUDED.',
    relatedGuide: {
      title: 'Choosing cladding for a new build',
      href: '/guides/choosing-cladding-for-a-new-build',
    },
  },
  sharing: {
    eyebrow: 'SHARING',
    title: 'SHARE A WALK-THROUGH OF YOUR NEW HOME',
    subtitle:
      'Send a link and the people you choose can walk through your home on their own phone or computer, no account needed. They can look, but never edit your home or see your plans.',
    heroImage: '/site/ridgeline/pr/card-walk.jpg',
    secondaryImage: '/site/ridgeline/stills/yours-desk.webp',
    whatYouCanDo: [
      'One link to the whole home, every storey',
      'Visitors walk through and look around; they can’t edit anything',
      'Your plans, account and history stay private',
      'Stop sharing any time; the old link stops working for good',
    ],
    howItWorks: [
      'Open your home and choose Share.',
      'Confirm that anyone with the link can view it.',
      'Copy the link and send it.',
    ],
    disclaimer:
      'ANYONE WITH THE LINK CAN VIEW THE HOME AND FORWARD THE LINK, SO SHARE IT WITH PEOPLE YOU TRUST.',
  },
};

const SLUG_ALIASES: Record<string, string> = {
  furnish: 'furniture',
  finishes: 'exterior-finishes',
  'edit-walls': 'walkthrough',
  daylight: 'sun-study',
  electrical: 'electrical-plans',
  renders: 'photoreal-renders',
  share: 'sharing',
};

export default async function FeatureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resolvedSlug = SLUG_ALIASES[slug] || slug;
  const feature = CANONICAL_FEATURES[resolvedSlug];
  if (!feature) {
    notFound();
  }

  return (
    <SiteChrome>
      <div className="rl-container" style={{ padding: '64px 24px 80px' }}>
        <Link
          href="/features"
          style={{
            display: 'inline-block',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            marginBottom: '20px',
          }}
        >
          ← All features
        </Link>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center',
            marginBottom: '48px',
          }}
        >
          <div>
            <span className="rl-eyebrow">{feature.eyebrow}</span>
            <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3.2rem)', marginBottom: '16px' }}>
              {feature.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.08rem', marginBottom: '28px' }}>
              {feature.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/build/new" className="rl-btn rl-btn-primary">
                Upload your floor plan →
              </Link>
              <Link href="/demo/try" className="rl-btn rl-btn-secondary">
                Try it in the 3D Demo
              </Link>
            </div>
          </div>

          <div className="rl-card" style={{ padding: '14px' }}>
            <img
              src={feature.heroImage}
              alt={feature.title}
              style={{ width: '100%', borderRadius: '10px', display: 'block' }}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '32px',
          }}
        >
          <div className="rl-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '14px' }}>WHAT YOU CAN DO</h2>
            <ul style={{ paddingLeft: '20px', display: 'grid', gap: '10px', color: 'var(--text-muted)' }}>
              {feature.whatYouCanDo.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="rl-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '14px' }}>HOW IT WORKS</h2>
            <ol style={{ paddingLeft: '20px', display: 'grid', gap: '10px', color: 'var(--text-muted)' }}>
              {feature.howItWorks.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div
          className="rl-card-tinted"
          style={{
            padding: '18px 24px',
            marginBottom: '40px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            color: 'var(--text-muted)',
          }}
        >
          {feature.disclaimer}
        </div>

        {feature.relatedGuide && (
          <div className="rl-card" style={{ marginBottom: '40px' }}>
            <span className="rl-eyebrow">GUIDES</span>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>
              <Link href={feature.relatedGuide.href}>{feature.relatedGuide.title}</Link>
            </h2>
            <Link
              href={feature.relatedGuide.href}
              style={{ color: 'var(--accent-forest)', fontWeight: 600, fontSize: '0.92rem' }}
            >
              Read the guide →
            </Link>
          </div>
        )}

        <div
          className="rl-card-tinted"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            alignItems: 'center',
          }}
        >
          <div>
            <span className="rl-eyebrow">TRY IT RIGHT NOW</span>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>
              Explore the Southern Farmhouse in your browser.
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Open our full two-storey demo home with zero sign-up required, or upload your
              own builder plan to get started.
            </p>
            <Link href="/demo/try" className="rl-btn rl-btn-primary">
              Launch 3D Studio Demo →
            </Link>
          </div>
          <img
            src={feature.secondaryImage}
            alt="Studio preview"
            style={{ width: '100%', borderRadius: '12px', display: 'block' }}
          />
        </div>
      </div>
    </SiteChrome>
  );
}
