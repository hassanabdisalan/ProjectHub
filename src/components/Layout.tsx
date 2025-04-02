import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './navigation/Navbar';
import { Sidebar } from './navigation/Sidebar';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="pt-16 flex">
        <Sidebar isOpen={isSidebarOpen} />
        <main 
          className={`
            flex-1 
            transition-all 
            duration-300 
            ${isSidebarOpen ? 'ml-64' : 'ml-16'}
          `}
        >
          <div className="container mx-auto px-4 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}