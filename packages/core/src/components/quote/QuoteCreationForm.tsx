'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Customer, Service, Business } from '../../types/models';
import { CustomerFormInput } from '../../types/schemas';
import { calculateQuote } from '../../calculation/engine';
import { CustomerSelector } from './CustomerSelector';
import { ServiceSelector } from './ServiceSelector';
import { QuoteItemsList, QuoteItemData } from './QuoteItemRow';
import { DiscountInput, DiscountConfig } from './DiscountInput';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/TextArea';
import { Input } from '../ui/Input';

export interface QuoteCreationFormProps {
  business: Business;
  customers: Customer[];
  services: Service[];
  customersLoading?: boolean;
  servicesLoading?: boolean;
  onCreateCustomer: (data: CustomerFormInput) => Promise<Customer | null>;
  onSubmit: (data: QuoteFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface QuoteFormData {
  customerId: string;
  items: Array<{
    serviceId: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  total: number;
  notes?: string;
  terms?: string;
  validUntil?: Date;
}

/**
 * Complete quote creation form
 * Validates: Requirements 5.1, 5.2, 5.6, 5.7, 5.8
 */
export const QuoteCreationForm: React.FC<QuoteCreationFormProps> = ({
  business,
  customers,
  services,
  customersLoading = false,
  servicesLoading = false,
  onCreateCustomer,
  onSubmit,
  isSubmitting = false,
}) => {

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());
  const [quoteItems, setQuoteItems] = useState<QuoteItemData[]>([]);
  const [discount, setDiscount] = useState<DiscountConfig | null>(null);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(business.defaultTerms || '');
  const [validityDays, setValidityDays] = useState(business.defaultValidityDays || 7);
  const [customerError, setCustomerError] = useState<string | null>(null);

  // Calculate totals using the calculation engine
  const calculation = useMemo(() => {
    const calcItems = quoteItems.map(item => ({
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const discountConfig = discount && discount.value > 0
      ? { type: discount.type, value: discount.value }
      : undefined;

    return calculateQuote({ items: calcItems, discount: discountConfig });
  }, [quoteItems, discount]);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle service toggle
  const handleToggleService = useCallback((serviceId: string) => {
    setSelectedServiceIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
        // Remove from quote items
        setQuoteItems(items => items.filter(item => item.serviceId !== serviceId));
      } else {
        newSet.add(serviceId);
        // Add to quote items with quantity 1
        const service = services.find(s => s.id === serviceId);
        if (service) {
          setQuoteItems(items => [...items, {
            serviceId: service.id,
            serviceName: service.name,
            quantity: 1,
            unitPrice: service.price,
          }]);
        }
      }
      return newSet;
    });
  }, [services]);

  // Handle quantity change
  const handleQuantityChange = useCallback((serviceId: string, quantity: number) => {
    setQuoteItems(items =>
      items.map(item =>
        item.serviceId === serviceId ? { ...item, quantity } : item
      )
    );
  }, []);

  // Handle item removal
  const handleRemoveItem = useCallback((serviceId: string) => {
    setSelectedServiceIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(serviceId);
      return newSet;
    });
    setQuoteItems(items => items.filter(item => item.serviceId !== serviceId));
  }, []);

  // Handle customer creation
  const handleCreateCustomer = async (data: CustomerFormInput): Promise<Customer | null> => {
    setCustomerError(null);
    const customer = await onCreateCustomer(data);
    if (customer) {
      setSelectedCustomer(customer);
    }
    return customer;
  };

  // Calculate validity date
  const validUntil = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + validityDays);
    return date;
  }, [validityDays]);


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer selection
    if (!selectedCustomer) {
      setCustomerError('Please select a customer');
      return;
    }

    // Validate at least one item
    if (quoteItems.length === 0) {
      return;
    }

    const formData: QuoteFormData = {
      customerId: selectedCustomer.id,
      items: quoteItems.map(item => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
      })),
      subtotal: calculation.subtotal,
      discountType: discount?.type,
      discountValue: discount?.value,
      total: calculation.total,
      notes: notes || undefined,
      terms: terms || undefined,
      validUntil,
    };

    await onSubmit(formData);
  };

  const canSubmit = selectedCustomer && quoteItems.length > 0 && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: Customer Selection */}
      <section className="bg-surface rounded-xl p-6 border border-primary/20">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-accent">1.</span> Customer
        </h2>
        <CustomerSelector
          customers={customers}
          selectedCustomer={selectedCustomer}
          onSelect={setSelectedCustomer}
          onCreateCustomer={handleCreateCustomer}
          isLoading={customersLoading}
          error={customerError}
        />
      </section>

      {/* Step 2: Service Selection */}
      <section className="bg-surface rounded-xl p-6 border border-primary/20">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-accent">2.</span> Services
        </h2>
        <ServiceSelector
          services={services}
          selectedServiceIds={selectedServiceIds}
          onToggleService={handleToggleService}
          isLoading={servicesLoading}
        />
      </section>

      {/* Step 3: Quote Items */}
      {quoteItems.length > 0 && (
        <section className="bg-surface rounded-xl p-6 border border-primary/20">
          <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span className="text-accent">3.</span> Quote Items
          </h2>
          <QuoteItemsList
            items={quoteItems}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemoveItem}
          />
        </section>
      )}

      {/* Step 4: Discount & Details */}
      <section className="bg-surface rounded-xl p-6 border border-primary/20">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-accent">4.</span> Details
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <DiscountInput
              discount={discount}
              subtotal={calculation.subtotal}
              onChange={setDiscount}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Valid for (days)
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={validityDays}
                onChange={(e) => setValidityDays(parseInt(e.target.value) || 7)}
              />
              <p className="text-xs text-text-muted mt-1">
                Expires: {validUntil.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <TextArea
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for the customer..."
              rows={3}
            />

            <TextArea
              label="Terms & Conditions"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Payment terms, delivery conditions, etc."
              rows={3}
            />
          </div>
        </div>
      </section>


      {/* Summary & Submit */}
      <section className="bg-surface rounded-xl p-6 border border-accent/30">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <span className="text-accent">💀</span> Quote Summary
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal ({quoteItems.length} items)</span>
            <span>{formatPrice(calculation.subtotal)}</span>
          </div>

          {calculation.discountAmount > 0 && (
            <div className="flex justify-between text-accent">
              <span>
                Discount
                {discount?.type === 'percentage' && ` (${discount.value}%)`}
              </span>
              <span>-{formatPrice(calculation.discountAmount)}</span>
            </div>
          )}

          <div className="border-t border-primary/20 pt-3">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-text-primary">Total</span>
              <span className="text-accent">{formatPrice(calculation.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!canSubmit}
            isLoading={isSubmitting}
            className="flex-1"
          >
            🎃 Generate Quote
          </Button>
        </div>

        {!selectedCustomer && quoteItems.length > 0 && (
          <p className="text-sm text-red-400 mt-2 text-center">
            Please select a customer to generate the quote
          </p>
        )}

        {selectedCustomer && quoteItems.length === 0 && (
          <p className="text-sm text-text-muted mt-2 text-center">
            Select at least one service to generate the quote
          </p>
        )}
      </section>
    </form>
  );
};
