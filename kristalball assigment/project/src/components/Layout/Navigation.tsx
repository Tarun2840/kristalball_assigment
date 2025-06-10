import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ArrowLeftRight, 
  Users, 
  LogOut, 
  Shield,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
    { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { id: 'assignments', label: 'Assignments & Expenditures', icon: Users }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'text-red-400';
      case 'Base Commander':
        return 'text-yellow-400';
      case 'Logistics Officer':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-slate-800 text-white w-64 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-blue-400" />
          <h1 className="text-xl font-bold">MILAMS</h1>
        </div>
        <div className="text-sm text-gray-300">
          Military Asset Management System
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.fullName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.fullName}</div>
            <div className={`text-xs ${getRoleColor(user?.role || '')}`}>
              {user?.role}
            </div>
          </div>
        </div>
        {user?.assignedBases && user.assignedBases.length > 0 && (
          <div className="mt-2 flex items-center text-xs text-gray-400">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{user.assignedBases.length} Base{user.assignedBases.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;