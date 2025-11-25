'use client';

import React, { useState } from 'react';
import { Header, HeaderProps } from './Header';
import { Sidebar, NavItem } from './Sidebar';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activeNavId?: string;
  headerProps?: Omit<HeaderProps, 'onMenuToggle' | 'showMenuButton'>;
  onNavigate?: (href: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navItems,
  activeNavId,
  headerProps,
  onNavigate,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        {...headerProps}
        onMenuToggle={toggleSidebar}
        showMenuButton={true}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          navItems={navItems}
          activeItemId={activeNavId}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          onNavigate={onNavigate}
        />

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          <div className="p-4 md:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};
