import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { GlobalSearchModal } from '../modals/GlobalSearchModal';
import { StudentDetailsModal } from '../modals/StudentDetailsModal';
import { ToastContainer } from '../common/ToastContainer';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex antialiased">
      {/* Sidebar with full height and top circular logo */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Toasts */}
      <GlobalSearchModal />
      <StudentDetailsModal />
      <ToastContainer />
    </div>
  );
};
