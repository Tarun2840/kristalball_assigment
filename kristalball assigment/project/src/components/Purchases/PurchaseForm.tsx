import React, { useState } from 'react';
import { X, DollarSign, Package, MapPin, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface PurchaseFormProps {
  onClose: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { bases, equipmentTypes, assets, addPurchase } = useData();
  const [formData, setFormData] = useState({
    assetId: '',
    quantity: '',
    unitCost: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplierInfo: '',
    receivingBaseId: user?.assignedBases[0] || '',
    purchaseOrderNumber: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.assetId || !formData.quantity || !formData.unitCost || !formData.supplierInfo || !formData.receivingBaseId) {
        throw new Error('Please fill in all required fields');
      }

      const quantity = parseInt(formData.quantity);
      const unitCost = parseFloat(formData.unitCost);

      if (quantity <= 0 || unitCost <= 0) {
        throw new Error('Quantity and unit cost must be positive numbers');
      }

      const selectedAsset = assets.find(a => a.id === formData.assetId);
      const receivingBase = availableBases.find(b => b.id === formData.receivingBaseId);

      if (!selectedAsset || !receivingBase) {
        throw new Error('Invalid asset or base selection');
      }

      // Create purchase record
      addPurchase({
        assetId: formData.assetId,
        asset: selectedAsset,
        quantity,
        unitCost,
        totalCost: quantity * unitCost,
        purchaseDate: formData.purchaseDate,
        supplierInfo: formData.supplierInfo,
        receivingBaseId: formData.receivingBaseId,
        receivingBase,
        purchaseOrderNumber: formData.purchaseOrderNumber || undefined,
        recordedByUserId: user!.id,
        recordedByUser: user!
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCost = parseFloat(formData.quantity || '0') * parseFloat(formData.unitCost || '0');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Purchase</h2>
            <p className="text-gray-600 text-sm mt-1">Record a new asset acquisition</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Asset Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Equipment Type *
            </label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select equipment type</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.equipmentType.name} - {asset.equipmentType.category}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost ($) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData(prev => ({ ...prev, unitCost: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Cost
              </label>
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">
                <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                <span className="font-medium text-gray-900">
                  {isNaN(totalCost) ? '0.00' : totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Information *
              </label>
              <input
                type="text"
                value={formData.supplierInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierInfo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Supplier name or details"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Date *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Base and PO Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Receiving Base *
              </label>
              <select
                value={formData.receivingBaseId}
                onChange={(e) => setFormData(prev => ({ ...prev, receivingBaseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select receiving base</option>
                {availableBases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Purchase Order #
              </label>
              <input
                type="text"
                value={formData.purchaseOrderNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseOrderNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional PO number"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes or remarks"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Record Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;