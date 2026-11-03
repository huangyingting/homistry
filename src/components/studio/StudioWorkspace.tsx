'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export interface StudioRoom {
  id: string;
  name: string;
  type: string;
  floor: number;
  at?: [number, number];
  areaSqFt?: number;
  polygon: Array<[number, number]>;
}

export interface StudioWall {
  id: string;
  floor: number;
  a: [number, number];
  b: [number, number];
  thickness: number;
  exterior?: boolean;
  isRailing?: boolean;
}

export interface StudioOpening {
  id: string;
  floor: number;
  kind: 'window' | 'door' | 'sliding_door' | 'opening';
  wallId: string;
  offset: number;
  width: number;
  height: number;
  sill?: number;
  isOpen?: boolean;
}

export interface StudioFixture {
  id: string;
  floor: number;
  kind: string;
  min: [number, number];
  max: [number, number];
  height: number;
}

export interface StudioPiece {
  id: string;
  catalogId: string;
  name: string;
  category: string;
  floorIndex: number;
  roomKey?: string | null;
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  depth: number;
  height: number;
  colour: string;
}

export interface ElectricalMarker {
  id: string;
  type: 'gpo' | 'switch' | 'downlight' | 'pendant' | 'data';
  label: string;
  floor: number;
  x: number;
  z: number;
}

export interface FinishesState {
  interiorWalls: string;
  floors: string;
  floorMaterialName: string;
  outsideWalls: string;
  roof: string;
}

export interface SitePlanState {
  address: string;
  latitude: number;
  orientationDeg: number;
  season: 'summer' | 'equinox' | 'winter';
  hour: number;
}

const FLOOR_MATERIALS = [
  { label: 'Timber boards', hex: '#C8A986' },
  { label: 'Herringbone parquet', hex: '#BA946B' },
  { label: 'Hybrid / vinyl plank', hex: '#C4A882' },
  { label: 'Large tiles', hex: '#D8D5CE' },
  { label: 'Tiles', hex: '#CFCBC2' },
  { label: 'Carpet', hex: '#DDD7CD' },
  { label: 'Polished concrete', hex: '#B8B6B2' },
  { label: 'Marble', hex: '#EAE7E1' },
  { label: 'Stone pavers', hex: '#A9A49C' },
  { label: 'Timber decking', hex: '#9D734C' },
  { label: 'Epoxy flake coating', hex: '#AEB2B5' },
  { label: 'Epoxy coating, plain', hex: '#BEC2C4' },
  { label: 'Terrazzo', hex: '#D7D0C7' },
  { label: 'Terracotta tiles', hex: '#C27455' },
  { label: 'Mosaic tiles', hex: '#BFC9C6' },
  { label: 'Timber boards, real grain', hex: '#B9895B' },
  { label: 'Parquet, real grain', hex: '#A8794D' },
  { label: 'Tiles, real', hex: '#D3CFC6' },
];

const CATALOGUE_ITEMS = [
  { catalogId: 'sofa-2seat', name: '2-seat sofa', category: 'Sofas', width: 1.6, depth: 0.89, height: 0.84, colour: '#8C857B' },
  { catalogId: 'sofa-3seat', name: '3-seat sofa', category: 'Sofas', width: 2.1, depth: 0.89, height: 0.85, colour: '#756F67' },
  { catalogId: 'sofa-corner', name: 'Corner sofa', category: 'Sofas', width: 2.8, depth: 2.0, height: 0.85, colour: '#6E685F' },
  { catalogId: 'sofa-modular', name: 'Soft modular sofa', category: 'Sofas', width: 3.35, depth: 3.35, height: 0.82, colour: '#847C72' },
  { catalogId: 'sofa-low-mod', name: 'Low modular sofa', category: 'Sofas', width: 3.8, depth: 3.1, height: 0.78, colour: '#7D766D' },
  { catalogId: 'sofa-sectional', name: 'Classic sectional sofa', category: 'Sofas', width: 3.28, depth: 2.49, height: 0.85, colour: '#68635C' },
  { catalogId: 'armchair-occ', name: 'Occasional armchair', category: 'Armchairs', width: 0.85, depth: 0.85, height: 0.8, colour: '#A6754B' },
  { catalogId: 'armchair-linen', name: 'Swivel linen armchair', category: 'Armchairs', width: 0.9, depth: 0.9, height: 0.78, colour: '#C5BBAE' },
  { catalogId: 'coffee-oak', name: 'Oak coffee table', category: 'Coffee tables', width: 1.3, depth: 0.7, height: 0.42, colour: '#B9936C' },
  { catalogId: 'coffee-round', name: 'Round travertine table', category: 'Coffee tables', width: 1.0, depth: 1.0, height: 0.4, colour: '#D8D0C5' },
  { catalogId: 'side-table', name: 'Timber side table', category: 'Side tables', width: 0.5, depth: 0.5, height: 0.55, colour: '#9E7B56' },
  { catalogId: 'tv-unit', name: 'Low oak TV unit', category: 'TV units', width: 2.1, depth: 0.45, height: 0.52, colour: '#8E6B49' },
  { catalogId: 'shelving-open', name: 'Open bookcase shelving', category: 'Shelving', width: 1.6, depth: 0.38, height: 2.1, colour: '#967452' },
  { catalogId: 'kitchen-island', name: 'Kitchen island bench', category: 'Kitchens and robes', width: 2.4, depth: 1.0, height: 0.9, colour: '#D8D3CA' },
  { catalogId: 'kitchen-bench', name: 'Wall kitchen bench run', category: 'Kitchens and robes', width: 2.8, depth: 0.62, height: 0.9, colour: '#CFC9BE' },
  { catalogId: 'tall-pantry', name: 'Tall pantry & oven unit', category: 'Kitchens and robes', width: 1.2, depth: 0.65, height: 2.1, colour: '#B8B1A6' },
  { catalogId: 'built-in-robe', name: 'Built-in wardrobe run', category: 'Kitchens and robes', width: 2.2, depth: 0.6, height: 2.4, colour: '#DED9D0' },
  { catalogId: 'bed-king', name: 'King bed', category: 'Other rooms', width: 1.95, depth: 2.15, height: 1.1, colour: '#D8D2C9' },
  { catalogId: 'bed-queen', name: 'Queen bed', category: 'Other rooms', width: 1.65, depth: 2.15, height: 1.1, colour: '#DED8CE' },
  { catalogId: 'dining-8', name: '8-seat dining table', category: 'Other rooms', width: 2.4, depth: 1.05, height: 0.76, colour: '#8D6B48' },
  { catalogId: 'outdoor-set', name: 'Alfresco dining setting', category: 'Other rooms', width: 2.1, depth: 1.0, height: 0.75, colour: '#6B665E' },
];

const DEFAULT_ROOMS: StudioRoom[] = [
  { id: 'f1-r1', name: 'FAMILY ROOM', type: 'living', floor: 0, at: [-3.48, -5.14], areaSqFt: 187, polygon: [[-5.7, -6.3], [-1.2, -6.3], [-1.2, -3.1], [-5.7, -3.1]] },
  { id: 'f1-r2', name: 'LIVING ROOM', type: 'living', floor: 0, at: [-3.47, -0.39], areaSqFt: 185, polygon: [[-5.7, -3.1], [-1.2, -3.1], [-1.2, 1.8], [-5.7, 1.8]] },
  { id: 'f1-r3', name: 'CENTRAL HALL', type: 'hall', floor: 0, at: [0.43, -5.05], areaSqFt: 534, polygon: [[-1.2, -6.3], [2.2, -6.3], [2.2, -1.8], [-1.2, -1.8]] },
  { id: 'f1-r4', name: 'WC', type: 'bath', floor: 0, at: [3.02, -5.94], areaSqFt: 12, polygon: [[2.2, -6.3], [3.7, -6.3], [3.7, -5.1], [2.2, -5.1]] },
  { id: 'f1-r5', name: 'UTILITY ROOM', type: 'laundry', floor: 0, at: [3.18, -3.11], areaSqFt: 39, polygon: [[2.2, -5.1], [3.8, -5.1], [3.8, -1.8], [2.2, -1.8]] },
  { id: 'f1-r6', name: 'KITCHEN', type: 'kitchen', floor: 0, at: [5.23, -3.28], areaSqFt: 210, polygon: [[3.8, -6.3], [6.6, -6.3], [6.6, -1.8], [3.8, -1.8]] },
  { id: 'f1-r7', name: 'DINING ROOM', type: 'dining', floor: 0, at: [4.67, -0.39], areaSqFt: 195, polygon: [[2.2, -1.8], [6.6, -1.8], [6.6, 1.8], [2.2, 1.8]] },
  { id: 'f1-r11', name: 'FRONT PORCH', type: 'outdoor', floor: 0, at: [0.36, 3.8], areaSqFt: 533, polygon: [[-5.7, 1.8], [6.6, 1.8], [6.6, 4.4], [-5.7, 4.4]] },
  { id: 'f0-r1', name: 'BEDROOM 3', type: 'bedroom', floor: 1, at: [-3.52, -4.19], areaSqFt: 168, polygon: [[-5.7, -6.3], [-1.4, -6.3], [-1.4, -2.0], [-5.7, -2.0]] },
  { id: 'f0-r2', name: 'BEDROOM 2', type: 'bedroom', floor: 1, at: [-3.5, 0.3], areaSqFt: 164, polygon: [[-5.7, -2.0], [-1.4, -2.0], [-1.4, 1.8], [-5.7, 1.8]] },
  { id: 'f0-r11', name: 'MAIN BEDROOM', type: 'bedroom', floor: 1, at: [4.2, -0.2], areaSqFt: 224, polygon: [[2.1, -2.4], [6.6, -2.4], [6.6, 1.8], [2.1, 1.8]] },
  { id: 'f0-r7', name: 'ENSUITE BATH', type: 'bath', floor: 1, at: [5.6, -4.9], areaSqFt: 98, polygon: [[3.8, -6.3], [6.6, -6.3], [6.6, -2.4], [3.8, -2.4]] },
];

interface ParsedPlanGeometry {
  rooms: StudioRoom[];
  walls: StudioWall[];
  openings: StudioOpening[];
  fixtures: StudioFixture[];
}

