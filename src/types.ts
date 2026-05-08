/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LocationType {
  WAREHOUSE = 'warehouse',
  ZONE = 'zone',
  AISLE = 'aisle',
  RACK = 'rack',
  SHELF = 'shelf',
  BIN = 'bin',
  DRAWER = 'drawer',
  PALLET_POSITION = 'pallet_position',
  WORKBENCH = 'workbench',
  RECEIVING = 'receiving',
  SHIPPING = 'shipping',
  RETURNS = 'returns',
  QC = 'qc',
  QUARANTINE = 'quarantine',
  VIRTUAL = 'virtual',
  VEHICLE = 'vehicle',
  STAGING_AREA = 'staging_area',
  OFFICE_STORAGE = 'office_storage',
  BULK_STORAGE = 'bulk_storage',
  OTHER = 'other'
}

export enum MappingStatus {
  UNMAPPED = 'unmapped',
  MAPPED = 'mapped',
  PARTIAL = 'partially_mapped'
}

export enum ViewMode {
  TOP_DOWN = 'top-down',
  FRONT = 'front',
  INTERIOR = 'interior'
}

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

export interface PhysicalMetadata {
  width?: number; // mm
  height?: number; // mm
  depth?: number; // mm
  weightCapacity?: number; // kg
}

export interface LocationAssignment {
  defaultSKU?: string;
  allowedCategories?: string[];
  preferredItems?: string[];
}

export interface LocationWarning {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  code: string;
  title: string;
  description?: string;
}

export interface LogicalLocation {
  id: string;
  code: string;
  name: string;
  description?: string;
  parentId: string | null;
  locationType: LocationType;
  status: 'active' | 'inactive' | 'archived';
  allowsStock: boolean;
  isReceivable: boolean;
  isPickable: boolean;
  isVirtual: boolean;
  qrCodeValue?: string;
  barcodeValue?: string;
  sortOrder?: number;
  stockCount?: number;
  skuCount?: number;
  icon?: string;
  color?: string;
  physicalMetadata?: PhysicalMetadata;
  assignment?: LocationAssignment;
  warnings?: LocationWarning[];
  mappedVisualizationCount?: number;
}

export interface VisualNode {
  id: string;
  layoutId: string;
  locationId: string | null; // Link to LogicalLocation
  type: 'rectangle' | 'circle' | 'industrial' | 'zone';
  label: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  width: number;
  height: number;
  depth: number;
  color: string;
  viewMode: ViewMode;
  parentId: string | null; // For nested visuals like bins in a cabinet
  supportsFrontView?: boolean;
  supportsInteriorView?: boolean;
}

export interface Layout {
  id: string;
  branchId: string;
  name: string;
  status: 'draft' | 'published';
  lastEdited: string;
  thumbnail?: string;
}

export interface Branch {
  id: string;
  name: string;
}
