'use client';

import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface text-text-muted border-primary/20',
  primary: 'bg-primary/20 text-primary border-primary/30',
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  warning: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  // Quote status variants
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

// Status icons for quote statuses
const statusIcons: Partial<Record<BadgeVariant, string>> = {
  pending: '⏳',
  accepted: '✓',
  rejected: '✗',
  expired: '⌛',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}) => {
  const icon = statusIcons[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

// Helper function to get badge variant from quote status
export const getQuoteStatusVariant = (
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
): BadgeVariant => {
  return status;
};

// Helper function to format quote status for display
export const formatQuoteStatus = (
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};
