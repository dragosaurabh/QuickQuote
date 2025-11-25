'use client';

import React from 'react';
import { Button } from '../ui/Button';

export interface QuoteItemData {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export interface QuoteItemRowProps {
  item: QuoteItemData;
  onQuantityChange: (serviceId: string, quantity: number) => void;
  onRemove: (serviceId: string) => void;
}

/**
 * Quote item row with quantity adjuster and live line total
 * Validates: Requirements 5.3 (quantity adjustment), 5.6 (live calculation)
 */
export const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  // Calculate line total (quantity × unit price)
  const lineTotal = item.quantity * item.unitPrice;

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.serviceId, item.quantity - 1);
    }
  };

  const handleIncrement = () => {
    onQuantityChange(item.serviceId, item.quantity + 1);
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      onQuantityChange(item.serviceId, value);
    }
  };


  return (
    <div className="flex items-center gap-4 p-3 bg-surface/30 rounded-lg border border-primary/10">
      {/* Service name */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{item.serviceName}</p>
        <p className="text-sm text-text-secondary">
          {formatPrice(item.unitPrice)} each
        </p>
      </div>

      {/* Quantity adjuster */}
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDecrement}
          disabled={item.quantity <= 1}
          className="w-8 h-8 p-0"
        >
          −
        </Button>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityInput}
          className="w-12 h-8 text-center bg-background border border-primary/20 rounded text-text-primary text-sm focus:outline-none focus:border-primary"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleIncrement}
          className="w-8 h-8 p-0"
        >
          +
        </Button>
      </div>

      {/* Line total */}
      <div className="w-24 text-right">
        <p className="font-semibold text-accent">{formatPrice(lineTotal)}</p>
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.serviceId)}
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        ✕
      </Button>
    </div>
  );
};

/**
 * Container for multiple quote items with header
 */
export interface QuoteItemsListProps {
  items: QuoteItemData[];
  onQuantityChange: (serviceId: string, quantity: number) => void;
  onRemove: (serviceId: string) => void;
}

export const QuoteItemsList: React.FC<QuoteItemsListProps> = ({
  items,
  onQuantityChange,
  onRemove,
}) => {
  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-text-secondary border border-dashed border-primary/20 rounded-lg">
        <p>No services selected yet.</p>
        <p className="text-sm mt-1">Select services above to add them to the quote.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-text-muted uppercase tracking-wider px-3">
        <span>Service</span>
        <div className="flex items-center gap-4">
          <span className="w-24 text-center">Qty</span>
          <span className="w-24 text-right">Total</span>
          <span className="w-8"></span>
        </div>
      </div>
      {items.map((item) => (
        <QuoteItemRow
          key={item.serviceId}
          item={item}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};
