import React from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import api from '../apiClient';

const MainLayout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    api.post('/api/audit-logs/event', {
      action: 'Page View',
      action_type: 'VIEW',
      description: `Visited ${location.pathname}`,
      entity_type: 'Page',
      entity_id: location.pathname,
    }).catch(() => {
      // Keep navigation responsive even when audit event logging fails.
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;