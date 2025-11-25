'use client';

import React from 'react';

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

/**
 * StatsCard component for displaying dashboard metrics
 * Validates: Requirements 10.1, 10.2, 10.3
 */
export function StatsCard({
  title,
  value,
  icon,
  trend,
  className = '',
}: StatsCardProps) {
  return (
    <div
      className={`
        bg-surface rounded-xl p-6 
        border border-halloween-purple/20
        hover:border-halloween-purple/40
        transition-all duration-300
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-text-muted text-sm font-medium mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-text">
            {value}
          </p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend.isPositive ? 'text-halloween-green' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-halloween-purple text-2xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
