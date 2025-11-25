'use client';

import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export type DiscountType = 'percentage' | 'fixed';

export interface DiscountConfig {
  type: DiscountType;
  value: number;
}

export interface DiscountInputProps {
  discount: DiscountConfig | null;
  subtotal: number;
  onChange: (discount: DiscountConfig | null) => void;
}

/**
 * Discount input with type toggle (percentage/fixed)
 * Validates: Requirements 5.4 (percentage discount), 5.5 (fixed discount)
 */
export const DiscountInput: React.FC<DiscountInputProps> = ({
  discount,
  subtotal,
  onChange,
}) => {
  // Calculate discount amount for display
  const calculateDiscountAmount = (): number => {
    if (!discount || discount.value <= 0) return 0;
    
    if (discount.type === 'percentage') {
      return (subtotal * discount.value) / 100;
    }
    return Math.min(discount.value, subtotal);
  };

  const discountAmount = calculateDiscountAmount();

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleTypeChange = (type: DiscountType) => {
    if (!discount) {
      onChange({ type, value: 0 });
    } else {
      onChange({ ...discount, type });
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;

    
    // Validate percentage is between 0-100
    if (discount?.type === 'percentage' && value > 100) {
      onChange({ type: 'percentage', value: 100 });
      return;
    }
    
    // Validate fixed discount is non-negative
    if (value < 0) {
      onChange({ type: discount?.type || 'percentage', value: 0 });
      return;
    }

    onChange({ type: discount?.type || 'percentage', value });
  };

  const handleClearDiscount = () => {
    onChange(null);
  };

  const currentType = discount?.type || 'percentage';
  const currentValue = discount?.value || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-text-primary">
          Discount (optional)
        </label>
        {discount && discount.value > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearDiscount}
            className="text-xs text-text-muted hover:text-text-secondary"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Type toggle */}
        <div className="flex rounded-lg border border-primary/20 overflow-hidden">
          <button
            type="button"
            onClick={() => handleTypeChange('percentage')}
            className={`
              px-3 py-2 text-sm font-medium transition-colors
              ${currentType === 'percentage'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-surface/80'
              }
            `}
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('fixed')}
            className={`
              px-3 py-2 text-sm font-medium transition-colors
              ${currentType === 'fixed'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-surface/80'
              }
            `}
          >
            $
          </button>
        </div>

        {/* Value input */}
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max={currentType === 'percentage' ? 100 : undefined}
            step={currentType === 'percentage' ? 1 : 0.01}
            value={currentValue || ''}
            onChange={handleValueChange}
            placeholder={currentType === 'percentage' ? 'Enter %' : 'Enter amount'}
            className="w-full"
          />
        </div>
      </div>

      {/* Discount preview */}
      {discountAmount > 0 && (
        <div className="flex items-center justify-between p-2 bg-accent/10 border border-accent/20 rounded-lg">
          <span className="text-sm text-text-secondary">
            {currentType === 'percentage' 
              ? `${currentValue}% off` 
              : `${formatPrice(currentValue)} off`
            }
          </span>
          <span className="text-sm font-medium text-accent">
            -{formatPrice(discountAmount)}
          </span>
        </div>
      )}
    </div>
  );
};
