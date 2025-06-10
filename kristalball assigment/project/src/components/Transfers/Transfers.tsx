import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowLeftRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import TransferForm from './TransferForm';

const Transfers: React.FC = () => {
  const { user } = useAuth();
  const { transfers, bases, equipmentTypes } = useData();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBase, setFilterBase] = useState('');

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  // Filter transfers based on search, filters, and permissions
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.asset.equipmentType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || transfer.status === filterStatus;
    const matchesBase = !filterBase || transfer.sourceBaseId === filterBase || transfer.destinationBaseId === filterBase;
    
    // Access control - users can see transfers involving their assigned bases
    const hasAccess = user?.role === 'Admin' || 
                     user?.assignedBases.includes(transfer.sourceBaseId) ||
                     user?.assignedBases.includes(transfer.destinationBaseId);
    
    return matchesSearch && matchesStatus && matchesBase && hasAccess;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Initiated':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'In Transit':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      case 'Received':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Initiated':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Received':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status statistics
  const statusStats = {
    initiated: filteredTransfers.filter(t => t.status === 'Initiated').length,
    inTransit: filteredTransfers.filter(t => t.status === 'In Transit').length,
    received: filteredTransfers.filter(t => t.status === 'Received').length,
    cancelled: filteredTransfers.filter(t => t.status === 'Cancelled').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transfers</h1>
          <p className="text-gray-600 mt-1">Manage inter-base asset movements and logistics</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Logistics Officer') && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>New Transfer</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Initiated</p>
              <p className="text-3xl font-bold text-yellow-600">{statusStats.initiated}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-3xl font-bold text-blue-600">{statusStats.inTransit}</p>
            </div>
            <ArrowLeftRight className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Received</p>
              <p className="text-3xl font-bold text-green-600">{statusStats.received}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">{statusStats.cancelled}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
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
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Initiated">Initiated</option>
              <option value="In Transit">In Transit</option>
              <option value="Received">Received</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            
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
          </div>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transfer History</h3>
        </div>
        
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12">
            <ArrowLeftRight className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transfers found</p>
            {user?.role !== 'Base Commander' && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Initiate your first transfer
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transfer.asset.equipmentType.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transfer.asset.equipmentType.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{transfer.sourceBase.name}</span>
                        <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{transfer.destinationBase.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transfer.quantity.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transfer.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>
                          {transfer.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transfer.transferDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {transfer.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transfer Form Modal */}
      {showForm && (
        <TransferForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Transfers;