export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'Base Commander' | 'Logistics Officer';
  assignedBases: string[];
  createdAt: string;
}

export interface Base {
  id: string;
  name: string;
  location: string;
  description: string;
}

export interface EquipmentType {
  id: string;
  name: string;
  category: 'Ground' | 'Air' | 'Consumable' | 'Heavy Weaponry';
  description: string;
}

export interface Asset {
  id: string;
  equipmentTypeId: string;
  equipmentType: EquipmentType;
  modelName: string;
  serialNumber?: string;
  currentBaseId: string;
  currentBase: Base;
  quantity: number;
  status: 'Operational' | 'Maintenance' | 'Damaged' | 'Decommissioned';
  isFungible: boolean;
  currentBalance: number;
  lastUpdatedAt: string;
}

export interface Purchase {
  id: string;
  assetId: string;
  asset: Asset;
  quantity: number;
  unitCost: number;
  totalCost: number;
  purchaseDate: string;
  supplierInfo: string;
  receivingBaseId: string;
  receivingBase: Base;
  purchaseOrderNumber?: string;
  recordedByUserId: string;
  recordedByUser: User;
  createdAt: string;
}

export interface Transfer {
  id: string;
  assetId: string;
  asset: Asset;
  quantity: number;
  sourceBaseId: string;
  sourceBase: Base;
  destinationBaseId: string;
  destinationBase: Base;
  transferDate: string;
  reason: string;
  status: 'Initiated' | 'In Transit' | 'Received' | 'Cancelled';
  initiatedByUserId: string;
  initiatedByUser: User;
  receivedByUserId?: string;
  receivedByUser?: User;
  createdAt: string;
  completedAt?: string;
}

export interface Assignment {
  id: string;
  assetId: string;
  asset: Asset;
  assignedToUserId: string;
  assignedToUser: User;
  assignmentDate: string;
  baseOfAssignmentId: string;
  baseOfAssignment: Base;
  purpose: string;
  expectedReturnDate?: string;
  returnedDate?: string;
  isActive: boolean;
  recordedByUserId: string;
  recordedByUser: User;
  createdAt: string;
}

export interface Expenditure {
  id: string;
  assetId: string;
  asset: Asset;
  quantityExpended: number;
  expenditureDate: string;
  baseId: string;
  base: Base;
  reason: string;
  reportedByUserId: string;
  reportedByUser: User;
  createdAt: string;
}

export interface NetMovementBreakdown {
  purchases: Purchase[];
  transfersIn: Transfer[];
  transfersOut: Transfer[];
  totalPurchases: number;
  totalTransfersIn: number;
  totalTransfersOut: number;
  netMovement: number;
}

export interface DashboardMetrics {
  openingBalance: number;
  closingBalance: number;
  netMovement: number;
  assignedAssets: number;
  expendedAssets: number;
  netMovementBreakdown: NetMovementBreakdown;
}

export interface FilterOptions {
  dateRange: {
    start: string;
    end: string;
  };
  baseId?: string;
  equipmentTypeId?: string;
}