/**
 * Dashboard statistics utility functions
 * These pure functions handle stats calculation for quotes,
 * enabling property-based testing.
 * 
 * Validates: Requirements 10.1, 10.2, 10.3
 */

import { Quote } from '../types/models';

export interface DashboardStats {
  totalQuotesThisMonth: number;
  totalAcceptedValueThisMonth: number;
  totalPendingAmount: number;
}

/**
 * Check if a quote was created in the given month/year
 */
export function isQuoteInMonth(quote: Quote, year: number, month: number): boolean {
  const quoteDate = new Date(quote.createdAt);
  return quoteDate.getFullYear() === year && quoteDate.getMonth() === month;
}

/**
 * Get quotes created in a specific month
 */
export function getQuotesInMonth(quotes: Quote[], year: number, month: number): Quote[] {
  return quotes.filter(quote => isQuoteInMonth(quote, year, month));
}

/**
 * Calculate total quotes created this month
 * Validates: Requirements 10.1
 */
export function calculateTotalQuotesThisMonth(
  quotes: Quote[],
  currentDate: Date = new Date()
): number {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  return getQuotesInMonth(quotes, year, month).length;
}

/**
 * Calculate total value of accepted quotes this month
 * Validates: Requirements 10.2
 */
export function calculateTotalAcceptedValueThisMonth(
  quotes: Quote[],
  currentDate: Date = new Date()
): number {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  return getQuotesInMonth(quotes, year, month)
    .filter(quote => quote.status === 'accepted')
    .reduce((sum, quote) => sum + quote.total, 0);
}


/**
 * Calculate total pending amount (all pending quotes, not just this month)
 * Validates: Requirements 10.3
 */
export function calculateTotalPendingAmount(quotes: Quote[]): number {
  return quotes
    .filter(quote => quote.status === 'pending')
    .reduce((sum, quote) => sum + quote.total, 0);
}

/**
 * Calculate all dashboard stats at once
 * Validates: Requirements 10.1, 10.2, 10.3
 */
export function calculateDashboardStats(
  quotes: Quote[],
  currentDate: Date = new Date()
): DashboardStats {
  return {
    totalQuotesThisMonth: calculateTotalQuotesThisMonth(quotes, currentDate),
    totalAcceptedValueThisMonth: calculateTotalAcceptedValueThisMonth(quotes, currentDate),
    totalPendingAmount: calculateTotalPendingAmount(quotes),
  };
}

/**
 * Get recent quotes (last N quotes by creation date)
 * Validates: Requirements 10.4
 */
export function getRecentQuotes(quotes: Quote[], count: number = 5): Quote[] {
  return [...quotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);
}
