'use client';

import React from 'react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  navItems: NavItem[];
  activeItemId?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onNavigate?: (href: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeItemId,
  isOpen = true,
  onClose,
  onNavigate,
}) => {
  const handleNavClick = (href: string) => {
    onNavigate?.(href);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50 md:z-30
          h-screen w-64 bg-surface border-r border-primary/20
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-4 md:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6 text-text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = item.id === activeItemId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    text-left transition-all duration-200 min-h-[44px]
                    ${
                      isActive
                        ? 'bg-primary/20 text-primary border-l-2 border-primary'
                        : 'text-text-muted hover:bg-primary/10 hover:text-text-primary'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.icon && (
                    <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                  )}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary/10">
            <p className="text-xs text-text-muted text-center">
              🎃 SpookyQuote v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
