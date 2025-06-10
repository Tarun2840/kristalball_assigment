import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users, 
  Activity,
  Calendar,
  Filter,
  Info
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { FilterOptions } from '../../types';
import NetMovementModal from './NetMovementModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { bases, equipmentTypes, getDashboardMetrics } = useData();
  const [showNetMovementModal, setShowNetMovementModal] = useState(false);
  
  // Default filter: last 30 days
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });

  const metrics = getDashboardMetrics(filters);

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  const MetricCard: React.FC<{
    title: string;
    value: number;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    onClick?: () => void;
    clickable?: boolean;
  }> = ({ title, value, icon: Icon, trend, onClick, clickable }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
        clickable ? 'cursor-pointer hover:shadow-lg hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Icon className="h-8 w-8 text-blue-600 mb-2" />
          {trend && (
            <div className={`flex items-center text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
              {trend === 'neutral' && <Activity className="h-3 w-3 mr-1" />}
            </div>
          )}
        </div>
      </div>
      {clickable && (
        <div className="mt-4 flex items-center text-sm text-blue-600">
          <Info className="h-4 w-4 mr-1" />
          Click for details
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Asset overview and key metrics</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base
              </label>
              <select
                value={filters.baseId || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  baseId: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Bases</option>
                {availableBases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Equipment Type
              </label>
              <select
                value={filters.equipmentTypeId || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  equipmentTypeId: e.target.value || undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {equipmentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Opening Balance"
          value={metrics.openingBalance}
          icon={Package}
          trend="neutral"
        />
        <MetricCard
          title="Closing Balance" 
          value={metrics.closingBalance}
          icon={Package}
          trend={metrics.closingBalance > metrics.openingBalance ? 'up' : 'down'}
        />
        <MetricCard
          title="Net Movement"
          value={metrics.netMovement}
          icon={Activity}
          trend={metrics.netMovement > 0 ? 'up' : metrics.netMovement < 0 ? 'down' : 'neutral'}
          onClick={() => setShowNetMovementModal(true)}
          clickable
        />
        <MetricCard
          title="Assigned Assets"
          value={metrics.assignedAssets}
          icon={Users}
          trend="neutral"
        />
        <MetricCard
          title="Expended Assets"
          value={metrics.expendedAssets}
          icon={TrendingDown}
          trend="down"
        />
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Purchases</span>
              <span className="font-semibold">{metrics.netMovementBreakdown.totalPurchases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transfers In</span>
              <span className="font-semibold text-green-600">+{metrics.netMovementBreakdown.totalTransfersIn}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Transfers Out</span>
              <span className="font-semibold text-red-600">-{metrics.netMovementBreakdown.totalTransfersOut}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Net Change</span>
              <span className={metrics.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}>
                {metrics.netMovement >= 0 ? '+' : ''}{metrics.netMovement}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Level</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Role</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user?.role === 'Admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'Base Commander' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned Bases</span>
              <span className="font-semibold">{user?.assignedBases.length || 0}</span>
            </div>
            <div className="text-sm text-gray-500">
              {user?.role === 'Admin' ? 'Full system access across all bases' :
               user?.role === 'Base Commander' ? 'Base-level management and oversight' :
               'Limited operational access for logistics'}
            </div>
          </div>
        </div>
      </div>

      {/* Net Movement Modal */}
      {showNetMovementModal && (
        <NetMovementModal
          breakdown={metrics.netMovementBreakdown}
          onClose={() => setShowNetMovementModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;