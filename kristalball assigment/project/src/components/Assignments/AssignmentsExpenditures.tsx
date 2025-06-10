import React, { useState } from 'react';
import { Plus, Search, Filter, Users, Target, Calendar, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import AssignmentForm from './AssignmentForm';
import ExpenditureForm from './ExpenditureForm';

const AssignmentsExpenditures: React.FC = () => {
  const { user } = useAuth();
  const { assignments, expenditures, bases, equipmentTypes } = useData();
  const [activeTab, setActiveTab] = useState<'assignments' | 'expenditures'>('assignments');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showExpenditureForm, setShowExpenditureForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBase, setFilterBase] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Filter bases based on user permissions
  const availableBases = user?.role === 'Admin' 
    ? bases 
    : bases.filter(base => user?.assignedBases.includes(base.id));

  // Filter assignments based on search, filters, and permissions
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.asset.equipmentType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.assignedToUser.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBase = !filterBase || assignment.baseOfAssignmentId === filterBase;
    const matchesActive = filterActive === '' || 
                         (filterActive === 'active' && assignment.isActive) ||
                         (filterActive === 'returned' && !assignment.isActive);
    
    // Access control
    const hasAccess = user?.role === 'Admin' || user?.assignedBases.includes(assignment.baseOfAssignmentId);
    
    return matchesSearch && matchesBase && matchesActive && hasAccess;
  });

  // Filter expenditures based on search, filters, and permissions
  const filteredExpenditures = expenditures.filter(expenditure => {
    const matchesSearch = expenditure.asset.equipmentType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expenditure.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expenditure.reportedByUser.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBase = !filterBase || expenditure.baseId === filterBase;
    
    // Access control
    const hasAccess = user?.role === 'Admin' || user?.assignedBases.includes(expenditure.baseId);
    
    return matchesSearch && matchesBase && hasAccess;
  });

  // Statistics
  const assignmentStats = {
    active: filteredAssignments.filter(a => a.isActive).length,
    returned: filteredAssignments.filter(a => !a.isActive).length,
    overdue: filteredAssignments.filter(a => 
      a.isActive && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date()
    ).length
  };

  const expenditureStats = {
    total: filteredExpenditures.length,
    totalQuantity: filteredExpenditures.reduce((sum, e) => sum + e.quantityExpended, 0),
    thisMonth: filteredExpenditures.filter(e => 
      new Date(e.expenditureDate).getMonth() === new Date().getMonth() &&
      new Date(e.expenditureDate).getFullYear() === new Date().getFullYear()
    ).length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments & Expenditures</h1>
          <p className="text-gray-600 mt-1">Track asset assignments to personnel and expenditure records</p>
        </div>
        <div className="flex space-x-3">
          {(user?.role === 'Admin' || user?.role === 'Logistics Officer') && (
            <>
              <button
                onClick={() => setShowAssignmentForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Users className="h-5 w-5" />
                <span>New Assignment</span>
              </button>
              <button
                onClick={() => setShowExpenditureForm(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Target className="h-5 w-5" />
                <span>Record Expenditure</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Assignments</p>
              <p className="text-3xl font-bold text-blue-600">{assignmentStats.active}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Returned Assets</p>
              <p className="text-3xl font-bold text-green-600">{assignmentStats.returned}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Returns</p>
              <p className="text-3xl font-bold text-red-600">{assignmentStats.overdue}</p>
            </div>
            <Calendar className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenditures</p>
              <p className="text-3xl font-bold text-amber-600">{expenditureStats.totalQuantity.toLocaleString()}</p>
            </div>
            <Target className="h-8 w-8 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assignments ({filteredAssignments.length})
            </button>
            <button
              onClick={() => setActiveTab('expenditures')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'expenditures'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expenditures ({filteredExpenditures.length})
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
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
              
              {activeTab === 'assignments' && (
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="returned">Returned</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'assignments' ? (
            filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assignments found</p>
                {user?.role !== 'Base Commander' && (
                  <button
                    onClick={() => setShowAssignmentForm(true)}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create your first assignment
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
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.asset.equipmentType.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.asset.serialNumber || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.assignedToUser.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {assignment.assignedToUser.role}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                          {assignment.purpose}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.baseOfAssignment.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(assignment.assignmentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            assignment.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.isActive ? 'Active' : 'Returned'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            filteredExpenditures.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No expenditures recorded</p>
                {user?.role !== 'Base Commander' && (
                  <button
                    onClick={() => setShowExpenditureForm(true)}
                    className="mt-4 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Record your first expenditure
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
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenditures.map((expenditure) => (
                      <tr key={expenditure.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {expenditure.asset.equipmentType.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {expenditure.asset.equipmentType.category}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {expenditure.quantityExpended.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                          {expenditure.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expenditure.base.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(expenditure.expenditureDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expenditure.reportedByUser.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {expenditure.reportedByUser.role}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>

      {/* Forms */}
      {showAssignmentForm && (
        <AssignmentForm onClose={() => setShowAssignmentForm(false)} />
      )}
      
      {showExpenditureForm && (
        <ExpenditureForm onClose={() => setShowExpenditureForm(false)} />
      )}
    </div>
  );
};

export default AssignmentsExpenditures;