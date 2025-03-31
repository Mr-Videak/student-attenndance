
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Dashboard from '@/components/dashboard/Dashboard';
import { initializeAppData } from '@/utils/data';

const Index = () => {
  // Initialize app data on first load
  useEffect(() => {
    initializeAppData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
