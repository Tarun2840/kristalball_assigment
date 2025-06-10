import React, { createContext, useContext, useState } from 'react';
import { 
  Base, 
  EquipmentType, 
  Asset, 
  Purchase, 
  Transfer, 
  Assignment, 
  Expenditure,
  DashboardMetrics,
  FilterOptions,
  NetMovementBreakdown
} from '../types';

interface DataContextType {
  bases: Base[];
  equipmentTypes: EquipmentType[];
  assets: Asset[];
  purchases: Purchase[];
  transfers: Transfer[];
  assignments: Assignment[];
  expenditures: Expenditure[];
  getDashboardMetrics: (filters: FilterOptions) => DashboardMetrics;
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt'>) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  addExpenditure: (expenditure: Omit<Expenditure, 'id' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Mock data
const mockBases: Base[] = [
  { id: 'base-1', name: 'Fort Liberty', location: 'North Carolina, USA', description: 'Primary training facility' },
  { id: 'base-2', name: 'Camp Pendleton', location: 'California, USA', description: 'Marine Corps base' },
  { id: 'base-3', name: 'Joint Base Lewis-McChord', location: 'Washington, USA', description: 'Joint operations base' }
];

const mockEquipmentTypes: EquipmentType[] = [
  { id: 'eq-1', name: 'M4A1 Carbine', category: 'Ground', description: 'Standard issue rifle' },
  { id: 'eq-2', name: 'HMMWV', category: 'Ground', description: 'High Mobility Multipurpose Wheeled Vehicle' },
  { id: 'eq-3', name: '5.56mm Ammunition', category: 'Consumable', description: 'Standard rifle ammunition' },
  { id: 'eq-4', name: 'M1A2 Abrams', category: 'Heavy Weaponry', description: 'Main battle tank' }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);

  // Mock assets derived from equipment types
  const assets: Asset[] = mockEquipmentTypes.map(et => ({
    id: `asset-${et.id}`,
    equipmentTypeId: et.id,
    equipmentType: et,
    modelName: et.name,
    serialNumber: et.category === 'Consumable' ? undefined : `SN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    currentBaseId: mockBases[0].id,
    currentBase: mockBases[0],
    quantity: et.category === 'Consumable' ? 10000 : 5,
    status: 'Operational',
    isFungible: et.category === 'Consumable',
    currentBalance: et.category === 'Consumable' ? 8500 : 5,
    lastUpdatedAt: new Date().toISOString()
  }));

  const getDashboardMetrics = (filters: FilterOptions): DashboardMetrics => {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);

    // Filter data based on date range and optional filters
    const filteredPurchases = purchases.filter(p => {
      const purchaseDate = new Date(p.purchaseDate);
      return purchaseDate >= startDate && purchaseDate <= endDate &&
             (!filters.baseId || p.receivingBaseId === filters.baseId) &&
             (!filters.equipmentTypeId || p.asset.equipmentTypeId === filters.equipmentTypeId);
    });

    const filteredTransfers = transfers.filter(t => {
      const transferDate = new Date(t.transferDate);
      return transferDate >= startDate && transferDate <= endDate &&
             (!filters.equipmentTypeId || t.asset.equipmentTypeId === filters.equipmentTypeId);
    });

    const transfersIn = filteredTransfers.filter(t => 
      !filters.baseId || t.destinationBaseId === filters.baseId
    );

    const transfersOut = filteredTransfers.filter(t => 
      !filters.baseId || t.sourceBaseId === filters.baseId
    );

    const filteredExpenditures = expenditures.filter(e => {
      const expenditureDate = new Date(e.expenditureDate);
      return expenditureDate >= startDate && expenditureDate <= endDate &&
             (!filters.baseId || e.baseId === filters.baseId) &&
             (!filters.equipmentTypeId || e.asset.equipmentTypeId === filters.equipmentTypeId);
    });

    const filteredAssignments = assignments.filter(a => {
      const assignmentDate = new Date(a.assignmentDate);
      return assignmentDate >= startDate && assignmentDate <= endDate &&
             (!filters.baseId || a.baseOfAssignmentId === filters.baseId) &&
             (!filters.equipmentTypeId || a.asset.equipmentTypeId === filters.equipmentTypeId);
    });

    const totalPurchases = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalTransfersIn = transfersIn.reduce((sum, t) => sum + t.quantity, 0);
    const totalTransfersOut = transfersOut.reduce((sum, t) => sum + t.quantity, 0);
    const totalExpended = filteredExpenditures.reduce((sum, e) => sum + e.quantityExpended, 0);
    const totalAssigned = filteredAssignments.filter(a => a.isActive).length;

    const netMovement = totalPurchases + totalTransfersIn - totalTransfersOut;

    const netMovementBreakdown: NetMovementBreakdown = {
      purchases: filteredPurchases,
      transfersIn,
      transfersOut,
      totalPurchases,
      totalTransfersIn,
      totalTransfersOut,
      netMovement
    };

    // Mock opening/closing balances - in production, these would be calculated from historical data
    const openingBalance = 10000;
    const closingBalance = openingBalance + netMovement - totalExpended;

    return {
      openingBalance,
      closingBalance,
      netMovement,
      assignedAssets: totalAssigned,
      expendedAssets: totalExpended,
      netMovementBreakdown
    };
  };

  const addPurchase = (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: `purchase-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setPurchases(prev => [...prev, newPurchase]);
  };

  const addTransfer = (transfer: Omit<Transfer, 'id' | 'createdAt'>) => {
    const newTransfer: Transfer = {
      ...transfer,
      id: `transfer-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTransfers(prev => [...prev, newTransfer]);
  };

  const addAssignment = (assignment: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: `assignment-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const addExpenditure = (expenditure: Omit<Expenditure, 'id' | 'createdAt'>) => {
    const newExpenditure: Expenditure = {
      ...expenditure,
      id: `expenditure-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExpenditures(prev => [...prev, newExpenditure]);
  };

  const value = {
    bases: mockBases,
    equipmentTypes: mockEquipmentTypes,
    assets,
    purchases,
    transfers,
    assignments,
    expenditures,
    getDashboardMetrics,
    addPurchase,
    addTransfer,
    addAssignment,
    addExpenditure
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};