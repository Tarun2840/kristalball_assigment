import React, { useState } from 'react';
import { X, ArrowLeftRight, Package, MapPin, FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface TransferFormProps {
  onClose: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { bases, assets, addTransfer } = useData();
  const [formData, setFormData] = useState({
    assetId: '',
    quantity: '',
    sourceBaseId: user?.assignedBases[0] || '',
    destinationBaseId: '',
    transferDate: new Date().toISOString().split('T')[0],
    reason: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  // Available destination bases (exclude source base)
  const destinationBases = bases.filter(base => base.id !== formData.sourceBaseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.assetId || !formData.quantity || !formData.sourceBaseId || !formData.destinationBaseId || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.sourceBaseId === formData.destinationBaseId) {
        throw new Error('Source and destination bases must be different');
      }

      const quantity = parseInt(formData.quantity);
      if (quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }

      // Check permissions for source base
      if (user?.role !== 'Admin' && !user?.assignedBases.includes(formData.sourceBaseId)) {
        throw new Error('You do not have permission to transfer from this base');
      }

      const selectedAsset = assets.find(a => a.id === formData.assetId);
      const sourceBase = bases.find(b => b.id === formData.sourceBaseId);
      const destinationBase = bases.find(b => b.id === formData.destinationBaseId);

      if (!selectedAsset || !sourceBase || !destinationBase) {
        throw new Error('Invalid asset or base selection');
      }

      // Create transfer record
      addTransfer({
        assetId: formData.assetId,
        asset: selectedAsset,
        quantity,
        sourceBaseId: formData.sourceBaseId,
        sourceBase,
        destinationBaseId: formData.destinationBaseId,
        destinationBase,
        transferDate: formData.transferDate,
        reason: formData.reason,
        status: 'Initiated',
        initiatedByUserId: user!.id,
        initiatedByUser: user!
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Transfer</h2>
            <p className="text-gray-600 text-sm mt-1">Initiate an inter-base asset transfer</p>
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
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.equipmentType.name} - {asset.equipmentType.category}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
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
              placeholder="Enter quantity"
              required
            />
          </div>

          {/* Source and Destination Bases */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Source Base *
              </label>
              <select
                value={formData.sourceBaseId}
                onChange={(e) => setFormData(prev => ({ ...prev, sourceBaseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select source base</option>
                {availableBases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ArrowLeftRight className="inline h-4 w-4 mr-1" />
                Destination Base *
              </label>
              <select
                value={formData.destinationBaseId}
                onChange={(e) => setFormData(prev => ({ ...prev, destinationBaseId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select destination base</option>
                {destinationBases.map(base => (
                  <option key={base.id} value={base.id}>{base.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Date *
            </label>
            <input
              type="date"
              value={formData.transferDate}
              onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Reason for Transfer *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select reason</option>
              <option value="Operational Requirement">Operational Requirement</option>
              <option value="Maintenance Support">Maintenance Support</option>
              <option value="Training Exercise">Training Exercise</option>
              <option value="Rebalancing Inventory">Rebalancing Inventory</option>
              <option value="Emergency Response">Emergency Response</option>
              <option value="Scheduled Rotation">Scheduled Rotation</option>
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
              placeholder="Any additional details or special instructions"
            />
          </div>

          {/* Route Visualization */}
          {formData.sourceBaseId && formData.destinationBaseId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Transfer Route</h4>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">
                    {bases.find(b => b.id === formData.sourceBaseId)?.name}
                  </span>
                </div>
                <ArrowLeftRight className="h-8 w-8 text-blue-500" />
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-green-900">
                    {bases.find(b => b.id === formData.destinationBaseId)?.name}
                  </span>
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
            >
              {isSubmitting ? 'Initiating...' : 'Initiate Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransferForm;