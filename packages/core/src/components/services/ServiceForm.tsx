'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Service } from '../../types/models';
import { ServiceFormInput, serviceFormSchema } from '../../types/schemas';
import { validateServiceForm } from '../../lib/validation';

export interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: ServiceFormInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * Form for creating or editing a service
 * Validates: Requirements 3.1, 3.2, 3.5
 */
export const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ServiceFormInput>({
    name: '',
    description: '',
    price: 0,
    category: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        category: service.category || '',
      });
    }
  }, [service]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateServiceForm(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      setErrors({ _form: error instanceof Error ? error.message : 'Failed to save service' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors._form && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {errors._form}
        </div>
      )}

      <Input
        label="Service Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g., Basic Website Design"
        required
      />

      <TextArea
        label="Description"
        name="description"
        value={formData.description || ''}
        onChange={handleChange}
        error={errors.description}
        placeholder="Describe what this service includes..."
        rows={3}
      />

      <Input
        label="Price"
        name="price"
        type="number"
        step="0.01"
        min="0.01"
        value={formData.price || ''}
        onChange={handleChange}
        error={errors.price}
        placeholder="0.00"
        required
      />

      <Input
        label="Category"
        name="category"
        value={formData.category || ''}
        onChange={handleChange}
        error={errors.category}
        placeholder="e.g., Web Design, Photography"
      />

      <div className="flex gap-3 pt-4">
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
          {service ? 'Update Service' : 'Add Service'}
        </Button>
      </div>
    </form>
  );
};
