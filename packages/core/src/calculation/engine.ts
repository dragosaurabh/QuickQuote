// Quote calculation engine
// Implements Requirements: 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4

import type { CalcQuoteItem, DiscountConfig, QuoteCalculation, QuoteResult } from './types';

/**
 * Calculates the line total for a quote item.
 * Line total = quantity × unit price
 * 
 * @param quantity - Number of units (must be positive integer)
 * @param unitPrice - Price per unit (must be non-negative)
 * @returns The line total (quantity × unitPrice)
 * 
 * Requirements: 5.3
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * Calculates the subtotal for all quote items.
 * Subtotal = sum of all line totals
 * 
 * @param items - Array of quote items
 * @returns The subtotal (sum of all quantity × unitPrice)
 * 
 * Requirements: 6.1
 */
export function calculateSubtotal(items: CalcQuoteItem[]): number {
  return items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0);
}

/**
 * Calculates the discount amount based on discount configuration.
 * - Percentage discount: subtotal × percentage / 100
 * - Fixed discount: the fixed amount itself
 * 
 * @param subtotal - The subtotal before discount
 * @param discount - Discount configuration (type and value)
 * @returns The discount amount
 * 
 * Requirements: 5.4, 5.5, 6.2, 6.3
 */
export function calculateDiscount(subtotal: number, discount: DiscountConfig): number {
  if (discount.type === 'percentage') {
    return (subtotal * discount.value) / 100;
  }
  return discount.value;
}

/**
 * Calculates the final total after applying discount.
 * Total = max(0, subtotal - discountAmount)
 * Ensures total is never negative.
 * 
 * @param subtotal - The subtotal before discount
 * @param discountAmount - The discount amount to subtract
 * @returns The final total (never negative)
 * 
 * Requirements: 6.4
 */
export function calculateTotal(subtotal: number, discountAmount: number): number {
  return Math.max(0, subtotal - discountAmount);
}

/**
 * Orchestrator function that calculates the complete quote.
 * Combines all calculation functions to produce a full quote result.
 * 
 * @param input - Quote calculation input with items and optional discount
 * @returns Complete quote result with line items, subtotal, discount, and total
 * 
 * Requirements: 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4
 */
export function calculateQuote(input: QuoteCalculation): QuoteResult {
  const lineItems = input.items.map(item => ({
    ...item,
    lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
  }));

  const subtotal = calculateSubtotal(input.items);
  const discountAmount = input.discount ? calculateDiscount(subtotal, input.discount) : 0;
  const total = calculateTotal(subtotal, discountAmount);

  return { lineItems, subtotal, discountAmount, total };
}
