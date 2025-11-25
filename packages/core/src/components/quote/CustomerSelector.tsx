'use client';

import React, { useState, useMemo } from 'react';
import { Customer } from '../../types/models';
import { CustomerFormInput } from '../../types/schemas';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { InlineCustomerForm } from '../customers/InlineCustomerForm';

export interface CustomerSelectorProps {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
  onCreateCustomer: (data: CustomerFormInput) => Promise<Customer | null>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Customer selector component with search and inline creation
 * Validates: Requirements 5.1 (customer selection), 4.5 (inline creation)
 */
export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onSelect,
  onCreateCustomer,
  isLoading = false,
  error,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    const query = searchQuery.toLowerCase().trim();
    return customers.filter(
      customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        (customer.email && customer.email.toLowerCase().includes(query))
    );
  }, [customers, searchQuery]);

  const handleCreateCustomer = async (data: CustomerFormInput) => {
    setIsCreating(true);
    try {
      const newCustomer = await onCreateCustomer(data);
      if (newCustomer) {
        onSelect(newCustomer);
        setShowInlineForm(false);
        setSearchQuery('');
      }
    } finally {

      setIsCreating(false);
    }
  };

  // If a customer is selected, show the selected state
  if (selectedCustomer) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">
          Selected Customer
        </label>
        <div className="flex items-center justify-between p-4 bg-surface border border-primary/30 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-lg">👤</span>
            </div>
            <div>
              <p className="font-medium text-text-primary">{selectedCustomer.name}</p>
              <p className="text-sm text-text-secondary">{selectedCustomer.phone}</p>
              {selectedCustomer.email && (
                <p className="text-xs text-text-muted">{selectedCustomer.email}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null as unknown as Customer)}
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-primary">
          Select Customer <span className="text-accent">*</span>
        </label>
        {!showInlineForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInlineForm(true)}
          >
            + Add New
          </Button>
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {showInlineForm ? (
        <InlineCustomerForm
          onSubmit={handleCreateCustomer}
          onCancel={() => setShowInlineForm(false)}
          isLoading={isCreating}
        />
      ) : (
        <>
          <Input
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          <div className="max-h-60 overflow-y-auto border border-primary/20 rounded-lg divide-y divide-primary/10">
            {isLoading ? (
              <div className="p-4 text-center text-text-secondary">
                <span className="animate-pulse">🔮 Summoning customers...</span>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-text-secondary">
                {searchQuery ? (
                  <span>No customers found matching "{searchQuery}"</span>
                ) : (
                  <span>No customers yet. Add one to get started!</span>
                )}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => onSelect(customer)}
                  className="w-full p-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-primary truncate">{customer.name}</p>
                    <p className="text-sm text-text-secondary truncate">{customer.phone}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
