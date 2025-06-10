import React, { useState } from 'react';
import { X, Package, ArrowRight, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { NetMovementBreakdown } from '../../types';

interface NetMovementModalProps {
  breakdown: NetMovementBreakdown;
  onClose: () => void;
}

const NetMovementModal: React.FC<NetMovementModalProps> = ({ breakdown, onClose }) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'transfersIn' | 'transfersOut'>('purchases');

  const tabs = [
    { id: 'purchases' as const, label: 'Purchases', count: breakdown.purchases.length, color: 'blue' },
    { id: 'transfersIn' as const, label: 'Transfers In', count: breakdown.transfersIn.length, color: 'green' },
    { id: 'transfersOut' as const, label: 'Transfers Out', count: breakdown.transfersOut.length, color: 'red' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'purchases':
        return (
          <div className="space-y-3">
            {breakdown.purchases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No purchases in selected period</p>
              </div>
            ) : (
              breakdown.purchases.map((purchase) => (
                <div key={purchase.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{purchase.asset.equipmentType.name}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <span className="ml-2 font-medium">{purchase.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Cost:</span>
                      <span className="ml-2 font-medium">${purchase.totalCost.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Supplier:</span>
                      <span className="ml-2 font-medium">{purchase.supplierInfo}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Base:</span>
                      <span className="ml-2 font-medium">{purchase.receivingBase.name}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'transfersIn':
        return (
          <div className="space-y-3">
            {breakdown.transfersIn.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No incoming transfers in selected period</p>
              </div>
            ) : (
              breakdown.transfersIn.map((transfer) => (
                <div key={transfer.id} className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{transfer.asset.equipmentType.name}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(transfer.transferDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{transfer.sourceBase.name}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-green-600">{transfer.destinationBase.name}</span>
                    </div>
                    <span className="text-sm font-medium">Qty: {transfer.quantity}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Reason: {transfer.reason}</div>
                    <div>Status: <span className="font-medium">{transfer.status}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'transfersOut':
        return (
          <div className="space-y-3">
            {breakdown.transfersOut.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No outgoing transfers in selected period</p>
              </div>
            ) : (
              breakdown.transfersOut.map((transfer) => (
                <div key={transfer.id} className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{transfer.asset.equipmentType.name}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(transfer.transferDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-red-600">{transfer.sourceBase.name}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{transfer.destinationBase.name}</span>
                    </div>
                    <span className="text-sm font-medium">Qty: {transfer.quantity}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Reason: {transfer.reason}</div>
                    <div>Status: <span className="font-medium">{transfer.status}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Net Movement Breakdown</h2>
            <p className="text-gray-600 text-sm mt-1">
              Detailed view of asset movements contributing to net change
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{breakdown.totalPurchases}</div>
              <div className="text-sm text-gray-600">Purchases</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+{breakdown.totalTransfersIn}</div>
              <div className="text-sm text-gray-600">Transfers In</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">-{breakdown.totalTransfersOut}</div>
              <div className="text-sm text-gray-600">Transfers Out</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${breakdown.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {breakdown.netMovement >= 0 ? '+' : ''}{breakdown.netMovement}
              </div>
              <div className="text-sm text-gray-600">Net Movement</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default NetMovementModal;