'use client';

import React, { useMemo } from 'react';
import { Service } from '../../types/models';
import { Checkbox } from '../ui/Checkbox';

export interface ServiceSelectorProps {
  services: Service[];
  selectedServiceIds: Set<string>;
  onToggleService: (serviceId: string) => void;
  isLoading?: boolean;
}

/**
 * Service selector with checkboxes grouped by category
 * Validates: Requirements 5.2 (service selection), 3.4 (grouped by category)
 */
export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServiceIds,
  onToggleService,
  isLoading = false,
}) => {
  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped = new Map<string, Service[]>();
    
    // Only show active services
    const activeServices = services.filter(s => s.isActive);
    
    activeServices.forEach(service => {
      const category = service.category || 'Uncategorized';
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, service]);
    });

    // Sort categories alphabetically, but put "Uncategorized" last
    const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    });

    return { grouped, sortedCategories };
  }, [services]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-text-primary">
          Select Services
        </label>
        <div className="p-8 text-center text-text-secondary border border-primary/20 rounded-lg">
          <span className="animate-pulse">🎃 Loading services...</span>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-text-primary">
          Select Services
        </label>
        <div className="p-8 text-center text-text-secondary border border-primary/20 rounded-lg">
          <p>No services available.</p>
          <p className="text-sm mt-1">Add services in the Services page first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-primary">
          Select Services
        </label>
        <span className="text-sm text-text-secondary">
          {selectedServiceIds.size} selected
        </span>
      </div>

      <div className="border border-primary/20 rounded-lg divide-y divide-primary/10 max-h-80 overflow-y-auto">
        {servicesByCategory.sortedCategories.map((category) => {
          const categoryServices = servicesByCategory.grouped.get(category) || [];
          
          return (
            <div key={category} className="p-3">
              <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryServices.map((service) => {
                  const isSelected = selectedServiceIds.has(service.id);
                  
                  return (
                    <label
                      key={service.id}
                      className={`
                        flex items-center justify-between p-2 rounded-lg cursor-pointer
                        transition-colors
                        ${isSelected 
                          ? 'bg-primary/20 border border-primary/40' 
                          : 'hover:bg-surface/50 border border-transparent'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onToggleService(service.id)}
                        />
                        <div>
                          <p className="font-medium text-text-primary text-sm">
                            {service.name}
                          </p>
                          {service.description && (
                            <p className="text-xs text-text-muted truncate max-w-xs">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-accent">
                        {formatPrice(service.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
