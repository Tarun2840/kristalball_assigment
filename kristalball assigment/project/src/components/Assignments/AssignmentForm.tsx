import React, { useState } from 'react';
import { X, Users, Package, MapPin, FileText, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface AssignmentFormProps {
  onClose: () => void;
}

// Mock users for assignment - in production, this would come from a user management system
const mockPersonnel = [
  { id: 'person-1', name: 'Sergeant Williams', rank: 'SGT', unit: 'Alpha Company' },
  { id: 'person-2', name: 'Corporal Johnson', rank: 'CPL', unit: 'Bravo Company' },
  { id: 'person-3', name: 'Private Davis', rank: 'PVT', unit: 'Charlie Company' },
  { id: 'person-4', name: 'Lieutenant Brown', rank: 'LT', unit: 'Delta Company' }
];

const AssignmentForm: React.FC<AssignmentFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { bases, assets, addAssignment } = useData();
  const [formData, setFormData] = useState({
    assetId: '',
    assignedToPersonnelId: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    baseOfAssignmentId: user?.assignedBases[0] || '',
    purpose: '',
    expectedReturnDate: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  // Filter assets to non-fungible items for assignment
  const assignableAssets = assets.filter(asset => !asset.isFungible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.assetId || !formData.assignedToPersonnelId || !formData.baseOfAssignmentId || !formData.purpose) {
        throw new Error('Please fill in all required fields');
      }

      // Check permissions for base
      if (user?.role !== 'Admin' && !user?.assignedBases.includes(formData.baseOfAssignmentId)) {
        throw new Error('You do not have permission to assign assets at this base');
      }

      const selectedAsset = assets.find(a => a.id === formData.assetId);
      const selectedPersonnel = mockPersonnel.find(p => p.id === formData.assignedToPersonnelId);
      const assignmentBase = bases.find(b => b.id === formData.baseOfAssignmentId);

      if (!selectedAsset || !selectedPersonnel || !assignmentBase) {
        throw new Error('Invalid asset, personnel, or base selection');
      }

      // Create mock user object for the assigned personnel
      const assignedToUser = {
        id: selectedPersonnel.id,
        username: selectedPersonnel.name.toLowerCase().replace(' ', '.'),
        email: `${selectedPersonnel.name.toLowerCase().replace(' ', '.')}@military.gov`,
        fullName: selectedPersonnel.name,
        role: 'Personnel' as const,
        assignedBases: [formData.baseOfAssignmentId],
        createdAt: new Date().toISOString()
      };

      // Create assignment record
      addAssignment({
        assetId: formData.assetId,
        asset: selectedAsset,
        assignedToUserId: selectedPersonnel.id,
        assignedToUser,
        assignmentDate: formData.assignmentDate,
        baseOfAssignmentId: formData.baseOfAssignmentId,
        baseOfAssignment: assignmentBase,
        purpose: formData.purpose,
        expectedReturnDate: formData.expectedReturnDate || undefined,
        isActive: true,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Assignment</h2>
            <p className="text-gray-600 text-sm mt-1">Assign an asset to personnel</p>
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
              Asset *
            </label>
            <select
              value={formData.assetId}
              
              onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select asset to assign</option>
              {assignableAssets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.equipmentType.name} - {asset.serialNumber || 'No Serial'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only non-consumable assets can be assigned to personnel
            </p>
          </div>

          {/* Personnel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline h-4 w-4 mr-1" />
              Assign To *
            </label>
            <select
              value={formData.assignedToPersonnelId}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedToPersonnelId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select personnel</option>
              {mockPersonnel.map(person => (
                <option key={person.id} value={person.id}>
                  {person.rank} {person.name} - {person.unit}
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Date *
              </label>
              <input
                type="date"
                value={formData.assignmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, assignmentDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Expected Return Date
              </label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={formData.assignmentDate}
              />
            </div>
          </div>

          {/* Base Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Base of Assignment *
            </label>
            <select
              value={formData.baseOfAssignmentId}
              onChange={(e) => setFormData(prev => ({ ...prev, baseOfAssignmentId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select base</option>
              {availableBases.map(base => (
                <option key={base.id} value={base.id}>{base.name}</option>
              ))}
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Purpose of Assignment *
            </label>
            <select
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select purpose</option>
              <option value="Training Exercise">Training Exercise</option>
              <option value="Operational Deployment">Operational Deployment</option>
              <option value="Maintenance Duty">Maintenance Duty</option>
              <option value="Security Detail">Security Detail</option>
              <option value="Field Operations">Field Operations</option>
              <option value="Administrative Use">Administrative Use</option>
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

          {/* Assignment Summary */}
          {formData.assetId && formData.assignedToPersonnelId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Assignment Summary</h4>
              <div className="text-sm text-blue-800">
                <div className="mb-1">
                  <strong>Asset:</strong> {assets.find(a => a.id === formData.assetId)?.equipmentType.name}
                </div>
                <div className="mb-1">
                  <strong>Assigned To:</strong> {mockPersonnel.find(p => p.id === formData.assignedToPersonnelId)?.name}
                </div>
                <div>
                  <strong>Base:</strong> {bases.find(b => b.id === formData.baseOfAssignmentId)?.name}
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
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;