function parsePlanGeometry(plan: Record<string, unknown> | null | undefined): ParsedPlanGeometry {
  if (!plan) {
    return { rooms: DEFAULT_ROOMS, walls: [], openings: [], fixtures: [] };
  }
  const rawFloors = (plan as {
    floors?: Array<{
      storey?: number;
      rooms?: Array<{ id?: string; name?: string; type?: string; at?: [number, number]; polygon?: Array<[number, number]> }>;
      walls?: Array<{ id: string; a: [number, number]; b: [number, number]; thickness?: number; exterior?: boolean }>;
      openings?: Array<{ id: string; kind: 'window' | 'door' | 'sliding_door' | 'opening'; wallId: string; offset: number; width: number; height: number; sill?: number }>;
      fixtures?: Array<{ id: string; kind: string; min: [number, number]; max: [number, number]; height?: number }>;
    }>;
  }).floors;

  if (!Array.isArray(rawFloors) || rawFloors.length === 0) {
    return { rooms: DEFAULT_ROOMS, walls: [], openings: [], fixtures: [] };
  }

  const rooms: StudioRoom[] = [];
  const walls: StudioWall[] = [];
  const openings: StudioOpening[] = [];
  const fixtures: StudioFixture[] = [];

  rawFloors.forEach((f, idx) => {
    const floorNum = typeof f.storey === 'number' ? f.storey : idx;

    if (Array.isArray(f.walls)) {
      f.walls.forEach(w => {
        if (Array.isArray(w.a) && Array.isArray(w.b)) {
          walls.push({
            id: w.id,
            floor: floorNum,
            a: [Number(w.a[0]), Number(w.a[1])],
            b: [Number(w.b[0]), Number(w.b[1])],
            thickness: Number(w.thickness || 0.15),
            exterior: Boolean(w.exterior),
          });
        }
      });
    }

    if (Array.isArray(f.openings)) {
      f.openings.forEach(o => {
        openings.push({
          id: o.id,
          floor: floorNum,
          kind: o.kind || 'window',
          wallId: o.wallId,
          offset: Number(o.offset || 0),
          width: Number(o.width || 0.9),
          height: Number(o.height || 2.1),
          sill: typeof o.sill === 'number' ? o.sill : 0,
          isOpen: false,
        });
      });
    }

    if (Array.isArray(f.fixtures)) {
      f.fixtures.forEach(fx => {
        if (Array.isArray(fx.min) && Array.isArray(fx.max)) {
          fixtures.push({
            id: fx.id,
            floor: floorNum,
            kind: fx.kind || 'kitchen_bench',
            min: [Number(fx.min[0]), Number(fx.min[1])],
            max: [Number(fx.max[0]), Number(fx.max[1])],
            height: Number(fx.height || 0.9),
          });
        }
      });
    }

    if (Array.isArray(f.rooms)) {
      const areaPresets: Record<string, number> = {
        'CENTRAL HALL': 534,
        'FRONT PORCH': 533,
        'SUNSET PORCH (SCREENED)': 201,
        'FAMILY ROOM': 187,
        'LIVING ROOM': 185,
        'BREAKFAST PORCH (SCREENED)': 141,
        'DINING ROOM': 135,
        'KITCHEN': 165,
        'UTILITY ROOM': 39,
        'STOOP': 25,
        'WC': 12,
        'MAIN BEDROOM': 224,
        'BEDROOM 3': 168,
        'BEDROOM 2': 164,
        'SITTING ROOM': 142,
        'ENSUITE BATH': 98,
      };
      f.rooms.forEach((r, rIdx) => {
        const atPos: [number, number] = Array.isArray(r.at) && r.at.length >= 2
          ? [Number(r.at[0]), Number(r.at[1])]
          : [0, 0];
        const poly: Array<[number, number]> =
          Array.isArray(r.polygon) && r.polygon.length >= 3
            ? r.polygon
            : [
                [atPos[0] - 1.9, atPos[1] - 1.6],
                [atPos[0] + 1.9, atPos[1] - 1.6],
                [atPos[0] + 1.9, atPos[1] + 1.6],
                [atPos[0] - 1.9, atPos[1] + 1.6],
              ];
        const rName = r.name || `Room ${rIdx + 1}`;
        rooms.push({
          id: r.id || `room-${floorNum}-${rIdx}`,
          name: rName,
          type: r.type || 'living',
          floor: floorNum,
          at: atPos,
          areaSqFt: areaPresets[rName.toUpperCase()] || 140,
          polygon: poly,
        });
      });
    }
  });

  return {
    rooms: rooms.length > 0 ? rooms : DEFAULT_ROOMS,
    walls,
    openings,
    fixtures,
  };
}

function getPolygonBounds(poly: Array<[number, number]>) {
  const xs = poly.map(p => p[0]);
  const ys = poly.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: Math.max(1.2, maxX - minX),
    depth: Math.max(1.2, maxY - minY),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  };
}

