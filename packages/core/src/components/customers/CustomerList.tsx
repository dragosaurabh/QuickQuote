'use client';

import React, { useState, useMemo } from 'react';
import { Customer } from '../../types/models';
import { CustomerFormInput } from '../../types/schemas';
import { CustomerCard } from './CustomerCard';
import { CustomerForm } from './CustomerForm';
import { Modal } from '../feedback/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

export interface CustomerListProps {
  customers: Customer[];
  loading: boolean;
  error: Error | null;
  onCreateCustomer: (data: CustomerFormInput) => Promise<Customer | null>;
  onUpdateCustomer: (id: string, data: CustomerFormInput) => Promise<Customer | null>;
  onRefetch: () => Promise<void>;
  createLoading?: boolean;
  updateLoading?: boolean;
}

/**
 * Customer list component with search and CRUD operations
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */
export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  loading,
  error,
  onCreateCustomer,
  onUpdateCustomer,
  onRefetch,
  createLoading = false,
  updateLoading = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter customers based on search query (Requirements 4.3)
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    
    const lowerQuery = searchQuery.toLowerCase().trim();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      customer.phone.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery))
    );
  }, [customers, searchQuery]);

  const handleAddCustomer = async (data: CustomerFormInput) => {
    const result = await onCreateCustomer(data);
    if (result) {
      setIsAddModalOpen(false);
      await onRefetch();
    }
  };

  const handleUpdateCustomer = async (data: CustomerFormInput) => {
    if (!editingCustomer) return;
    const result = await onUpdateCustomer(editingCustomer.id, data);
    if (result) {
      setEditingCustomer(null);
      await onRefetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner customMessage="Summoning your customers..." />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Customers</h2>
          <p className="text-text-muted text-sm">
            Manage your customer contacts
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          + Add Customer
        </Button>
      </div>

      {/* Search Bar (Requirements 4.3) */}
      {customers.length > 0 && (
        <div className="relative">
          <Input
            placeholder="Search customers by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      )}

      {/* Customer List */}
      {customers.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-primary/20 rounded-lg">
          <p className="text-text-muted mb-4">No customers yet. Add your first customer to get started!</p>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            + Add Your First Customer
          </Button>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-primary/20 rounded-lg">
          <p className="text-text-muted">No customers found matching &quot;{searchQuery}&quot;</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={setEditingCustomer}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {searchQuery && filteredCustomers.length > 0 && (
        <p className="text-text-muted text-sm">
          Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
        size="md"
      >
        <CustomerForm
          onSubmit={handleAddCustomer}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={createLoading}
        />
      </Modal>

      {/* Edit Customer Modal */}
      <Modal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        title="Edit Customer"
        size="md"
      >
        <CustomerForm
          customer={editingCustomer}
          onSubmit={handleUpdateCustomer}
          onCancel={() => setEditingCustomer(null)}
          isLoading={updateLoading}
        />
      </Modal>
    </div>
  );
};
