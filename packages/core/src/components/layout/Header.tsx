'use client';

import React from 'react';

export interface HeaderProps {
  appName?: string;
  logoUrl?: string;
  userName?: string;
  onLogout?: () => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  appName = 'QuickQuote',
  logoUrl,
  userName,
  onLogout,
  onMenuToggle,
  showMenuButton = true,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-surface/95 backdrop-blur border-b border-primary/20">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg hover:bg-primary/10 transition-colors md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${appName} logo`}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {appName.charAt(0)}
                </span>
              </div>
            )}
            <h1 className="text-xl font-heading text-text-primary hidden sm:block">
              {appName}
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {userName && (
            <span className="text-sm text-text-muted hidden sm:block">
              {userName}
            </span>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-primary/10 rounded-lg transition-colors min-h-[44px]"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