export function StudioWorkspace({
  buildId,
  initialTitle = 'SOUTHERN FARMHOUSE (DEMO)',
  initialPlan,
  initialPieces = [],
  initialUnit = 'm',
  initialStoreys = 2,
  viewOnly = false,
  isDemo = false,
}: {
  buildId?: string;
  initialTitle?: string;
  initialPlan?: Record<string, unknown> | null;
  initialPieces?: StudioPiece[];
  initialUnit?: 'm' | 'ft';
  initialStoreys?: number;
  viewOnly?: boolean;
  isDemo?: boolean;
}) {
  const initialGeometry = useMemo(() => parsePlanGeometry(initialPlan), [initialPlan]);

  const [activeTab, setActiveTab] = useState<'Home' | 'Furnish' | 'Decorate' | 'Edit' | 'Settings'>('Home');
  const [floorFilter, setFloorFilter] = useState<'whole' | 'upper' | 'ground'>('whole');
  const [showRoof, setShowRoof] = useState(false);
  const [showRoomNames, setShowRoomNames] = useState(true);
  const [showPlanDrawingSheet, setShowPlanDrawingSheet] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'plan' | 'split' | 'walkthrough' | 'measure'>('3d');
  const [classicLook, setClassicLook] = useState(false);
  const [classicSubTab, setClassicSubTab] = useState<'sun' | 'electrical' | 'renders' | 'versions'>('sun');
  const [editTool, setEditTool] = useState<'select' | 'add_wall' | 'add_door' | 'add_window' | 'add_railing' | 'add_post' | 'edit_rooms'>('select');
  const [doorKind, setDoorKind] = useState<'door' | 'wide_door' | 'double_door' | 'sliding_door' | 'garage_door'>('door');
  const [windowKind, setWindowKind] = useState<'small_window' | 'window' | 'wide_window' | 'picture_window'>('window');
  const [decorateSection, setDecorateSection] = useState<'Floors' | 'Walls' | 'Outside' | 'Roof' | 'Trims' | 'Gutter' | 'Fence'>('Floors');
  const [decorateTargetRoom, setDecorateTargetRoom] = useState<string>('ALL');
  const [trimStyle, setTrimStyle] = useState<'painted' | 'oak' | 'walnut'>('painted');
  const [gutterStyle, setGutterStyle] = useState<'quad' | 'half_round' | 'box'>('quad');
  const [fenceStyle, setFenceStyle] = useState<'none' | 'timber' | 'colorbond' | 'brick'>('timber');
  const [aiRoomLoading, setAiRoomLoading] = useState(false);
  const [reportIssueText, setReportIssueText] = useState('');
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  const [unit, setUnit] = useState<'m' | 'ft'>(initialUnit);
  const [storeys] = useState(initialStoreys);
  const [homeTitle, setHomeTitle] = useState(initialTitle);
  const [ceilingGroundM, setCeilingGroundM] = useState(2.7);
  const [ceilingUpperM, setCeilingUpperM] = useState(2.55);
  const [roofType, setRoofType] = useState<'gable' | 'hip' | 'flat'>('gable');

  const [rooms, setRooms] = useState<StudioRoom[]>(initialGeometry.rooms);
  const [walls, setWalls] = useState<StudioWall[]>(initialGeometry.walls);
  const [openings, setOpenings] = useState<StudioOpening[]>(initialGeometry.openings);
  const [fixtures, setFixtures] = useState<StudioFixture[]>(initialGeometry.fixtures);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialGeometry.rooms[0]?.id || DEFAULT_ROOMS[0].id);

  const [pieces, setPieces] = useState<StudioPiece[]>(
    initialPieces.length > 0
      ? initialPieces
      : [
          {
            id: 'demo-sofa-1',
            catalogId: 'sofa-3seat',
            name: '3-seat sofa',
            category: 'Sofas',
            floorIndex: 0,
            roomKey: 'f1-r1',
            x: -3.5,
            y: 0,
            z: -4.8,
            rotation: 0,
            width: 2.1,
            depth: 0.89,
            height: 0.85,
            colour: '#756F67',
          },
          {
            id: 'demo-dining-1',
            catalogId: 'dining-8',
            name: '8-seat dining table',
            category: 'Other rooms',
            floorIndex: 0,
            roomKey: 'f1-r7',
            x: 4.7,
            y: 0,
            z: -0.4,
            rotation: 0,
            width: 2.4,
            depth: 1.05,
            height: 0.76,
            colour: '#8D6B48',
          },
          {
            id: 'demo-bed-1',
            catalogId: 'bed-king',
            name: 'King bed',
            category: 'Other rooms',
            floorIndex: 1,
            roomKey: 'f0-r11',
            x: 4.2,
            y: 0,
            z: -0.2,
            rotation: 0,
            width: 1.95,
            depth: 2.15,
            height: 1.1,
            colour: '#D8D2C9',
          },
        ]
  );
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [furnishSearch, setFurnishSearch] = useState('');
  const [furnishCategory, setFurnishCategory] = useState('All');

  const [finishes, setFinishes] = useState<FinishesState>({
    interiorWalls: '#F5F2EB',
    floors: '#C8A986',
    floorMaterialName: 'Timber boards',
    outsideWalls: '#EAE4DC',
    roof: '#3B4245',
  });

  const [sitePlan, setSitePlan] = useState<SitePlanState>({
    address: '42 Ridgeline Crescent, Melbourne VIC',
    latitude: -37.81,
    orientationDeg: 15,
    season: 'winter',
    hour: 10.0,
  });

  const [electricalItems, setElectricalItems] = useState<ElectricalMarker[]>([
    { id: 'el-1', type: 'gpo', label: 'Double Power Point (GPO)', floor: 0, x: -3.2, z: -5.2 },
    { id: 'el-2', type: 'switch', label: 'Light Switch', floor: 0, x: 0.4, z: -4.2 },
    { id: 'el-3', type: 'pendant', label: 'Island Pendant', floor: 0, x: 5.2, z: -3.4 },
    { id: 'el-4', type: 'downlight', label: 'Recessed Downlight', floor: 0, x: -3.4, z: -0.5 },
  ]);
  const [activeElectricalTool, setActiveElectricalTool] = useState<ElectricalMarker['type']>('gpo');

  const [renders, setRenders] = useState<
    Array<{ id: string; roomName: string; style: string; imageUrl: string }>
  >([
    {
      id: 'sample-render-1',
      roomName: 'Kitchen & Pantry',
      style: 'Morning Architectural Daylight',
      imageUrl: '/site/ridgeline/pr/kitchen-b.jpg',
    },
  ]);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Edited'>('Saved');
  const [cameraYaw, setCameraYaw] = useState<number>(-28);
  const [cameraZoom, setCameraZoom] = useState<number>(1);
  const [walkPosition, setWalkPosition] = useState<[number, number]>([0.4, 2.2]);
  const [measurePoints, setMeasurePoints] = useState<Array<[number, number]>>([]);

  // Load Southern Farmhouse geometry if walls weren't passed in initialPlan
  useEffect(() => {
    if (walls.length === 0) {
      fetch('/demos/southern-farmhouse/plan.json')
        .then(r => (r.ok ? r.json() : null))
        .then(planData => {
          if (!planData) return;
          const parsed = parsePlanGeometry(planData);
          if (parsed.walls.length > 0) {
            setWalls(parsed.walls);
            setOpenings(parsed.openings);
            setFixtures(parsed.fixtures);
            if (rooms === DEFAULT_ROOMS) {
              setRooms(parsed.rooms);
              if (parsed.rooms[0]) setSelectedRoomId(parsed.rooms[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [walls.length, rooms]);

  useEffect(() => {
    if (!buildId || isDemo) return;
    fetch(`/api/live/${buildId}/design`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        if (data.plan) {
          const parsed = parsePlanGeometry(data.plan);
          setRooms(parsed.rooms);
          if (parsed.walls.length > 0) setWalls(parsed.walls);
          if (parsed.openings.length > 0) setOpenings(parsed.openings);
          if (parsed.fixtures.length > 0) setFixtures(parsed.fixtures);
        }
        if (Array.isArray(data.pieces) && data.pieces.length > 0) {
          setPieces(data.pieces);
        }
        if (data.finishes && Object.keys(data.finishes).length > 0) {
          setFinishes(prev => ({ ...prev, ...data.finishes }));
        }
        if (Array.isArray(data.electrical) && data.electrical.length > 0) {
          setElectricalItems(data.electrical);
        }
        if (data.activeShareToken) {
          setShareUrl(`/share/${data.activeShareToken}`);
        }
      })
      .catch(() => {});
  }, [buildId, isDemo]);

  // Keyboard support for Walk through mode (WASD, Arrows, E for doors, Escape to leave)
  useEffect(() => {
    if (viewMode !== 'walkthrough') return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setViewMode('3d');
      } else if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
        setWalkPosition(([x, z]) => [x, Number((z - 0.6).toFixed(2))]);
      } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
        setWalkPosition(([x, z]) => [x, Number((z + 0.6).toFixed(2))]);
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        setCameraYaw(prev => prev - 15);
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        setCameraYaw(prev => prev + 15);
      } else if (e.key === 'e' || e.key === 'E') {
        setOpenings(prev =>
          prev.map((o, idx) => (o.kind === 'door' && idx === 0 ? { ...o, isOpen: !o.isOpen } : o))
        );
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode]);

  const visibleRooms = useMemo(() => {
    return rooms.filter(r => {
      if (floorFilter === 'ground') return r.floor === 0;
      if (floorFilter === 'upper') return r.floor === 1;
      return true;
    });
  }, [rooms, floorFilter]);

  const visibleWalls = useMemo(() => {
    return walls.filter(w => {
      if (floorFilter === 'ground') return w.floor === 0;
      if (floorFilter === 'upper') return w.floor === 1;
      return true;
    });
  }, [walls, floorFilter]);

  const visibleOpenings = useMemo(() => {
    return openings.filter(o => {
      if (floorFilter === 'ground') return o.floor === 0;
      if (floorFilter === 'upper') return o.floor === 1;
      return true;
    });
  }, [openings, floorFilter]);

  const visibleFixtures = useMemo(() => {
    return fixtures.filter(fx => {
      if (floorFilter === 'ground') return fx.floor === 0;
      if (floorFilter === 'upper') return fx.floor === 1;
      return true;
    });
  }, [fixtures, floorFilter]);

  const visiblePieces = useMemo(() => {
    return pieces.filter(p => {
      if (floorFilter === 'ground') return p.floorIndex === 0;
      if (floorFilter === 'upper') return p.floorIndex === 1;
      return true;
    });
  }, [pieces, floorFilter]);

  const filteredCatalogue = useMemo(() => {
    return CATALOGUE_ITEMS.filter(item => {
      const matchesCat = furnishCategory === 'All' || item.category === furnishCategory;
      const matchesQuery =
        !furnishSearch.trim() ||
        item.name.toLowerCase().includes(furnishSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(furnishSearch.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [furnishCategory, furnishSearch]);

  const selectedPiece = useMemo(
    () => pieces.find(p => p.id === selectedPieceId) || null,
    [pieces, selectedPieceId]
  );

  // Coordinate mapping from metres [-8..9, -8..5] -> SVG [0..840, 0..680]
  function toSvgX(xMeters: number): number {
    return 390 + xMeters * 42;
  }
  function toSvgY(zMeters: number): number {
    return 410 + zMeters * 42;
  }

  function formatLength(meters: number): string {
    if (unit === 'ft') {
      const totalInches = Math.round(meters * 39.3701);
      const feet = Math.floor(totalInches / 12);
      const inches = totalInches % 12;
      return `${feet}'${inches}"`;
    }
    return `${meters.toFixed(2)} m`;
  }

  function formatHourLabel(hour: number): string {
    const whole = Math.floor(hour);
    const mins = Math.round((hour - whole) * 60);
    const suffix = whole >= 12 ? 'pm' : 'am';
    const h12 = whole > 12 ? whole - 12 : whole === 0 ? 12 : whole;
    return `${h12}:${mins.toString().padStart(2, '0')} ${suffix}`;
  }

  async function handleAiRoomDesigner() {
    if (viewOnly) return;
    setAiRoomLoading(true);
    try {
      const targetFloor = floorFilter === 'upper' ? 1 : 0;
      const targetRoom =
        rooms.find(r => r.id === selectedRoomId) ||
        rooms.find(r => r.floor === targetFloor) ||
        rooms[0];
      const centerPos: [number, number] = targetRoom?.at || [0, -2];
      const id = buildId || 'demo';
      await fetch(`/api/live/${encodeURIComponent(id)}/room-style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: targetRoom?.name || 'LIVING ROOM',
          style: 'Warm Australian Contemporary',
        }),
      }).catch(() => null);

      const styledPieces: StudioPiece[] = [
        {
          id: `ai-sofa-${Date.now()}`,
          catalogId: 'sofa-3seat',
          name: '3-seat sofa',
          category: 'Sofas',
          floorIndex: targetFloor,
          roomKey: targetRoom?.id || null,
          x: Number(centerPos[0].toFixed(2)),
          y: 0,
          z: Number(centerPos[1].toFixed(2)),
          rotation: 0,
          width: 2.1,
          depth: 0.89,
          height: 0.85,
          colour: '#756F67',
        },
        {
          id: `ai-coffee-${Date.now() + 1}`,
          catalogId: 'coffee-oak',
          name: 'Oak coffee table',
          category: 'Coffee tables',
          floorIndex: targetFloor,
          roomKey: targetRoom?.id || null,
          x: Number(centerPos[0].toFixed(2)),
          y: 0,
          z: Number((centerPos[1] + 1.1).toFixed(2)),
          rotation: 0,
          width: 1.3,
          depth: 0.7,
          height: 0.42,
          colour: '#B9936C',
        },
      ];
      setPieces(prev => [...prev, ...styledPieces]);
      setSaveStatus('Edited');
    } finally {
      setAiRoomLoading(false);
    }
  }

  async function handleAddPieceFromPhoto(file: File | null) {
    if (!file || viewOnly) return;
    const id = buildId || 'demo';
    const fd = new FormData();
    fd.set('photo', file, file.name);
    const res = await fetch(`/api/live/${encodeURIComponent(id)}/photo-piece`, {
      method: 'POST',
      body: fd,
    }).catch(() => null);
    const data = res && res.ok ? await res.json() : null;
    const targetFloor = floorFilter === 'upper' ? 1 : 0;
    const newPiece: StudioPiece = {
      id: `photo-piece-${Date.now()}`,
      catalogId: 'custom-photo',
      name: data?.piece?.name || file.name.replace(/\.[^.]+$/, '') || 'Custom photo piece',
      category: 'Sofas',
      floorIndex: targetFloor,
      roomKey: selectedRoomId,
      x: 0.5,
      y: 0,
      z: -2.0,
      rotation: 0,
      width: 1.2,
      depth: 0.85,
      height: 0.82,
      colour: '#9C826B',
    };
    setPieces(prev => [...prev, newPiece]);
    setSelectedPieceId(newPiece.id);
    setSaveStatus('Edited');
  }

  async function handleSmartElectricalAuto() {
    if (viewOnly) return;
    const autoPoints: ElectricalMarker[] = rooms.slice(0, 6).flatMap((r, idx) => {
      const pos = r.at || [0, -2];
      return [
        {
          id: `auto-dl-${idx}-${Date.now()}`,
          type: 'downlight' as const,
          label: `${r.name} LED Downlight`,
          floor: r.floor,
          x: Number(pos[0].toFixed(1)),
          z: Number(pos[1].toFixed(1)),
        },
        {
          id: `auto-gpo-${idx}-${Date.now()}`,
          type: 'gpo' as const,
          label: `${r.name} Double Power Point`,
          floor: r.floor,
          x: Number((pos[0] + 1.1).toFixed(1)),
          z: Number((pos[1] - 0.8).toFixed(1)),
        },
      ];
    });
    setElectricalItems(autoPoints);
    if (buildId && !isDemo) {
      await fetch(`/api/live/${buildId}/smart-electrical`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: autoPoints }),
      });
    }
  }

  async function handleAddFurniture(item: (typeof CATALOGUE_ITEMS)[number]) {
    if (viewOnly) return;
    const targetFloor = floorFilter === 'upper' ? 1 : 0;
    const targetRoom =
      rooms.find(r => r.id === selectedRoomId) ||
      rooms.find(r => r.floor === targetFloor) ||
      rooms[0];
    const centerPos: [number, number] = targetRoom?.at
      ? targetRoom.at
      : (() => {
          const b = targetRoom ? getPolygonBounds(targetRoom.polygon) : { cx: 0, cy: -2 };
          return [b.cx, b.cy];
        })();

    const newPiece: StudioPiece = {
      id: `piece-${Date.now()}`,
      catalogId: item.catalogId,
      name: item.name,
      category: item.category,
      floorIndex: targetFloor,
      roomKey: targetRoom?.id || null,
      x: Number(centerPos[0].toFixed(2)),
      y: 0,
      z: Number(centerPos[1].toFixed(2)),
      rotation: 0,
      width: item.width,
      depth: item.depth,
      height: item.height,
      colour: item.colour,
    };

    setPieces(prev => [...prev, newPiece]);
    setSelectedPieceId(newPiece.id);
    setSaveStatus('Edited');

    if (buildId && !isDemo) {
      setSaveStatus('Saving...');
      const res = await fetch(`/api/live/${buildId}/pieces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPiece),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.piece) {
          setPieces(prev => prev.map(p => (p.id === newPiece.id ? data.piece : p)));
          setSelectedPieceId(data.piece.id);
        }
        setSaveStatus('Saved');
      }
    }
  }

  async function handleUpdateSelectedPiece(patch: Partial<StudioPiece>) {
    if (!selectedPiece || viewOnly) return;
    const updated = { ...selectedPiece, ...patch };
    setPieces(prev => prev.map(p => (p.id === selectedPiece.id ? updated : p)));
    setSaveStatus('Edited');

    if (buildId && !isDemo) {
      await fetch(`/api/live/${buildId}/pieces`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieceId: selectedPiece.id, ...patch }),
      });
      setSaveStatus('Saved');
    }
  }

  async function handleDuplicateSelectedPiece() {
    if (!selectedPiece || viewOnly) return;
    const copy: StudioPiece = {
      ...selectedPiece,
      id: `piece-${Date.now()}`,
      x: Number((selectedPiece.x + selectedPiece.width * 0.6).toFixed(2)),
      z: Number((selectedPiece.z + 0.4).toFixed(2)),
    };
    setPieces(prev => [...prev, copy]);
    setSelectedPieceId(copy.id);
    setSaveStatus('Edited');
  }

  async function handleDeleteSelectedPiece() {
    if (!selectedPiece || viewOnly) return;
    const idToRemove = selectedPiece.id;
    setPieces(prev => prev.filter(p => p.id !== idToRemove));
    setSelectedPieceId(null);
    if (buildId && !isDemo) {
      await fetch(`/api/live/${buildId}/pieces?pieceId=${encodeURIComponent(idToRemove)}`, {
        method: 'DELETE',
      });
    }
  }

  async function handleSaveDesign(saveVersion = false) {
    if (viewOnly) return;
    setSaveStatus('Saving...');
    if (buildId && !isDemo) {
      await fetch(`/api/live/${buildId}/design`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: homeTitle,
          unit,
          roofType,
          ceilingGroundM,
          ceilingUpperM,
          finishes,
          plan: {
            floors: [
              {
                id: 'f1',
                name: '1ST FLOOR PLAN',
                storey: 0,
                rooms: rooms.filter(r => r.floor === 0),
                walls: walls.filter(w => w.floor === 0),
                openings: openings.filter(o => o.floor === 0),
                fixtures: fixtures.filter(fx => fx.floor === 0),
              },
              {
                id: 'f0',
                name: '2ND FLOOR PLAN',
                storey: 1,
                rooms: rooms.filter(r => r.floor === 1),
                walls: walls.filter(w => w.floor === 1),
                openings: openings.filter(o => o.floor === 1),
                fixtures: fixtures.filter(fx => fx.floor === 1),
              },
            ],
          },
          saveVersion,
        }),
      });
    }
    setSaveStatus('Saved');
  }

  function handleAddRoomWall() {
    if (viewOnly) return;
    const floorIdx = floorFilter === 'upper' ? 1 : 0;
    const newWall: StudioWall = {
      id: `wall-${Date.now()}`,
      floor: floorIdx,
      a: [-1.2, -3.1],
      b: [2.2, -3.1],
      thickness: 0.12,
      exterior: false,
      isRailing: editTool === 'add_railing',
    };
    setWalls(prev => [...prev, newWall]);
    const newRoom: StudioRoom = {
      id: `study-nook-${Date.now()}`,
      name: `Study Nook ${rooms.length + 1}`,
      type: 'study',
      floor: floorIdx,
      at: [0.5, -2.5],
      areaSqFt: 85,
      polygon: [
        [-1.2, -3.5],
        [2.2, -3.5],
        [2.2, -1.5],
        [-1.2, -1.5],
      ],
    };
    setRooms(prev => [...prev, newRoom]);
    setSelectedRoomId(newRoom.id);
    setSaveStatus('Edited');
  }

  function handleAddOpening(kind: 'door' | 'window') {
    if (viewOnly) return;
    const floorIdx = floorFilter === 'upper' ? 1 : 0;
    const targetWall = walls.find(w => w.floor === floorIdx) || walls[0];
    if (!targetWall) return;
    const newOpening: StudioOpening = {
      id: `op-${Date.now()}`,
      floor: floorIdx,
      kind,
      wallId: targetWall.id,
      offset: 1.2,
      width: kind === 'door' ? 0.85 : 1.2,
      height: 2.1,
      sill: kind === 'window' ? 0.9 : 0,
      isOpen: false,
    };
    setOpenings(prev => [...prev, newOpening]);
    setSaveStatus('Edited');
  }

  async function handleAddElectricalMarker() {
    if (viewOnly) return;
    const labels: Record<ElectricalMarker['type'], string> = {
      gpo: 'Double Power Point (GPO)',
      switch: 'Light Switch',
      downlight: 'LED Downlight',
      pendant: 'Feature Pendant',
      data: 'Data / Ethernet Point',
    };
    const nextItem: ElectricalMarker = {
      id: `el-${Date.now()}`,
      type: activeElectricalTool,
      label: labels[activeElectricalTool],
      floor: floorFilter === 'upper' ? 1 : 0,
      x: Number((-3 + Math.random() * 7).toFixed(1)),
      z: Number((-5 + Math.random() * 5).toFixed(1)),
    };
    const updated = [...electricalItems, nextItem];
    setElectricalItems(updated);
    if (buildId && !isDemo) {
      await fetch(`/api/live/${buildId}/smart-electrical`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updated }),
      });
    }
  }

  function handleDownloadElectricalCsv() {
    const header = 'ID,Type,Label,Floor,X_m,Z_m\n';
    const rows = electricalItems
      .map(i => `${i.id},${i.type},"${i.label}",${i.floor === 1 ? 'Upper' : 'Ground'},${i.x},${i.z}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${homeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-electrical-schedule.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleGenerateRender() {
    if (viewOnly) return;
    const activeRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];
    if (buildId && !isDemo) {
      const res = await fetch(`/api/live/${buildId}/frame-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: activeRoom?.name || 'Living room',
          style: 'Daylight architectural',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.render) {
          setRenders(prev => [data.render, ...prev]);
          return;
        }
      }
    }
    setRenders(prev => [
      {
        id: `render-${Date.now()}`,
        roomName: activeRoom?.name || 'LIVING ROOM',
        style: 'Daylight architectural',
        imageUrl: '/site/ridgeline/pr/living-b.jpg',
      },
      ...prev,
    ]);
  }

  async function handleEmailRender(renderId: string) {
    if (buildId && !isDemo) {
      await fetch(`/api/live/${buildId}/email-picture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ renderId }),
      });
    }
    setEmailStatus('Render link queued for email delivery');
    setTimeout(() => setEmailStatus(null), 3000);
  }

  async function handleCreateShareLink() {
    if (!buildId || isDemo) {
      setShareUrl('/demo/try');
      return;
    }
    const res = await fetch(`/api/live/${buildId}/share`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setShareUrl(data.shareUrl);
    }
  }

  async function handleRevokeShareLink() {
    if (!buildId || isDemo) {
      setShareUrl(null);
      return;
    }
    await fetch(`/api/live/${buildId}/share`, { method: 'DELETE' });
    setShareUrl(null);
  }

  function handleCanvasClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xMeters = (((e.clientX - rect.left) / rect.width) * 840 - 390) / 42;
    const zMeters = (((e.clientY - rect.top) / rect.height) * 680 - 410) / 42;

    if (viewMode === 'measure') {
      setMeasurePoints(prev =>
        prev.length >= 2 ? [[xMeters, zMeters]] : [...prev, [xMeters, zMeters]]
      );
      return;
    }

    if (activeTab === 'Edit' && !viewOnly) {
      if (editTool === 'add_wall' || editTool === 'add_railing') {
        handleAddRoomWall();
      } else if (editTool === 'add_door') {
        handleAddOpening('door');
      } else if (editTool === 'add_window') {
        handleAddOpening('window');
      }
    }
  }

  const measuredDistance = useMemo(() => {
    if (measurePoints.length < 2) return null;
    const dx = measurePoints[1][0] - measurePoints[0][0];
    const dy = measurePoints[1][1] - measurePoints[0][1];
    return Math.sqrt(dx * dx + dy * dy);
  }, [measurePoints]);

  function renderArchitecturalSvg(modeOverride?: '3d' | 'plan') {
    const effectiveMode = modeOverride || (viewMode === 'split' ? '3d' : viewMode);
    const isFlatPlan = effectiveMode === 'plan' || effectiveMode === 'measure';
    const sheetImage =
      floorFilter === 'upper'
        ? '/demos/southern-farmhouse/page-2.png'
        : '/demos/southern-farmhouse/page-1.png';

    return (
      <svg
        viewBox="0 0 840 680"
        onClick={handleCanvasClick}
        style={{
          width: viewMode === 'split' ? '96%' : '90%',
          height: '84%',
          maxWidth: '980px',
          transform: isFlatPlan
            ? `scale(${cameraZoom})`
            : `perspective(1150px) rotateX(${
                effectiveMode === 'walkthrough' ? 72 : 48
              }deg) rotateZ(${cameraYaw}deg) scale(${cameraZoom})`,
          transition: 'transform 0.25s ease',
          cursor: viewMode === 'measure' ? 'crosshair' : 'grab',
        }}
      >
        {/* Optional Original Floor Plan Drawing Underlay */}
        {(showPlanDrawingSheet || isFlatPlan) && (
          <image
            href={sheetImage}
            x="90"
            y="40"
            width="660"
            height="560"
            opacity={showPlanDrawingSheet ? 0.42 : 0.16}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* Lot Compass & Sun Direction Indicator */}
        <g transform="translate(765, 68)">
          <circle
            cx="0"
            cy="0"
            r="32"
            fill={nightMode ? '#252830' : '#FAF8F5'}
            stroke="#D1C9BE"
            strokeWidth="1.5"
          />
          <text
            x="0"
            y="-14"
            textAnchor="middle"
            fontSize="11"
            fontFamily="monospace"
            fill={nightMode ? '#FAF8F5' : '#1F1E1C'}
          >
            N
          </text>
          <circle
            cx={Math.cos(((sitePlan.hour - 12) * 15 * Math.PI) / 180) * 22}
            cy={Math.sin(((sitePlan.hour - 12) * 15 * Math.PI) / 180) * 22}
            r="7"
            fill={nightMode ? '#9EA8C8' : '#E09F3E'}
          />
        </g>

        {/* Render Room Floor Zones & Labels */}
        {visibleRooms.map(room => {
          const b = getPolygonBounds(room.polygon);
          const x = toSvgX(b.minX);
          const y = toSvgY(b.minY);
          const w = b.width * 42;
          const h = b.depth * 42;
          const labelX = room.at ? toSvgX(room.at[0]) : x + w / 2;
          const labelY = room.at ? toSvgY(room.at[1]) : y + h / 2;
          const isSelected = room.id === selectedRoomId;
          const floorOffset = room.floor === 1 && floorFilter === 'whole' && !isFlatPlan ? -14 : 0;

          return (
            <g
              key={room.id}
              transform={`translate(${floorOffset}, ${floorOffset})`}
              onClick={ev => {
                ev.stopPropagation();
                setSelectedRoomId(room.id);
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* Room Floor Slab */}
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={finishes.floors}
                fillOpacity={room.floor === 1 && floorFilter === 'whole' ? 0.72 : 0.92}
                stroke={isSelected ? '#3B4B44' : 'rgba(31,30,28,0.18)'}
                strokeWidth={isSelected ? 3.5 : 1}
                rx="2"
              />

              {/* Room Labels */}
              {showRoomNames && (
                <g>
                  <text
                    x={labelX}
                    y={labelY - 3}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill="#1F1E1C"
                  >
                    {room.name}
                  </text>
                  <text
                    x={labelX}
                    y={labelY + 11}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fill="#4A4743"
                  >
                    {unit === 'ft' && room.areaSqFt
                      ? `${room.areaSqFt} sq ft`
                      : `${formatLength(b.width)} × ${formatLength(b.depth)}`}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Render Kitchen Benches & Tall Cabinets from plan.json */}
        {visibleFixtures.map(fx => {
          const x = toSvgX(fx.min[0]);
          const y = toSvgY(fx.min[1]);
          const w = Math.max(8, (fx.max[0] - fx.min[0]) * 42);
          const h = Math.max(8, (fx.max[1] - fx.min[1]) * 42);
          return (
            <g key={fx.id}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={fx.kind === 'tall_cabinet' ? '#B8B1A6' : '#E5E0D6'}
                stroke="#4A4743"
                strokeWidth="1.5"
                rx="2"
              />
            </g>
          );
        })}

        {/* Render All Architectural Wall Segments from plan.json */}
        {visibleWalls.map(wall => {
          const x1 = toSvgX(wall.a[0]);
          const y1 = toSvgY(wall.a[1]);
          const x2 = toSvgX(wall.b[0]);
          const y2 = toSvgY(wall.b[1]);
          const floorOffset = wall.floor === 1 && floorFilter === 'whole' && !isFlatPlan ? -14 : 0;
          const strokeW = Math.max(3, wall.thickness * 34);

          return (
            <g key={wall.id} transform={`translate(${floorOffset}, ${floorOffset})`}>
              {!isFlatPlan && (
                <line
                  x1={x1 + 4}
                  y1={y1 + 6}
                  x2={x2 + 4}
                  y2={y2 + 6}
                  stroke="rgba(31,30,28,0.18)"
                  strokeWidth={strokeW + 2}
                  strokeLinecap="square"
                />
              )}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={wall.exterior ? finishes.outsideWalls : finishes.interiorWalls}
                strokeWidth={strokeW + 2}
                strokeLinecap="square"
              />
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={wall.isRailing ? '#6A655E' : '#2C2A27'}
                strokeWidth={wall.isRailing ? 2 : strokeW * 0.65}
                strokeDasharray={wall.isRailing ? '5 4' : undefined}
                strokeLinecap="square"
              />
            </g>
          );
        })}

        {/* Render All Doors, Windows & Sliding Doors along Walls */}
        {visibleOpenings.map(op => {
          const parentWall = walls.find(w => w.id === op.wallId);
          if (!parentWall) return null;
          const dx = parentWall.b[0] - parentWall.a[0];
          const dz = parentWall.b[1] - parentWall.a[1];
          const wallLen = Math.hypot(dx, dz) || 1;
          const ux = dx / wallLen;
          const uz = dz / wallLen;
          const startX = toSvgX(parentWall.a[0] + ux * (op.offset - op.width / 2));
          const startY = toSvgY(parentWall.a[1] + uz * (op.offset - op.width / 2));
          const endX = toSvgX(parentWall.a[0] + ux * (op.offset + op.width / 2));
          const endY = toSvgY(parentWall.a[1] + uz * (op.offset + op.width / 2));
          const isDoor = op.kind === 'door' || op.kind === 'sliding_door';

          return (
            <g
              key={op.id}
              onClick={ev => {
                if (isDoor) {
                  ev.stopPropagation();
                  setOpenings(prev =>
                    prev.map(item =>
                      item.id === op.id ? { ...item, isOpen: !item.isOpen } : item
                    )
                  );
                }
              }}
              style={{ cursor: isDoor ? 'pointer' : 'default' }}
            >
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={op.kind === 'window' ? '#7BB2D9' : op.isOpen ? '#2E6B4E' : '#C86D51'}
                strokeWidth={op.kind === 'window' ? 5 : 4}
              />
            </g>
          );
        })}

        {/* Render Placed Furniture Pieces */}
        {visiblePieces.map(piece => {
          const px = toSvgX(piece.x) - (piece.width * 42) / 2;
          const py = toSvgY(piece.z) - (piece.depth * 42) / 2;
          const pw = piece.width * 42;
          const ph = piece.depth * 42;
          const isSelected = piece.id === selectedPieceId;

          return (
            <g
              key={piece.id}
              transform={`rotate(${piece.rotation}, ${px + pw / 2}, ${py + ph / 2})`}
              onClick={ev => {
                ev.stopPropagation();
                setSelectedPieceId(piece.id);
                setActiveTab('Furnish');
              }}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={px + 2}
                y={py + 3}
                width={pw}
                height={ph}
                fill="rgba(0,0,0,0.18)"
                rx="4"
              />
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                fill={piece.colour}
                stroke={isSelected ? '#C86D51' : '#1F1E1C'}
                strokeWidth={isSelected ? 3 : 1.5}
                rx="4"
              />
              <text
                x={px + pw / 2}
                y={py + ph / 2 + 3}
                textAnchor="middle"
                fontSize="9"
                fill="#FAF8F5"
              >
                {piece.name}
              </text>
            </g>
          );
        })}

        {/* Render Electrical Markers when Classic Electrical is active */}
        {classicLook &&
          electricalItems.map(el => (
            <g key={el.id} transform={`translate(${toSvgX(el.x)}, ${toSvgY(el.z)})`}>
              <circle cx="0" cy="0" r="8" fill="#C86D51" stroke="#FAF8F5" strokeWidth="2" />
              <text x="0" y="3" textAnchor="middle" fontSize="7.5" fill="#FAF8F5" fontWeight="700">
                {el.type.slice(0, 2).toUpperCase()}
              </text>
            </g>
          ))}

        {/* Render Walk-through Avatar Marker */}
        {viewMode === 'walkthrough' && (
          <g transform={`translate(${toSvgX(walkPosition[0])}, ${toSvgY(walkPosition[1])})`}>
            <circle cx="0" cy="0" r="9" fill="#3B4B44" stroke="#FAF8F5" strokeWidth="2.5" />
          </g>
        )}

        {/* Render Roof Overlay when toggled */}
        {showRoof && (
          <g opacity="0.82">
            <rect
              x="140"
              y="130"
              width="560"
              height="380"
              fill={finishes.roof}
              stroke="#1F1E1C"
              strokeWidth="4"
              rx="6"
            />
            <line x1="140" y1="320" x2="700" y2="320" stroke="#FAF8F5" strokeWidth="2" />
            <text
              x="420"
              y="310"
              textAnchor="middle"
              fontSize="14"
              fontFamily="monospace"
              fill="#FAF8F5"
            >
              {roofType.toUpperCase()} ROOF OVERLAY
            </text>
          </g>
        )}

        {/* Render Measure Line */}
        {measurePoints.length === 2 && (
          <g>
            <line
              x1={toSvgX(measurePoints[0][0])}
              y1={toSvgY(measurePoints[0][1])}
              x2={toSvgX(measurePoints[1][0])}
              y2={toSvgY(measurePoints[1][1])}
              stroke="#C86D51"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
          </g>
        )}
      </svg>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: nightMode ? '#1C1E24' : '#ECE8E1',
        overflow: 'hidden',
      }}
    >
      {/* Top Studio Header Bar */}
      <header
        style={{
          height: '56px',
          background: '#FAF8F5',
          borderBottom: '1px solid var(--border-sand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          gap: '12px',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '0.92rem',
            }}
          >
            <img src="/site/brand/homistry-mark.svg" alt="Homistry" width={22} height={22} />
            <span>Homistry</span>
          </Link>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
            }}
          >
            {homeTitle.toUpperCase()}
          </span>
          <span className="rl-badge">{viewOnly ? 'View only' : saveStatus}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`rl-btn ${
              viewMode === 'walkthrough' ? 'rl-btn-primary' : 'rl-btn-secondary'
            }`}
            style={{ padding: '7px 14px', fontSize: '0.84rem' }}
            onClick={() =>
              setViewMode(prev => (prev === 'walkthrough' ? '3d' : 'walkthrough'))
            }
          >
            {viewMode === 'walkthrough' ? 'Leave walk' : 'Walk through'}
          </button>

          {!viewOnly && (
            <button
              type="button"
              className="rl-btn rl-btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.84rem' }}
              onClick={() => handleSaveDesign(true)}
            >
              Save
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Body */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Rail Navigation + Drawer */}
        <aside
          style={{
            width: '368px',
            maxWidth: '45vw',
            background: '#FAF8F5',
            borderRight: '1px solid var(--border-sand)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
          }}
        >
          {/* 5 Primary Rail Tabs */}
          <div
            role="tablist"
            aria-label="Studio tools"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              borderBottom: '1px solid var(--border-sand)',
              background: '#F3EFEA',
            }}
          >
            {(['Home', 'Furnish', 'Decorate', 'Edit', 'Settings'] as const).map(tabName => {
              const active = activeTab === tabName;
              return (
                <button
                  key={tabName}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(tabName)}
                  style={{
                    padding: '11px 4px',
                    fontSize: '0.78rem',
                    fontWeight: active ? 700 : 500,
                    background: active ? '#FAF8F5' : 'transparent',
                    border: 'none',
                    borderBottom: active
                      ? '2px solid var(--accent-forest)'
                      : '2px solid transparent',
                    cursor: 'pointer',
                    color: active ? 'var(--text-ink)' : 'var(--text-muted)',
                  }}
                >
                  {tabName}
                </button>
              );
            })}
          </div>

          {/* Drawer Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
            {activeTab === 'Home' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Quick Action Cards matching homistry.ai Home Drawer */}
                <div style={{ display: 'grid', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('walkthrough')}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-sand)',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Walk through</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Start at the front door, at eye level
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Furnish')}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-sand)',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      Furnish and decorate
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      True-size furniture, floors and paint
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Edit')}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-sand)',
                      background: '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Edit home</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Change a wall, door, window or railing
                    </div>
                  </button>
                </div>

                <div>
                  <span className="rl-eyebrow">STOREYS & VIEW</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <button
                      type="button"
                      className={`rl-btn ${
                        floorFilter === 'whole' ? 'rl-btn-primary' : 'rl-btn-secondary'
                      }`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => setFloorFilter('whole')}
                    >
                      Whole house
                    </button>
                    {storeys > 1 && (
                      <button
                        type="button"
                        className={`rl-btn ${
                          floorFilter === 'upper' ? 'rl-btn-primary' : 'rl-btn-secondary'
                        }`}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => setFloorFilter('upper')}
                      >
                        Upper
                      </button>
                    )}
                    <button
                      type="button"
                      className={`rl-btn ${
                        floorFilter === 'ground' ? 'rl-btn-primary' : 'rl-btn-secondary'
                      }`}
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => setFloorFilter('ground')}
                    >
                      Ground
                    </button>
                  </div>
                </div>

                <div>
                  <span className="rl-eyebrow">ROOMS ({visibleRooms.length})</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Click a room to jump the camera inside and inspect dimensions.
                  </p>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {visibleRooms.map(room => {
                      const b = getPolygonBounds(room.polygon);
                      const isSel = selectedRoomId === room.id;
                      return (
                        <button
                          key={room.id}
                          type="button"
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            if (room.at) setWalkPosition(room.at);
                          }}
                          style={{
                            textAlign: 'left',
                            padding: '9px 12px',
                            borderRadius: '10px',
                            border: isSel
                              ? '2px solid var(--accent-forest)'
                              : '1px solid var(--border-sand)',
                            background: isSel ? '#FFFFFF' : 'var(--bg-card)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{room.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {room.floor === 1 ? 'Upper floor' : 'Ground floor'}
                              {room.areaSqFt ? ` · ${room.areaSqFt} sq ft` : ''}
                            </div>
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                            {formatLength(b.width)} × {formatLength(b.depth)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Furnish' && (
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <span className="rl-eyebrow">FURNISH</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pick a piece, then click on a floor to place it.
                  </p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input
                      type="search"
                      aria-label="Search furniture"
                      className="rl-input"
                      placeholder="Search furniture..."
                      value={furnishSearch}
                      onChange={e => setFurnishSearch(e.target.value)}
                    />
                    {furnishSearch && (
                      <button
                        type="button"
                        aria-label="Clear the search"
                        className="rl-btn rl-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => setFurnishSearch('')}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {!viewOnly && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="rl-btn rl-btn-primary"
                      style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem' }}
                      onClick={handleAiRoomDesigner}
                      disabled={aiRoomLoading}
                    >
                      {aiRoomLoading ? 'Styling room...' : '✨ AI room designer'}
                    </button>
                    <label
                      data-testid="photo-piece-add"
                      className="rl-btn rl-btn-secondary"
                      style={{ flex: 1, padding: '7px 10px', fontSize: '0.78rem', cursor: 'pointer', textAlign: 'center' }}
                    >
                      📷 Add a piece from a photo
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => handleAddPieceFromPhoto(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                )}

                {/* Exact 8 Furnish Categories from homistry.ai */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    'All',
                    'Sofas',
                    'Armchairs',
                    'Coffee tables',
                    'Side tables',
                    'TV units',
                    'Shelving',
                    'Kitchens and robes',
                    'Other rooms',
                  ].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFurnishCategory(cat)}
                      className={`rl-btn ${
                        furnishCategory === cat ? 'rl-btn-primary' : 'rl-btn-secondary'
                      }`}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {selectedPiece && (
                  <div className="rl-card" style={{ padding: '12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      <strong style={{ fontSize: '0.88rem' }}>
                        Selected: {selectedPiece.name}
                      </strong>
                      {!viewOnly && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            title="Turn left a quarter"
                            aria-label="Turn left a quarter"
                            className="rl-btn rl-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            onClick={() =>
                              handleUpdateSelectedPiece({
                                rotation: (selectedPiece.rotation - 90 + 360) % 360,
                              })
                            }
                          >
                            ↶
                          </button>
                          <button
                            type="button"
                            title="Turn right a quarter"
                            aria-label="Turn right a quarter"
                            className="rl-btn rl-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            onClick={() =>
                              handleUpdateSelectedPiece({
                                rotation: (selectedPiece.rotation + 90) % 360,
                              })
                            }
                          >
                            ↷
                          </button>
                          <button
                            type="button"
                            title="Make a copy beside it"
                            aria-label="Make a copy beside it"
                            className="rl-btn rl-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                            onClick={handleDuplicateSelectedPiece}
                          >
                            ⧉
                          </button>
                          <button
                            type="button"
                            title="Remove this piece"
                            aria-label="Remove this piece"
                            className="rl-btn rl-btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#8E2B18' }}
                            onClick={handleDeleteSelectedPiece}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <label style={{ fontSize: '0.75rem' }}>
                        Width (m)
                        <input
                          type="number"
                          step="0.05"
                          className="rl-input"
                          style={{ padding: '6px' }}
                          value={selectedPiece.width}
                          onChange={e =>
                            handleUpdateSelectedPiece({ width: Number(e.target.value) })
                          }
                        />
                      </label>
                      <label style={{ fontSize: '0.75rem' }}>
                        Depth (m)
                        <input
                          type="number"
                          step="0.05"
                          className="rl-input"
                          style={{ padding: '6px' }}
                          value={selectedPiece.depth}
                          onChange={e =>
                            handleUpdateSelectedPiece({ depth: Number(e.target.value) })
                          }
                        />
                      </label>
                      <label style={{ fontSize: '0.75rem' }}>
                        Rotation (°)
                        <input
                          type="number"
                          step="15"
                          className="rl-input"
                          style={{ padding: '6px' }}
                          value={selectedPiece.rotation}
                          onChange={e =>
                            handleUpdateSelectedPiece({ rotation: Number(e.target.value) })
                          }
                        />
                      </label>
                      <label style={{ fontSize: '0.75rem' }}>
                        X Position (m)
                        <input
                          type="number"
                          step="0.2"
                          className="rl-input"
                          style={{ padding: '6px' }}
                          value={selectedPiece.x}
                          onChange={e =>
                            handleUpdateSelectedPiece({ x: Number(e.target.value) })
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gap: '8px' }}>
                  {filteredCatalogue.map(item => (
                    <div
                      key={item.catalogId}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-sand)',
                        background: '#FFFFFF',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{item.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {formatLength(item.width)} × {formatLength(item.depth)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rl-btn rl-btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                        onClick={() => handleAddFurniture(item)}
                        disabled={viewOnly}
                      >
                        + Place
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'Decorate' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <span className="rl-eyebrow">WHAT TO DECORATE</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {(['Floors', 'Walls', 'Outside', 'Roof', 'Trims', 'Gutter', 'Fence'] as const).map(sec => (
                      <button
                        key={sec}
                        type="button"
                        className={`rl-btn ${
                          decorateSection === sec ? 'rl-btn-primary' : 'rl-btn-secondary'
                        }`}
                        style={{ padding: '5px 11px', fontSize: '0.76rem' }}
                        onClick={() => setDecorateSection(sec)}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rl-card-tinted" style={{ padding: '10px 12px', fontSize: '0.8rem' }}>
                  <div className="rl-eyebrow">FLOOR COVERINGS NEEDED</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>{finishes.floorMaterialName}</span>
                    <strong style={{ fontFamily: 'var(--font-mono)' }}>
                      {Math.round(
                        visibleRooms.reduce((sum, r) => {
                          const b = getPolygonBounds(r.polygon);
                          return sum + b.width * b.depth;
                        }, 0)
                      )}{' '}
                      m²
                    </strong>
                  </div>
                </div>

                {decorateSection === 'Trims' && (
                  <div className="rl-card" style={{ padding: '12px', display: 'grid', gap: '8px' }}>
                    <span className="rl-eyebrow">SKIRTING & ARCHITRAVES</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(['painted', 'oak', 'walnut'] as const).map(style => (
                        <button
                          key={style}
                          type="button"
                          className={`rl-btn ${trimStyle === style ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                          style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                          onClick={() => setTrimStyle(style)}
                        >
                          {style === 'painted' ? 'Painted white' : style === 'oak' ? 'Natural oak' : 'Dark walnut'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {decorateSection === 'Gutter' && (
                  <div className="rl-card" style={{ padding: '12px', display: 'grid', gap: '8px' }}>
                    <span className="rl-eyebrow">GUTTER PROFILE</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(['quad', 'half_round', 'box'] as const).map(style => (
                        <button
                          key={style}
                          type="button"
                          className={`rl-btn ${gutterStyle === style ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                          style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                          onClick={() => setGutterStyle(style)}
                        >
                          {style === 'quad' ? 'Quad / D-gutter' : style === 'half_round' ? 'Half-round' : 'Concealed box'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {decorateSection === 'Fence' && (
                  <div className="rl-card" style={{ padding: '12px', display: 'grid', gap: '8px' }}>
                    <span className="rl-eyebrow">BOUNDARY FENCE & GARDEN</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(['none', 'timber', 'colorbond', 'brick'] as const).map(style => (
                        <button
                          key={style}
                          type="button"
                          className={`rl-btn ${fenceStyle === style ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                          style={{ padding: '5px 10px', fontSize: '0.76rem' }}
                          onClick={() => setFenceStyle(style)}
                        >
                          {style === 'none'
                            ? 'No fence'
                            : style === 'timber'
                              ? 'Timber paling'
                              : style === 'colorbond'
                                ? 'Colorbond steel'
                                : 'Brick pier'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="rl-eyebrow">APPLY TO</span>
                  <select
                    className="rl-input"
                    style={{ marginTop: '4px', padding: '7px 10px', fontSize: '0.82rem' }}
                    value={decorateTargetRoom}
                    onChange={e => setDecorateTargetRoom(e.target.value)}
                  >
                    <option value="ALL">Every room</option>
                    {visibleRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="rl-eyebrow">FLOORS (18 MATERIALS)</span>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px',
                      marginTop: '6px',
                    }}
                  >
                    {FLOOR_MATERIALS.map(sw => (
                      <button
                        key={sw.label}
                        type="button"
                        onClick={() =>
                          setFinishes(prev => ({
                            ...prev,
                            floors: sw.hex,
                            floorMaterialName: sw.label,
                          }))
                        }
                        className="rl-btn rl-btn-secondary"
                        style={{
                          justifyContent: 'flex-start',
                          padding: '7px 9px',
                          fontSize: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: sw.hex,
                            border: '1px solid #999',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sw.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="rl-eyebrow">INTERIOR WALLS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                    {[
                      { label: 'Warm White', hex: '#F5F2EB' },
                      { label: 'Alabaster', hex: '#EAE6DF' },
                      { label: 'Soft Sage', hex: '#CBD4C8' },
                      { label: 'Terracotta Clay', hex: '#D8A48F' },
                    ].map(sw => (
                      <button
                        key={sw.label}
                        type="button"
                        onClick={() => setFinishes(prev => ({ ...prev, interiorWalls: sw.hex }))}
                        className="rl-btn rl-btn-secondary"
                        style={{ justifyContent: 'flex-start', padding: '7px 9px', fontSize: '0.78rem' }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: sw.hex,
                            border: '1px solid #999',
                          }}
                        />
                        {sw.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="rl-eyebrow">OUTSIDE WALLS</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                    {[
                      { label: 'Weatherboard', hex: '#EAE4DC' },
                      { label: 'Face Brick', hex: '#B86B52' },
                      { label: 'Smooth Render', hex: '#EFECE6' },
                      { label: 'Charcoal Timber', hex: '#3B4245' },
                    ].map(sw => (
                      <button
                        key={sw.label}
                        type="button"
                        onClick={() => setFinishes(prev => ({ ...prev, outsideWalls: sw.hex }))}
                        className="rl-btn rl-btn-secondary"
                        style={{ justifyContent: 'flex-start', padding: '7px 9px', fontSize: '0.78rem' }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: sw.hex,
                            border: '1px solid #999',
                          }}
                        />
                        {sw.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="rl-eyebrow">ROOF</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                    {[
                      { label: 'Monument', hex: '#3B4245' },
                      { label: 'Surfmist', hex: '#E4E2DC' },
                      { label: 'Woodland Grey', hex: '#4B4E4B' },
                      { label: 'Terracotta', hex: '#A95C42' },
                    ].map(sw => (
                      <button
                        key={sw.label}
                        type="button"
                        onClick={() => {
                          setFinishes(prev => ({ ...prev, roof: sw.hex }));
                          setShowRoof(true);
                        }}
                        className="rl-btn rl-btn-secondary"
                        style={{ justifyContent: 'flex-start', padding: '7px 9px', fontSize: '0.78rem' }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: sw.hex,
                            border: '1px solid #999',
                          }}
                        />
                        {sw.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Edit' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <span className="rl-eyebrow">EDIT</span>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Choose a tool, or click any wall, door or window on the plan.
                  </p>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {(
                      [
                        { id: 'select', label: 'Select', sub: 'Click a wall, door or window to edit it' },
                        { id: 'add_wall', label: 'Add wall', sub: 'Click two points on the floor to draw a wall' },
                        { id: 'add_door', label: 'Add door', sub: 'Click any wall to put a door in it' },
                        { id: 'add_window', label: 'Add window', sub: 'Click any wall to put a window in it' },
                        { id: 'add_railing', label: 'Add railing', sub: 'Click two points to draw a porch or deck railing' },
                        { id: 'add_post', label: 'Add post', sub: 'Click on the floor to stand a column or post' },
                        { id: 'edit_rooms', label: 'Edit rooms', sub: 'Rename a room or adjust its zone' },
                      ] as const
                    ).map(tool => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setEditTool(tool.id)}
                        style={{
                          textAlign: 'left',
                          padding: '9px 12px',
                          borderRadius: '10px',
                          border:
                            editTool === tool.id
                              ? '2px solid var(--accent-forest)'
                              : '1px solid var(--border-sand)',
                          background: editTool === tool.id ? '#FFFFFF' : 'var(--bg-card)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{tool.label}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                          {tool.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`rl-btn ${
                      viewMode === 'plan' ? 'rl-btn-primary' : 'rl-btn-secondary'
                    }`}
                    style={{ fontSize: '0.82rem' }}
                    onClick={() => setViewMode(prev => (prev === 'plan' ? '3d' : 'plan'))}
                  >
                    Plan drawing
                  </button>
                  {!viewOnly && (
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ fontSize: '0.82rem' }}
                      onClick={handleAddRoomWall}
                    >
                      + Add partitioned room
                    </button>
                  )}
                  {!viewOnly && walls.length > initialGeometry.walls.length && (
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ fontSize: '0.82rem' }}
                      onClick={() => {
                        setWalls(prev => prev.slice(0, -1));
                        setSaveStatus('Edited');
                      }}
                    >
                      ↶ Undo last wall
                    </button>
                  )}
                </div>

                {editTool === 'add_door' && (
                  <label style={{ fontSize: '0.8rem' }}>
                    Sort of door
                    <select
                      className="rl-input"
                      value={doorKind}
                      onChange={e => setDoorKind(e.target.value as typeof doorKind)}
                      style={{ marginTop: '4px' }}
                    >
                      <option value="door">Door (0.82 m)</option>
                      <option value="wide_door">Wide door (0.92 m)</option>
                      <option value="double_door">Double doors (1.6 m)</option>
                      <option value="sliding_door">Sliding door (2.1 m)</option>
                      <option value="garage_door">Garage door (4.8 m)</option>
                    </select>
                  </label>
                )}

                {editTool === 'add_window' && (
                  <label style={{ fontSize: '0.8rem' }}>
                    Sort of window
                    <select
                      className="rl-input"
                      value={windowKind}
                      onChange={e => setWindowKind(e.target.value as typeof windowKind)}
                      style={{ marginTop: '4px' }}
                    >
                      <option value="small_window">Small window (0.6 m)</option>
                      <option value="window">Window (1.2 m)</option>
                      <option value="wide_window">Wide window (1.8 m)</option>
                      <option value="picture_window">Picture window (2.4 m)</option>
                    </select>
                  </label>
                )}

                {editTool === 'edit_rooms' && (
                  <label style={{ fontSize: '0.8rem' }}>
                    Rename selected room
                    <input
                      type="text"
                      className="rl-input"
                      value={rooms.find(r => r.id === selectedRoomId)?.name || ''}
                      onChange={e => {
                        const val = e.target.value;
                        setRooms(prev =>
                          prev.map(r => (r.id === selectedRoomId ? { ...r, name: val } : r))
                        );
                        setSaveStatus('Edited');
                      }}
                      style={{ marginTop: '4px' }}
                    />
                  </label>
                )}

                <div>
                  <span className="rl-eyebrow">CEILING HEIGHTS & ROOF</span>
                  <div style={{ display: 'grid', gap: '10px', marginTop: '8px' }}>
                    <label style={{ fontSize: '0.82rem' }}>
                      Ground floor ceiling (m)
                      <input
                        type="number"
                        step="0.15"
                        className="rl-input"
                        value={ceilingGroundM}
                        onChange={e => setCeilingGroundM(Number(e.target.value))}
                      />
                    </label>
                    <label style={{ fontSize: '0.82rem' }}>
                      Upper floor ceiling (m)
                      <input
                        type="number"
                        step="0.15"
                        className="rl-input"
                        value={ceilingUpperM}
                        onChange={e => setCeilingUpperM(Number(e.target.value))}
                      />
                    </label>
                    <label style={{ fontSize: '0.82rem' }}>
                      Roof profile
                      <select
                        className="rl-input"
                        value={roofType}
                        onChange={e =>
                          setRoofType(e.target.value as 'gable' | 'hip' | 'flat')
                        }
                      >
                        <option value="gable">Gable roof</option>
                        <option value="hip">Hip roof</option>
                        <option value="flat">Architectural flat / skillion</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Settings' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <span className="rl-eyebrow">VIEW & LIGHT</span>
                  <div style={{ display: 'grid', gap: '6px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ justifyContent: 'space-between', padding: '8px 12px', fontSize: '0.82rem' }}
                      onClick={() => setShowRoof(prev => !prev)}
                    >
                      <span>Roof</span>
                      <strong>{showRoof ? 'Shown' : 'Hidden'}</strong>
                    </button>
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ justifyContent: 'space-between', padding: '8px 12px', fontSize: '0.82rem' }}
                      onClick={() => setShowRoomNames(prev => !prev)}
                    >
                      <span>Room names</span>
                      <strong>{showRoomNames ? 'Shown' : 'Hidden'}</strong>
                    </button>
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ justifyContent: 'space-between', padding: '8px 12px', fontSize: '0.82rem' }}
                      onClick={() => setShowPlanDrawingSheet(prev => !prev)}
                    >
                      <span>Plan drawing on the floors</span>
                      <strong>{showPlanDrawingSheet ? 'Shown' : 'Hidden'}</strong>
                    </button>
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ justifyContent: 'space-between', padding: '8px 12px', fontSize: '0.82rem' }}
                      onClick={() => setNightMode(prev => !prev)}
                    >
                      <span>Night</span>
                      <strong>{nightMode ? 'On' : 'Off'}</strong>
                    </button>
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Time of day</span>
                      <strong>{formatHourLabel(sitePlan.hour)}</strong>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={20}
                      step={0.25}
                      value={sitePlan.hour}
                      onChange={e =>
                        setSitePlan(prev => ({ ...prev, hour: Number(e.target.value) }))
                      }
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <span className="rl-eyebrow">MEASUREMENT UNITS</span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      className={`rl-btn ${unit === 'm' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                      style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                      onClick={() => setUnit('m')}
                    >
                      Metres (m)
                    </button>
                    <button
                      type="button"
                      className={`rl-btn ${unit === 'ft' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
                      style={{ fontSize: '0.82rem', padding: '7px 14px' }}
                      onClick={() => setUnit('ft')}
                    >
                      Feet & inches (ft)
                    </button>
                  </div>
                </div>

                <div>
                  <span className="rl-eyebrow">HOME SETTINGS</span>
                  <label style={{ fontSize: '0.78rem', display: 'block', marginTop: '6px' }}>
                    Home name
                    <input
                      type="text"
                      className="rl-input"
                      value={homeTitle}
                      onChange={e => setHomeTitle(e.target.value)}
                      style={{ marginTop: '4px' }}
                    />
                  </label>
                </div>

                <div>
                  <span className="rl-eyebrow">SHARE THIS HOME</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Create a view-only link for your partner, family, or builder.
                  </p>
                  {shareUrl ? (
                    <div className="rl-card" style={{ padding: '12px', display: 'grid', gap: '8px' }}>
                      <code style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                        {shareUrl}
                      </code>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          href={shareUrl}
                          className="rl-btn rl-btn-primary"
                          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                        >
                          Open share link
                        </Link>
                        <button
                          type="button"
                          className="rl-btn rl-btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                          onClick={handleRevokeShareLink}
                        >
                          Stop sharing
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ fontSize: '0.84rem' }}
                      onClick={handleCreateShareLink}
                    >
                      Create view-only share link
                    </button>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-sand)', paddingTop: '14px' }}>
                  <span className="rl-eyebrow">REPORT A PROBLEM WITH THIS HOME</span>
                  {reportStatus && (
                    <div
                      role="status"
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: '#EDF5F0',
                        fontSize: '0.78rem',
                        marginTop: '6px',
                      }}
                    >
                      {reportStatus}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input
                      type="text"
                      className="rl-input"
                      placeholder="Describe wall, stair or roof issue..."
                      value={reportIssueText}
                      onChange={e => setReportIssueText(e.target.value)}
                      style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                    />
                    <button
                      type="button"
                      className="rl-btn rl-btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                      onClick={async () => {
                        if (!reportIssueText.trim()) return;
                        const id = buildId || 'demo';
                        await fetch(`/api/live/${encodeURIComponent(id)}/report`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: reportIssueText }),
                        }).catch(() => null);
                        setReportIssueText('');
                        setReportStatus('Thank you — our team has logged this floor plan note.');
                      }}
                    >
                      Send
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-sand)', paddingTop: '14px' }}>
                  <span className="rl-eyebrow">CLASSIC ENGINEERING WORKSPACE</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Switch to the classic workspace for Sun & Site Plan, Smart Electrical,
                    Photoreal Renders, and Version History.
                  </p>
                  <button
                    type="button"
                    className="rl-btn rl-btn-primary"
                    style={{ width: '100%', fontSize: '0.84rem' }}
                    onClick={() => setClassicLook(prev => !prev)}
                  >
                    {classicLook ? 'Return to Ridgeline look' : 'Use the classic look'}
                  </button>
                </div>

                {classicLook && (
                  <div className="rl-card" style={{ padding: '14px', display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(
                        [
                          { id: 'sun', label: 'Sun & Site' },
                          { id: 'electrical', label: 'Electrical' },
                          { id: 'renders', label: 'Renders' },
                          { id: 'versions', label: 'Revisions' },
                        ] as const
                      ).map(t => (
                        <button
                          key={t.id}
                          type="button"
                          className={`rl-btn ${
                            classicSubTab === t.id ? 'rl-btn-primary' : 'rl-btn-secondary'
                          }`}
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          onClick={() => setClassicSubTab(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {classicSubTab === 'sun' && (
                      <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem' }}>
                        <strong>Solar Path & Lot Orientation</strong>
                        <label>
                          Site address
                          <input
                            type="text"
                            className="rl-input"
                            value={sitePlan.address}
                            onChange={e =>
                              setSitePlan(prev => ({ ...prev, address: e.target.value }))
                            }
                          />
                        </label>
                        <label>
                          Season
                          <select
                            className="rl-input"
                            value={sitePlan.season}
                            onChange={e =>
                              setSitePlan(prev => ({
                                ...prev,
                                season: e.target.value as SitePlanState['season'],
                              }))
                            }
                          >
                            <option value="winter">Winter solstice (low sun)</option>
                            <option value="equinox">Spring / Autumn equinox</option>
                            <option value="summer">Summer solstice (high sun)</option>
                          </select>
                        </label>
                        <label>
                          Time of day ({formatHourLabel(sitePlan.hour)})
                          <input
                            type="range"
                            min={6}
                            max={19}
                            step={0.5}
                            value={sitePlan.hour}
                            onChange={e =>
                              setSitePlan(prev => ({ ...prev, hour: Number(e.target.value) }))
                            }
                            style={{ width: '100%' }}
                          />
                        </label>
                      </div>
                    )}

                    {classicSubTab === 'electrical' && (
                      <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem' }}>
                        <strong>Smart Electrical Plan ({electricalItems.length})</strong>
                        <select
                          className="rl-input"
                          value={activeElectricalTool}
                          onChange={e =>
                            setActiveElectricalTool(
                              e.target.value as ElectricalMarker['type']
                            )
                          }
                        >
                          <option value="gpo">Double Power Point (GPO)</option>
                          <option value="switch">Light Switch</option>
                          <option value="downlight">Recessed Downlight</option>
                          <option value="pendant">Pendant Light</option>
                          <option value="data">Data / Ethernet Point</option>
                        </select>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            data-testid="smart-electrical-go"
                            className="rl-btn rl-btn-primary"
                            style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                            onClick={handleSmartElectricalAuto}
                          >
                            ⚡ Smart electrical
                          </button>
                          <button
                            type="button"
                            className="rl-btn rl-btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                            onClick={handleAddElectricalMarker}
                          >
                            + Place electrical symbol
                          </button>
                          <button
                            type="button"
                            data-testid="electrical-csv"
                            className="rl-btn rl-btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                            onClick={handleDownloadElectricalCsv}
                          >
                            Download schedule (.csv)
                          </button>
                          {electricalItems.length > 0 && (
                            <button
                              type="button"
                              data-testid="clear-electrical-go"
                              className="rl-btn rl-btn-secondary"
                              style={{ padding: '6px 10px', fontSize: '0.76rem' }}
                              onClick={() => setElectricalItems([])}
                            >
                              Clear all points
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {classicSubTab === 'renders' && (
                      <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem' }}>
                        <strong>Photoreal Camera Renders</strong>
                        <button
                          type="button"
                          className="rl-btn rl-btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          onClick={handleGenerateRender}
                        >
                          Generate Photoreal Render
                        </button>
                        {emailStatus && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-forest)' }}>
                            {emailStatus}
                          </div>
                        )}
                        {renders.map(r => (
                          <div key={r.id} style={{ marginTop: '6px' }}>
                            <img
                              src={r.imageUrl}
                              alt={r.roomName}
                              style={{ width: '100%', borderRadius: '6px' }}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '4px',
                                fontSize: '0.74rem',
                                color: 'var(--text-muted)',
                              }}
                            >
                              <span>
                                {r.roomName} · {r.style}
                              </span>
                              <button
                                type="button"
                                className="rl-btn rl-btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                                onClick={() => handleEmailRender(r.id)}
                              >
                                Email picture
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {classicSubTab === 'versions' && (
                      <div style={{ display: 'grid', gap: '8px', fontSize: '0.82rem' }}>
                        <strong>Revision Snapshots</strong>
                        <p style={{ color: 'var(--text-muted)' }}>
                          Initial 3D conversion + current live working state.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Center Interactive 2D/3D Architectural Viewport */}
        <section
          aria-label="Interactive 3D & 2D Home Viewport"
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: nightMode
              ? 'radial-gradient(circle at 50% 35%, #2B303C 0%, #171A21 100%)'
              : viewMode === 'plan'
                ? '#F7F5F0'
                : 'radial-gradient(circle at 50% 35%, #F6F3EC 0%, #DFD9CE 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Top-right Viewport Camera & Mode Controls */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 15,
            }}
          >
            <button
              type="button"
              className="rl-btn rl-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FAF8F5' }}
              onClick={() => setCameraYaw(prev => prev - 20)}
            >
              ↺ Orbit Left
            </button>
            <button
              type="button"
              className="rl-btn rl-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FAF8F5' }}
              onClick={() => setCameraYaw(prev => prev + 20)}
            >
              ↻ Orbit Right
            </button>
            <button
              type="button"
              className="rl-btn rl-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FAF8F5' }}
              onClick={() => setCameraZoom(prev => Math.min(1.6, prev + 0.12))}
            >
              + Zoom
            </button>
            <button
              type="button"
              className="rl-btn rl-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem', background: '#FAF8F5' }}
              onClick={() => setCameraZoom(prev => Math.max(0.65, prev - 0.12))}
            >
              − Zoom
            </button>
          </div>

          {/* Walkthrough HUD Banner + D-Pad Overlay matching homistry.ai */}
          {viewMode === 'walkthrough' && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'rgba(31, 30, 28, 0.9)',
                  color: '#FAF8F5',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span>
                  Eye-level walkthrough (1.65 m) · Standing in{' '}
                  <strong>
                    {rooms.find(r => r.id === selectedRoomId)?.name || 'CENTRAL HALL'}
                  </strong>
                </span>
                <button
                  type="button"
                  className="rl-btn rl-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setNightMode(prev => !prev)}
                >
                  Night
                </button>
                <button
                  type="button"
                  className="rl-btn rl-btn-primary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => setViewMode('3d')}
                >
                  Done
                </button>
              </div>

              {/* On-screen Walk D-Pad */}
              <div
                aria-label="Walk controls"
                style={{
                  position: 'absolute',
                  bottom: '84px',
                  right: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 38px)',
                  gap: '4px',
                  zIndex: 15,
                }}
              >
                <div />
                <button
                  type="button"
                  aria-label="Walk forward"
                  className="rl-btn rl-btn-secondary"
                  style={{ padding: '8px 0', background: '#FAF8F5' }}
                  onClick={() =>
                    setWalkPosition(([x, z]) => [x, Number((z - 0.6).toFixed(2))])
                  }
                >
                  ↑
                </button>
                <div />
                <button
                  type="button"
                  aria-label="Turn left"
                  className="rl-btn rl-btn-secondary"
                  style={{ padding: '8px 0', background: '#FAF8F5' }}
                  onClick={() => setCameraYaw(prev => prev - 15)}
                >
                  ↶
                </button>
                <button
                  type="button"
                  aria-label="Walk back"
                  className="rl-btn rl-btn-secondary"
                  style={{ padding: '8px 0', background: '#FAF8F5' }}
                  onClick={() =>
                    setWalkPosition(([x, z]) => [x, Number((z + 0.6).toFixed(2))])
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Turn right"
                  className="rl-btn rl-btn-secondary"
                  style={{ padding: '8px 0', background: '#FAF8F5' }}
                  onClick={() => setCameraYaw(prev => prev + 15)}
                >
                  ↷
                </button>
              </div>
            </>
          )}

          {/* Measure HUD Banner */}
          {viewMode === 'measure' && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: '#FAF8F5',
                border: '1px solid var(--border-strong)',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                zIndex: 15,
              }}
            >
              Click any two points on the plan to measure clearance:{' '}
              <strong>
                {measuredDistance !== null ? formatLength(measuredDistance) : 'Select points...'}
              </strong>
            </div>
          )}

          {/* Main 3D / 2D Plan / Split Stage */}
          {viewMode === 'split' ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '16px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: '1px solid var(--border-sand)',
                }}
              >
                {renderArchitecturalSvg('3d')}
              </div>
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {renderArchitecturalSvg('plan')}
              </div>
            </div>
          ) : (
            renderArchitecturalSvg()
          )}

          {/* Bottom Floating Studio Dock matching homistry.ai */}
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(250, 248, 245, 0.96)',
              border: '1px solid var(--border-strong)',
              borderRadius: '999px',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 12px 32px rgba(31, 30, 28, 0.12)',
              zIndex: 15,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className={`rl-btn ${
                floorFilter === 'whole' ? 'rl-btn-primary' : 'rl-btn-secondary'
              }`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setFloorFilter('whole')}
            >
              Whole house
            </button>
            <button
              type="button"
              className={`rl-btn ${
                floorFilter === 'upper' ? 'rl-btn-primary' : 'rl-btn-secondary'
              }`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setFloorFilter('upper')}
            >
              Upper
            </button>
            <button
              type="button"
              className={`rl-btn ${
                floorFilter === 'ground' ? 'rl-btn-primary' : 'rl-btn-secondary'
              }`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setFloorFilter('ground')}
            >
              Ground
            </button>
            <button
              type="button"
              className={`rl-btn ${viewMode === '3d' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setViewMode('3d')}
            >
              3D
            </button>
            <button
              type="button"
              className={`rl-btn ${viewMode === 'plan' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setViewMode('plan')}
            >
              Plan
            </button>
            <button
              type="button"
              className={`rl-btn ${viewMode === 'split' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setViewMode('split')}
            >
              Split
            </button>
            <button
              type="button"
              className={`rl-btn ${viewMode === 'measure' ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() =>
                setViewMode(prev => (prev === 'measure' ? '3d' : 'measure'))
              }
            >
              Measure
            </button>
            <button
              type="button"
              className={`rl-btn ${showRoof ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setShowRoof(prev => !prev)}
            >
              Roof
            </button>
            <button
              type="button"
              className={`rl-btn ${showRoomNames ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setShowRoomNames(prev => !prev)}
            >
              Room names
            </button>
            <button
              type="button"
              className={`rl-btn ${showPlanDrawingSheet ? 'rl-btn-primary' : 'rl-btn-secondary'}`}
              style={{ padding: '6px 11px', fontSize: '0.76rem' }}
              onClick={() => setShowPlanDrawingSheet(prev => !prev)}
            >
              Plan drawing
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

