
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  onLogout: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
