'use client';

import React, { useState } from 'react';
import { Service } from '../../types/models';
import { ServiceFormInput } from '../../types/schemas';
import { ServiceCard } from './ServiceCard';
import { ServiceForm } from './ServiceForm';
import { Modal } from '../feedback/Modal';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

export interface ServiceListProps {
  services: Service[];
  loading: boolean;
  error: Error | null;
  onCreateService: (data: ServiceFormInput) => Promise<Service | null>;
  onUpdateService: (id: string, data: ServiceFormInput) => Promise<Service | null>;
  onDeleteService: (id: string) => Promise<boolean>;
  onRefetch: () => Promise<void>;
  createLoading?: boolean;
  updateLoading?: boolean;
  deleteLoading?: boolean;
}

/**
 * Service list component with CRUD operations
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4
 */
export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  loading,
  error,
  onCreateService,
  onUpdateService,
  onDeleteService,
  onRefetch,
  createLoading = false,
  updateLoading = false,
  deleteLoading = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Group services by category (Requirements 3.4)
  const groupedServices = React.useMemo(() => {
    const grouped = new Map<string, Service[]>();
    
    // Only show active services
    const activeServices = services.filter(s => s.isActive);
    
    activeServices.forEach(service => {
      const category = service.category || 'Uncategorized';
      const existing = grouped.get(category) || [];
      grouped.set(category, [...existing, service]);
    });

    // Sort categories alphabetically, but put "Uncategorized" last
    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => {
      if (a[0] === 'Uncategorized') return 1;
      if (b[0] === 'Uncategorized') return -1;
      return a[0].localeCompare(b[0]);
    });

    return new Map(sortedEntries);
  }, [services]);

  const handleAddService = async (data: ServiceFormInput) => {
    const result = await onCreateService(data);
    if (result) {
      setIsAddModalOpen(false);
      await onRefetch();
    }
  };

  const handleUpdateService = async (data: ServiceFormInput) => {
    if (!editingService) return;
    const result = await onUpdateService(editingService.id, data);
    if (result) {
      setEditingService(null);
      await onRefetch();
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    const success = await onDeleteService(deletingService.id);
    if (success) {
      setDeletingService(null);
      await onRefetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner customMessage="Summoning your services..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">Something spooky happened! 👻</p>
        <p className="text-text-muted mb-4">{error.message}</p>
        <Button variant="secondary" onClick={onRefetch}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Services</h2>
          <p className="text-text-muted text-sm">
            Manage your service offerings and prices
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          + Add Service
        </Button>
      </div>

      {/* Service List */}
      {groupedServices.size === 0 ? (
        <div className="text-center py-12 bg-surface border border-primary/20 rounded-lg">
          <p className="text-text-muted mb-4">No services yet. Add your first service to get started!</p>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            + Add Your First Service
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groupedServices.entries()).map(([category, categoryServices]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center gap-2">
                <span className="text-accent">🎃</span>
                {category}
                <span className="text-text-muted text-sm font-normal">
                  ({categoryServices.length})
                </span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={setEditingService}
                    onDelete={setDeletingService}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service"
        size="md"
      >
        <ServiceForm
          onSubmit={handleAddService}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={createLoading}
        />
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Edit Service"
        size="md"
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleUpdateService}
          onCancel={() => setEditingService(null)}
          isLoading={updateLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        title="Delete Service"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-primary">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{deletingService?.name}</span>?
          </p>
          <p className="text-text-muted text-sm">
            This service will be hidden from future quotes but preserved in existing quotes.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setDeletingService(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteService}
              isLoading={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Service
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
