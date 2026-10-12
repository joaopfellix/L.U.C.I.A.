/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/pages/DashboardPage';
import { AssistantPage } from './components/pages/AssistantPage';
import { TasksPage } from './components/pages/TasksPage';
import { MemoryPage } from './components/pages/MemoryPage';
import { AutomationsPage } from './components/pages/AutomationsPage';
import { HistoryPage } from './components/pages/HistoryPage';
import { SettingsPage } from './components/pages/SettingsPage';

const AppContent: React.FC = () => {
  const { activePage } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'assistant':
        return <AssistantPage />;
      case 'tasks':
        return <TasksPage />;
      case 'memory':
        return <MemoryPage />;
      case 'automations':
        return <AutomationsPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AssistantPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F2F2] flex relative selection:bg-[#303036] selection:text-[#F2F2F2]">
      {/* Futuristic diffused ambient glow */}
      <div className="bg-futuristic-glow" />

      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main App Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 z-10 ${
          isCollapsed ? 'md:pl-18' : 'md:pl-64'
        }`}
      >
        <Header
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
          isSidebarCollapsed={isCollapsed}
          onExpandSidebar={() => setIsCollapsed(false)}
        />
        <main className="flex-1 overflow-x-hidden">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
