import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans relative">
      {/* 1. Sidebar Otomatis */}
      <Sidebar />

      {/* 2. Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        
        {/* Konten Utama */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          {/* Jarak agar konten tidak ditabrak Topbar Mobile */}
          <div className="lg:hidden h-20"></div> 
          
          <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
