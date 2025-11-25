'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Customer } from '../../types/models';
import { CustomerFormInput, customerFormSchema } from '../../types/schemas';

export interface CustomerFormProps {
  customer?: Customer | null;
  onSubmit: (data: CustomerFormInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

/**
 * Form for creating or editing a customer
 * Validates: Requirements 4.1, 4.2, 4.4
 */
export const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
  isLoading = false,
  compact = false,
}) => {
  const [formData, setFormData] = useState<CustomerFormInput>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
      });
    }
  }, [customer]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data using Zod schema
    const result = customerFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ _form: error instanceof Error ? error.message : 'Failed to save customer' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
      {errors._form && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {errors._form}
        </div>
      )}

      <Input
        label="Customer Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g., John Smith"
        required
      />

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
        placeholder="e.g., +1 555-123-4567"
        required
      />

      <Input
        label="Email (optional)"
        name="email"
        type="email"
        value={formData.email || ''}
        onChange={handleChange}
        error={errors.email}
        placeholder="e.g., john@example.com"
      />

      {!compact && (
        <TextArea
          label="Address (optional)"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          error={errors.address}
          placeholder="Enter customer address..."
          rows={2}
        />
      )}

      <div className={`flex gap-3 ${compact ? 'pt-2' : 'pt-4'}`}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="flex-1"
        >
          {customer ? 'Update Customer' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
};
