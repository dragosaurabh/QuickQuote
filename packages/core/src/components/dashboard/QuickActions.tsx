'use client';

import React from 'react';
import { Button } from '../ui/Button';

export interface QuickActionsProps {
  onCreateQuote?: () => void;
  onViewAllQuotes?: () => void;
  onManageServices?: () => void;
  onManageCustomers?: () => void;
  onSettings?: () => void;
  className?: string;
}

/**
 * QuickActions component for dashboard shortcuts
 * Validates: Requirements 10.4
 */
export function QuickActions({
  onCreateQuote,
  onViewAllQuotes,
  onManageServices,
  onManageCustomers,
  onSettings,
  className = '',
}: QuickActionsProps) {
  return (
    <div
      className={`
        bg-surface rounded-xl p-6 
        border border-halloween-purple/20
        ${className}
      `}
    >
      <h3 className="text-lg font-semibold text-text mb-4">
        Quick Actions ⚡
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="primary"
          onClick={onCreateQuote}
          className="flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>Create Quote</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onViewAllQuotes}
          className="flex items-center justify-center gap-2"
        >
          <span>📋</span>
          <span>View All</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onManageServices}
          className="flex items-center justify-center gap-2"
        >
          <span>🛠️</span>
          <span>Services</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onManageCustomers}
          className="flex items-center justify-center gap-2"
        >
          <span>👥</span>
          <span>Customers</span>
        </Button>
        <Button
          variant="ghost"
          onClick={onSettings}
          className="flex items-center justify-center gap-2 col-span-2"
        >
          <span>⚙️</span>
          <span>Settings</span>
        </Button>
      </div>
    </div>
  );
}
