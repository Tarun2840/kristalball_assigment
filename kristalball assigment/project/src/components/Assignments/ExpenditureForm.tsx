import React, { useState } from 'react';
import { X, Target, Package, MapPin, FileText, AlertTriangle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface ExpenditureFormProps {
  onClose: () => void;
}

const ExpenditureForm: React.FC<ExpenditureFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { bases, assets, addExpenditure } = useData();
  const [formData, setFormData] = useState({
    assetId: '',
    quantityExpended: '',
    expenditureDate: new Date().toISOString().split('T')[0],
    baseId: user?.assignedBases[0] || '',
    reason: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  // Filter assets to consumable items for expenditure
  const expendableAssets = assets.filter(asset => asset.isFungible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.assetId || !formData.quantityExpended || !formData.baseId || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }

      const quantity = parseInt(formData.quantityExpended);
      if (quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }

      // Check permissions for base
      if (user?.role !== 'Admin' && !user?.assignedBases.includes(formData.baseId)) {
        throw new Error('You do not have permission to record expenditures at this base');
      }

      const selectedAsset = assets.find(a => a.id === formData.assetId);
      const expenditureBase = bases.find(b => b.id === formData.baseId);

      if (!selectedAsset || !expenditureBase) {
        throw new Error('Invalid asset or base selection');
      }

      // Check if sufficient quantity is available
      if (quantity > selectedAsset.currentBalance) {
        throw new Error(`Insufficient quantity available. Current balance: ${selectedAsset.currentBalance}`);
      }

      // Create expenditure record
      addExpenditure({
        assetId: formData.assetId,
        asset: selectedAsset,
        quantityExpended: quantity,
        expenditureDate: formData.expenditureDate,
        baseId: formData.baseId,
        base: expenditureBase,
        reason: formData.reason,
        reportedByUserId: user!.id,
        reportedByUser: user!
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAsset = assets.find(a => a.id === formData.assetId);
  const availableQuantity = selectedAsset?.currentBalance || 0;
  const requestedQuantity = parseInt(formData.quantityExpended) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Record Expenditure</h2>
            <p className="text-gray-600 text-sm mt-1">Report asset consumption or usage</p>
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
              Asset Type *
            </label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select asset type</option>
              {expendableAssets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.equipmentType.name} - Available: {asset.currentBalance.toLocaleString()}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only consumable assets can be recorded as expenditures
            </p>
          </div>

          {/* Quantity and Availability Check */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Expended *
            </label>
            <input
              type="number"
              min="1"
              max={availableQuantity}
              value={formData.quantityExpended}
              onChange={(e) => setFormData(prev => ({ ...prev, quantityExpended: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity"
              required
            />
            
            {selectedAsset && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available Quantity:</span>
                  <span className="font-medium">{availableQuantity.toLocaleString()}</span>
                </div>
                {requestedQuantity > 0 && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Remaining After:</span>
                    <span className={`font-medium ${
                      requestedQuantity > availableQuantity ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(availableQuantity - requestedQuantity).toLocaleString()}
                    </span>
                  </div>
                )}
                {requestedQuantity > availableQuantity && (
                  <div className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span>Insufficient quantity available</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date and Base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expenditure Date *
              </label>
              <input
                type="date"
                value={formData.expenditureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expenditureDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Base *
              </label>
              <select
                value={formData.baseId}
                onChange={(e) => setFormData(prev => ({ ...prev, baseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select base</option>
                {availableBases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Reason for Expenditure *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reason</option>
              <option value="Training Exercise">Training Exercise</option>
              <option value="Combat Operation">Combat Operation</option>
              <option value="Live Fire Exercise">Live Fire Exercise</option>
              <option value="Equipment Testing">Equipment Testing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Damage/Loss">Damage/Loss</option>
              <option value="Expired/Obsolete">Expired/Obsolete</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional details about the expenditure"
            />
          </div>

          {/* Expenditure Summary */}
          {formData.assetId && formData.quantityExpended && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-amber-900 mb-2">Expenditure Summary</h4>
              <div className="text-sm text-amber-800">
                <div className="mb-1">
                  <strong>Asset:</strong> {selectedAsset?.equipmentType.name}
                </div>
                <div className="mb-1">
                  <strong>Quantity:</strong> {parseInt(formData.quantityExpended).toLocaleString()}
                </div>
                <div className="mb-1">
                  <strong>Base:</strong> {bases.find(b => b.id === formData.baseId)?.name}
                </div>
                <div>
                  <strong>Reason:</strong> {formData.reason}
                </div>
              </div>
            </div>
          )}

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
              disabled={isSubmitting || requestedQuantity > availableQuantity}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-md transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Record Expenditure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenditureForm;