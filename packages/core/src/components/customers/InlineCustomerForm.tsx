'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CustomerFormInput, customerFormSchema } from '../../types/schemas';

export interface InlineCustomerFormProps {
  onSubmit: (data: CustomerFormInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Compact inline form for creating a customer during quote creation
 * Validates: Requirements 4.5 - inline customer creation without leaving quote flow
 */
export const InlineCustomerForm: React.FC<InlineCustomerFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CustomerFormInput>({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      setErrors({ _form: error instanceof Error ? error.message : 'Failed to create customer' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-surface/50 border border-primary/20 rounded-lg space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-accent">👤</span>
        <h4 className="text-sm font-medium text-text-primary">Quick Add Customer</h4>
      </div>

      {errors._form && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs">
          {errors._form}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Customer name"
          required
        />

        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="Phone number"
          required
        />
      </div>

      <Input
        label="Email (optional)"
        name="email"
        type="email"
        value={formData.email || ''}
        onChange={handleChange}
        error={errors.email}
        placeholder="Email address"
      />

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isLoading}
        >
          Add & Select
        </Button>
      </div>
    </form>
  );
};
