'use client';

import React from 'react';
import { Customer } from '../../types/models';

export interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onSelect?: (customer: Customer) => void;
  isSelected?: boolean;
  selectable?: boolean;
}

/**
 * Card component for displaying a single customer
 * Validates: Requirements 4.1, 4.2
 */
export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onSelect,
  isSelected = false,
  selectable = false,
}) => {
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(customer);
    }
  };

  return (
    <div
      className={`bg-surface border rounded-lg p-4 transition-colors ${
        selectable ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-primary/20 hover:border-primary/40'
      }`}
      onClick={handleClick}
      role={selectable ? 'button' : undefined}
      tabIndex={selectable ? 0 : undefined}
      onKeyDown={selectable ? (e) => e.key === 'Enter' && handleClick() : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-text-primary font-medium truncate">
              {customer.name}
            </h3>
            {isSelected && (
              <span className="text-primary text-sm">✓</span>
            )}
          </div>
          <p className="text-text-muted text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {customer.phone}
          </p>
          {customer.email && (
            <p className="text-text-muted text-sm flex items-center gap-1 mt-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{customer.email}</span>
            </p>
          )}
          {customer.address && (
            <p className="text-text-muted text-sm flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{customer.address}</span>
            </p>
          )}
        </div>

        {!selectable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(customer);
            }}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={`Edit ${customer.name}`}
          >
            <svg
              className="w-5 h-5 text-text-muted hover:text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
