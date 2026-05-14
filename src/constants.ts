import { 
  LogicalLocation, 
  LocationType, 
  Layout, 
  VisualNode, 
  ViewType,
  SplitTreeEntry
} from './types';

import { RICH_LOGICAL_LOCATIONS } from './data/logicalLocations';
import { RICH_VISUAL_NODES, RICH_SPLIT_TREES } from './data/workspaceLayouts';

export const MOCK_BRANCHES = [
  { id: 'b1', name: 'Main Logistics Center' },
  { id: 'b2', name: 'Workshop Garage B' },
  { id: 'b3', name: 'Global distribution Hub' }
];

export const MOCK_LOCATIONS: LogicalLocation[] = [
  ...RICH_LOGICAL_LOCATIONS
];

export const MOCK_SPLIT_TREES: SplitTreeEntry[] = [
  ...RICH_SPLIT_TREES
];

export const MOCK_LAYOUTS: Layout[] = [
  {
    id: 'lay-rich-01',
    branchId: 'b3',
    rootLocationId: 'l-wh-01',
    name: 'Unified Warehouse View',
    status: 'published',
    lastEdited: '2024-05-14 09:42',
    baseSurface: {
      type: 'floor',
      label: 'Ground Floor Plan',
      widthMm: 20000,
      depthMm: 25000,
      style: { fill: '#0f172a', gridColor: '#1e293b' },
      gridSizeMm: 1000
    }
  },
  {
    id: 'lay1',
    branchId: 'b1',
    rootLocationId: 'l-wh-01',
    name: 'Regional DC - Hall A',
    status: 'published',
    lastEdited: '2024-05-08 10:30',
    baseSurface: {
      type: 'floor',
      label: 'Main Floor Hall A',
      widthMm: 15000,
      depthMm: 12000,
      style: { fill: '#111827' },
      gridSizeMm: 500
    }
  },
  {
    id: 'lay2',
    branchId: 'b2',
    rootLocationId: null,
    name: 'Precision Gear Workshop',
    status: 'draft',
    lastEdited: '2024-05-08 11:05',
    baseSurface: {
      type: 'floor',
      label: 'Workshop Floor',
      widthMm: 8000,
      depthMm: 6000,
      style: { fill: '#111827' },
      gridSizeMm: 200
    }
  }
];

export const MOCK_VISUALS: VisualNode[] = [
  ...RICH_VISUAL_NODES,
  {
    id: 'v1-zone-a',
    layoutId: 'lay1',
    locationId: null,
    visualizationType: 'zone',
    label: 'Aisle 01 - Receiving',
    xMm: 500,
    yMm: 500,
    zMm: 0,
    rotationDeg: 0,
    widthMm: 4000,
    heightMm: 100,
    depthMm: 11000,
    style: { fill: 'rgba(56, 189, 248, 0.05)' },
    viewType: ViewType.TOP_DOWN,
    parentVisualNodeId: null
  },
  {
    id: 'v1-rack-1',
    layoutId: 'lay1',
    locationId: null,
    visualizationType: 'rack',
    label: 'Rack R-A1-01',
    xMm: 1000,
    yMm: 1000,
    zMm: 0,
    rotationDeg: 0,
    widthMm: 2500,
    heightMm: 4000,
    depthMm: 1000,
    style: { fill: '#334155' },
    viewType: ViewType.TOP_DOWN,
    parentVisualNodeId: 'v1-zone-a'
  },
  {
    id: 'v2-bench-1',
    layoutId: 'lay2',
    locationId: null,
    visualizationType: 'workbench',
    label: 'Assembly Bench 01',
    xMm: 500,
    yMm: 500,
    zMm: 0,
    rotationDeg: 0,
    widthMm: 2000,
    heightMm: 900,
    depthMm: 800,
    style: { fill: '#475569' },
    viewType: ViewType.TOP_DOWN,
    parentVisualNodeId: null
  },
  {
    id: 'v2-cabinet-1',
    layoutId: 'lay2',
    locationId: null,
    visualizationType: 'cabinet',
    label: 'Tool Cabinet A',
    xMm: 3000,
    yMm: 500,
    zMm: 0,
    rotationDeg: 0,
    widthMm: 1200,
    heightMm: 2100,
    depthMm: 600,
    style: { fill: '#1e293b' },
    viewType: ViewType.TOP_DOWN,
    parentVisualNodeId: null
  }
];
