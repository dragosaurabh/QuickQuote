/**
 * Quote management utility functions
 * These pure functions handle sorting, filtering, and duplication logic
 * for quotes, enabling property-based testing.
 */

import { Quote, QuoteStatus } from '../types/models';

/**
 * Sort quotes by creation date in descending order (newest first)
 * Validates: Requirements 9.1
 */
export function sortQuotesByDate(quotes: Quote[]): Quote[] {
  return [...quotes].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order
  });
}

/**
 * Filter quotes by status
 * Validates: Requirements 9.2
 */
export function filterQuotesByStatus(quotes: Quote[], status: QuoteStatus): Quote[] {
  return quotes.filter(quote => quote.status === status);
}

/**
 * Search quotes by customer name or quote number
 * Validates: Requirements 9.3
 */
export function searchQuotes(quotes: Quote[], query: string): Quote[] {
  if (!query.trim()) {
    return quotes;
  }
  
  const lowerQuery = query.toLowerCase().trim();
  return quotes.filter(quote =>
    quote.quoteNumber.toLowerCase().includes(lowerQuery) ||
    (quote.customer?.name.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Create a duplicate quote data structure from an existing quote
 * Validates: Requirements 9.4
 * 
 * Returns the data needed to create a new quote with the same
 * customer and services as the original.
 */
export interface DuplicateQuoteData {
  customerId: string | undefined;
  items: Array<{
    serviceId?: string;
    serviceName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue: number;
  total: number;
  notes?: string;
  terms?: string;
}

export function createDuplicateQuoteData(quote: Quote): DuplicateQuoteData {
  return {
    customerId: quote.customerId,
    items: (quote.items || []).map(item => ({
      serviceId: item.serviceId,
      serviceName: item.serviceName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
    subtotal: quote.subtotal,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    total: quote.total,
    notes: quote.notes,
    terms: quote.terms,
  };
}

/**
 * Check if a quote is expired based on its validUntil date
 * Validates: Requirements 9.6
 */
export function isQuoteExpired(quote: Quote, currentDate: Date = new Date()): boolean {
  if (!quote.validUntil) {
    return false;
  }
  return new Date(quote.validUntil) < currentDate;
}

/**
 * Get quotes that should be marked as expired
 * Validates: Requirements 9.6
 */
export function getExpiredQuotes(quotes: Quote[], currentDate: Date = new Date()): Quote[] {
  return quotes.filter(
    quote => quote.status === 'pending' && isQuoteExpired(quote, currentDate)
  );
}
