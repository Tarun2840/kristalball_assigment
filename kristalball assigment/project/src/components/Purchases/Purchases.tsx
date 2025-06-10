import React, { useState } from 'react';
import { Plus, Search, Filter, Package, DollarSign, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import PurchaseForm from './PurchaseForm';

const Purchases: React.FC = () => {
  const { user } = useAuth();
  const { purchases, bases, equipmentTypes } = useData();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBase, setFilterBase] = useState('');
  const [filterEquipmentType, setFilterEquipmentType] = useState('');

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  // Filter purchases based on search and filters
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.asset.equipmentType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.supplierInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.purchaseOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBase = !filterBase || purchase.receivingBaseId === filterBase;
    const matchesEquipmentType = !filterEquipmentType || purchase.asset.equipmentTypeId === filterEquipmentType;
    
    // Base-level access control
    const hasAccess = user?.role === 'Admin' || user?.assignedBases.includes(purchase.receivingBaseId);
    
    return matchesSearch && matchesBase && matchesEquipmentType && hasAccess;
  });

  const totalValue = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
  const totalQuantity = filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchases</h1>
          <p className="text-gray-600 mt-1">Manage asset acquisitions and procurement records</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Logistics Officer') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Purchase</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Purchases</p>
              <p className="text-3xl font-bold text-gray-900">{filteredPurchases.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quantity</p>
              <p className="text-3xl font-bold text-gray-900">{totalQuantity.toLocaleString()}</p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterBase}
              onChange={(e) => setFilterBase(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Bases</option>
              {availableBases.map(base => (
                <option key={base.id} value={base.id}>{base.name}</option>
              ))}
            </select>
            
            <select
              value={filterEquipmentType}
              onChange={(e) => setFilterEquipmentType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Equipment</option>
              {equipmentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Purchase History</h3>
        </div>
        
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No purchases found</p>
            {user?.role !== 'Base Commander' && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Record your first purchase
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {purchase.asset.equipmentType.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {purchase.asset.equipmentType.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {purchase.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${purchase.totalCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${purchase.unitCost.toLocaleString()} per unit
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.supplierInfo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.receivingBase.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Purchase Form Modal */}
      {showForm && (
        <PurchaseForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Purchases;