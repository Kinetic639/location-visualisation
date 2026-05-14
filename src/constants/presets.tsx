import { 
  Box, 
  Package, 
  Square, 
  DoorOpen, 
  Wind,
  Warehouse,
  LayoutGrid,
  Columns,
  Rows,
  Database
} from 'lucide-react';
import { StructureNode, VisualNode } from '../types';

export const PRESET_CATEGORIES = [
  {
    name: 'Standard Storage',
    items: [
      { 
        type: 'industrial', 
        label: 'Heavy Duty Rack', 
        icon: Box, 
        widthMm: 2700, depthMm: 1100, heightMm: 4500, 
        color: '#334155', 
        supportsFrontView: true,
        structure: {
          id: 'root-HD',
          type: 'container',
          split: 'horizontal',
          splitType: 'shelves',
          size: 1,
          frame: {
            top: { id: 'f-t', type: 'solid', thickness: 50, material: 'metal', color: '#1e293b' },
            bottom: { id: 'f-b', type: 'solid', thickness: 50, material: 'metal', color: '#1e293b' },
            left: { id: 'f-l', type: 'solid', thickness: 50, material: 'metal', color: '#1e293b' },
            right: { id: 'f-r', type: 'solid', thickness: 50, material: 'metal', color: '#1e293b' },
          },
          children: [
            { id: 'hd-s1', type: 'cell', size: 1, label: 'Shelf 1', displayLabel: 'L1', skin: 'shelf-unit' },
            { id: 'hd-s2', type: 'cell', size: 1, label: 'Shelf 2', displayLabel: 'L2', skin: 'shelf-unit' },
            { id: 'hd-s3', type: 'cell', size: 1, label: 'Shelf 3', displayLabel: 'L3', skin: 'shelf-unit' },
            { id: 'hd-s4', type: 'cell', size: 1, label: 'Shelf 4', displayLabel: 'L4', skin: 'shelf-unit' }
          ]
        }
      },
      { 
        type: 'industrial', 
        label: 'Narrow Aisle Rack', 
        icon: Columns, 
        widthMm: 1350, depthMm: 800, heightMm: 6500, 
        color: '#1e293b', 
        supportsFrontView: true,
        structure: {
          id: 'root-NA',
          type: 'container',
          split: 'horizontal',
          splitType: 'shelves',
          size: 1,
          frame: {
            left: { id: 'f-l', type: 'solid', thickness: 40, material: 'metal', color: '#0f172a' },
            right: { id: 'f-r', type: 'solid', thickness: 40, material: 'metal', color: '#0f172a' },
          },
          children: [
            { id: 'na-s1', type: 'cell', size: 1, label: 'Level 1', displayLabel: 'L1', skin: 'shelf-unit' },
            { id: 'na-s2', type: 'cell', size: 1, label: 'Level 2', displayLabel: 'L2', skin: 'shelf-unit' },
            { id: 'na-s3', type: 'cell', size: 1, label: 'Level 3', displayLabel: 'L3', skin: 'shelf-unit' },
            { id: 'na-s4', type: 'cell', size: 1, label: 'Level 4', displayLabel: 'L4', skin: 'shelf-unit' },
            { id: 'na-s5', type: 'cell', size: 1, label: 'Level 5', displayLabel: 'L5', skin: 'shelf-unit' }
          ]
        }
      },
      { 
        type: 'rectangle', 
        label: 'Shelf Cupboard', 
        icon: Rows, 
        widthMm: 1000, depthMm: 600, heightMm: 2100, 
        color: '#451a03', 
        supportsFrontView: true,
        structure: {
          id: 'root-SC',
          type: 'container',
          split: 'horizontal',
          splitType: 'shelves',
          size: 1,
          frame: {
            top: { id: 'f-t', type: 'solid', thickness: 20, material: 'wood', color: '#78350f' },
            bottom: { id: 'f-b', type: 'solid', thickness: 20, material: 'wood', color: '#78350f' },
            left: { id: 'f-l', type: 'solid', thickness: 20, material: 'wood', color: '#78350f' },
            right: { id: 'f-r', type: 'solid', thickness: 20, material: 'wood', color: '#78350f' },
          },
          children: [
            { id: 'sc-1', type: 'cell', size: 1, label: 'Top Shelf', skin: 'wood' },
            { id: 'sc-2', type: 'cell', size: 1, label: 'Mid Shelf', skin: 'wood' },
            { id: 'sc-3', type: 'cell', size: 1, label: 'Bottom Shelf', skin: 'wood' }
          ]
        }
      },
      { 
        type: 'rectangle', 
        label: 'Column Cupboard', 
        icon: Columns, 
        widthMm: 1200, depthMm: 500, heightMm: 1950, 
        color: '#334155', 
        supportsFrontView: true,
        structure: {
          id: 'root-CC',
          type: 'container',
          split: 'vertical',
          splitType: 'columns',
          size: 1,
          frame: {
            top: { id: 'f-t', type: 'solid', thickness: 15, material: 'metal', color: '#475569' },
            bottom: { id: 'f-b', type: 'solid', thickness: 15, material: 'metal', color: '#475569' },
            left: { id: 'f-l', type: 'solid', thickness: 15, material: 'metal', color: '#475569' },
            right: { id: 'f-r', type: 'solid', thickness: 15, material: 'metal', color: '#475569' },
          },
          children: [
            { id: 'cc-c1', type: 'cell', size: 1, label: 'Column 1', skin: 'metal' },
            { id: 'cc-c2', type: 'cell', size: 1, label: 'Column 2', skin: 'metal' },
            { id: 'cc-c3', type: 'cell', size: 1, label: 'Column 3', skin: 'metal' }
          ]
        }
      }
    ]
  },
  {
    name: 'Small Parts',
    items: [
      { 
        type: 'rectangle', 
        label: 'Wall Bins (L)', 
        icon: LayoutGrid, 
        widthMm: 200, depthMm: 30, heightMm: 150, 
        color: '#0369a1', 
        supportsFrontView: true,
        structure: {
          id: 'root-WB',
          type: 'container',
          split: 'horizontal',
          splitType: 'bins',
          size: 1,
          children: [
            {
              id: 'wb-r1',
              type: 'container',
              split: 'vertical',
              size: 1,
              children: [
                { id: 'wb-r1-c1', type: 'cell', size: 1, skin: 'plastic-box' },
                { id: 'wb-r1-c2', type: 'cell', size: 1, skin: 'plastic-box' },
                { id: 'wb-r1-c3', type: 'cell', size: 1, skin: 'plastic-box' },
                { id: 'wb-r1-c4', type: 'cell', size: 1, skin: 'plastic-box' }
              ]
            },
            {
              id: 'wb-r2',
              type: 'container',
              split: 'vertical',
              size: 1,
              children: [
                { id: 'wb-r2-c1', type: 'cell', size: 1, skin: 'plastic-box' },
                { id: 'wb-r2-c2', type: 'cell', size: 1, skin: 'plastic-box' },
                { id: 'wb-r2-c3', type: 'cell', size: 1, skin: 'plastic-box' },
                { id: 'wb-r2-c4', type: 'cell', size: 1, skin: 'plastic-box' }
              ]
            }
          ]
        }
      }
    ]
  },
  {
    name: 'Zones',
    items: [
      { 
        type: 'zone', 
        label: 'No Access Zone', 
        icon: Square, 
        widthMm: 2000, depthMm: 2000, heightMm: 0, 
        color: '#f43f5e', 
        secondaryColor: '#9f1239',
        zonePattern: 'stripes-wide' as const,
        zoneType: 'no_access' as const,
        blockPlacement: true,
        supportsFrontView: false 
      },
      { 
        type: 'zone', 
        label: 'Elevator Shaft', 
        icon: Database, 
        widthMm: 3000, depthMm: 3000, heightMm: 0, 
        color: '#475569', 
        secondaryColor: '#1e293b',
        zonePattern: 'grid' as const,
        zoneType: 'elevator' as const,
        blockPlacement: true,
        supportsFrontView: false 
      },
      { 
        type: 'zone', 
        label: 'Staircase', 
        icon: Rows, 
        widthMm: 1500, depthMm: 4000, heightMm: 0, 
        color: '#475569', 
        secondaryColor: '#334155',
        zonePattern: 'stripes-thin' as const,
        zoneType: 'stairs' as const,
        blockPlacement: true,
        supportsFrontView: false 
      },
      { 
        type: 'zone', 
        label: 'Quality Control', 
        icon: Square, 
        widthMm: 4000, depthMm: 3000, heightMm: 0, 
        color: '#a855f7', 
        zonePattern: 'dots' as const,
        zoneType: 'operational' as const,
        supportsFrontView: false 
      },
      { 
        type: 'zone', 
        label: 'Packing Station', 
        icon: Package, 
        widthMm: 2000, depthMm: 1500, heightMm: 0, 
        color: '#eab308', 
        zoneType: 'operational' as const,
        supportsFrontView: false 
      }
    ]
  },
  {
    name: 'Infrastructure',
    items: [
      { type: 'rectangle', label: 'Support Pillar', icon: Square, widthMm: 600, depthMm: 600, heightMm: 10000, color: '#475569', supportsFrontView: false },
      { type: 'rectangle', label: 'Industrial Door', icon: DoorOpen, widthMm: 2500, depthMm: 200, heightMm: 4000, color: '#64748b', supportsFrontView: false },
      { type: 'rectangle', label: 'Office Wall', icon: Square, widthMm: 100, depthMm: 5000, heightMm: 3000, color: '#f8fafc', supportsFrontView: false }
    ]
  }
];
