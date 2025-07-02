import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Receipt,
  ClipboardList
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'Billing', path: '/billing' },
  { icon: Receipt, label: 'Bills', path: '/bills' },
  { icon: ShoppingCart, label: 'Purchases', path: '/purchases' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Users, label: 'Clients', path: '/clients' },
  { icon: ClipboardList, label: 'Reports', path: '/reports' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-center">
          SECURE AUTOMATION
        </h1>
        <p className="text-xs text-gray-400 text-center mt-1">
          Admin Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
