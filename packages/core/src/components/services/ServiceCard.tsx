'use client';

import React from 'react';
import { Service } from '../../types/models';
import { Badge } from '../feedback/Badge';

export interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

/**
 * Card component for displaying a single service
 * Validates: Requirements 3.1, 3.4
 */
export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="bg-surface border border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-text-primary font-medium truncate">
              {service.name}
            </h3>
            {!service.isActive && (
              <Badge variant="warning" size="sm">
                Inactive
              </Badge>
            )}
          </div>
          {service.description && (
            <p className="text-text-muted text-sm line-clamp-2 mb-2">
              {service.description}
            </p>
          )}
          <p className="text-accent font-semibold text-lg">
            {formatPrice(service.price)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(service)}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={`Edit ${service.name}`}
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
          <button
            onClick={() => onDelete(service)}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={`Delete ${service.name}`}
          >
            <svg
              className="w-5 h-5 text-text-muted hover:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
