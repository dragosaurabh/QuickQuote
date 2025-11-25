import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateLineTotal,
  calculateSubtotal,
  calculateDiscount,
  calculateTotal,
  calculateQuote,
} from './engine';
import type { CalcQuoteItem, DiscountConfig } from './types';

// Use Math.fround to ensure 32-bit float compatibility
const positivePrice = fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true });
const percentageValue = fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true });

// Arbitrary for generating valid quote items
const quoteItemArb: fc.Arbitrary<CalcQuoteItem> = fc.record({
  serviceId: fc.uuid(),
  serviceName: fc.string({ minLength: 1, maxLength: 100 }),
  quantity: fc.integer({ min: 1, max: 1000 }),
  unitPrice: positivePrice,
});

// Arbitrary for generating valid discount configs
const percentageDiscountArb: fc.Arbitrary<DiscountConfig> = fc.record({
  type: fc.constant('percentage' as const),
  value: percentageValue,
});

const fixedDiscountArb: fc.Arbitrary<DiscountConfig> = fc.record({
  type: fc.constant('fixed' as const),
  value: positivePrice,
});

const discountArb = fc.oneof(percentageDiscountArb, fixedDiscountArb);

describe('Calculation Engine', () => {
  /**
   * Feature: quickquote, Property 1: Line item calculation correctness
   * Validates: Requirements 5.3
   * 
   * For any quote item with quantity q and unit price p, 
   * the line total SHALL equal q × p.
   */
  describe('Property 1: Line item calculation correctness', () => {
    it('line total equals quantity times unit price for all valid inputs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          positivePrice,
          (quantity, unitPrice) => {
            const result = calculateLineTotal(quantity, unitPrice);
            const expected = quantity * unitPrice;
            // Use relative tolerance for floating point comparison
            return Math.abs(result - expected) < 0.0001 * Math.abs(expected) + 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: quickquote, Property 2: Subtotal is sum of line items
   * Validates: Requirements 6.1
   * 
   * For any set of quote items, the subtotal SHALL equal 
   * the sum of all line totals.
   */
  describe('Property 2: Subtotal is sum of line items', () => {
    it('subtotal equals sum of all line totals for all valid item sets', () => {
      fc.assert(
        fc.property(
          fc.array(quoteItemArb, { minLength: 0, maxLength: 20 }),
          (items) => {
            const result = calculateSubtotal(items);
            const expected = items.reduce(
              (sum, item) => sum + item.quantity * item.unitPrice,
              0
            );
            // Use relative tolerance for floating point comparison
            return Math.abs(result - expected) < 0.0001 * Math.abs(expected) + 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: quickquote, Property 3: Percentage discount calculation
   * Validates: Requirements 5.4, 6.2
   * 
   * For any subtotal s and percentage discount p (0-100), 
   * the discount amount SHALL equal s × p / 100.
   */
  describe('Property 3: Percentage discount calculation', () => {
    it('percentage discount equals subtotal times percentage divided by 100', () => {
      fc.assert(
        fc.property(
          positivePrice, // subtotal
          percentageValue, // percentage (0-100)
          (subtotal, percentage) => {
            const discount: DiscountConfig = { type: 'percentage', value: percentage };
            const result = calculateDiscount(subtotal, discount);
            const expected = (subtotal * percentage) / 100;
            // Use relative tolerance for floating point comparison
            return Math.abs(result - expected) < 0.0001 * Math.abs(expected) + 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: quickquote, Property 4: Fixed discount calculation
   * Validates: Requirements 5.5, 6.3
   * 
   * For any subtotal s and fixed discount f, 
   * the final total SHALL equal max(0, s - f).
   */
  describe('Property 4: Fixed discount calculation', () => {
    it('fixed discount subtracts from subtotal with floor at zero', () => {
      fc.assert(
        fc.property(
          positivePrice, // subtotal
          positivePrice, // fixed discount amount
          (subtotal, fixedAmount) => {
            const discount: DiscountConfig = { type: 'fixed', value: fixedAmount };
            const discountAmount = calculateDiscount(subtotal, discount);
            const result = calculateTotal(subtotal, discountAmount);
            const expected = Math.max(0, subtotal - fixedAmount);
            // Use relative tolerance for floating point comparison
            return Math.abs(result - expected) < 0.0001 * Math.abs(expected) + 0.0001;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: quickquote, Property 5: Total never negative
   * Validates: Requirements 6.4
   * 
   * For any quote calculation, the final total SHALL be 
   * greater than or equal to zero.
   */
  describe('Property 5: Total never negative', () => {
    it('total is always non-negative regardless of discount', () => {
      fc.assert(
        fc.property(
          fc.array(quoteItemArb, { minLength: 0, maxLength: 20 }),
          fc.option(discountArb, { nil: undefined }),
          (items, discount) => {
            const result = calculateQuote({ items, discount });
            return result.total >= 0;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
