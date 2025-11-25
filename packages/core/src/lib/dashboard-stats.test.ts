import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateTotalQuotesThisMonth,
  calculateTotalAcceptedValueThisMonth,
  calculateTotalPendingAmount,
  calculateDashboardStats,
  getRecentQuotes,
  isQuoteInMonth,
  getQuotesInMonth,
} from './dashboard-stats';
import { Quote, QuoteStatus } from '../types/models';

// Arbitrary for generating valid quote statuses
const quoteStatusArb: fc.Arbitrary<QuoteStatus> = fc.constantFrom(
  'pending',
  'accepted',
  'rejected',
  'expired'
);

// Arbitrary for generating quotes with controlled dates
const quoteWithDateArb = (dateArb: fc.Arbitrary<Date>): fc.Arbitrary<Quote> =>
  fc.record({
    id: fc.uuid(),
    businessId: fc.uuid(),
    customerId: fc.option(fc.uuid(), { nil: undefined }),
    quoteNumber: fc.stringMatching(/^QQ-\d{4}-\d{3,}$/),
    status: quoteStatusArb,
    subtotal: fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true }),
    discountType: fc.option(fc.constantFrom('percentage' as const, 'fixed' as const), { nil: undefined }),
    discountValue: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
    total: fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true }),
    notes: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    terms: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
    validUntil: fc.option(fc.date(), { nil: undefined }),
    createdAt: dateArb,
    updatedAt: fc.date(),
    customer: fc.constant(undefined),
    items: fc.constant(undefined),
  });

// Standard quote arbitrary with any date
const quoteArb: fc.Arbitrary<Quote> = quoteWithDateArb(fc.date());


describe('Dashboard Stats', () => {
  /**
   * Feature: quickquote, Property 14: Dashboard stats accuracy
   * Validates: Requirements 10.1, 10.2, 10.3
   * 
   * For any set of quotes in a month, the dashboard SHALL display 
   * the correct count and sum of accepted quote values.
   */
  describe('Property 14: Dashboard stats accuracy', () => {
    it('totalQuotesThisMonth equals count of quotes created in current month', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (quotes, currentDate) => {
            const result = calculateTotalQuotesThisMonth(quotes, currentDate);
            
            // Manually count quotes in the same month
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const expectedCount = quotes.filter(q => {
              const qDate = new Date(q.createdAt);
              return qDate.getFullYear() === year && qDate.getMonth() === month;
            }).length;
            
            return result === expectedCount;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('totalAcceptedValueThisMonth equals sum of accepted quote totals in current month', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (quotes, currentDate) => {
            const result = calculateTotalAcceptedValueThisMonth(quotes, currentDate);
            
            // Manually sum accepted quotes in the same month
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const expectedSum = quotes
              .filter(q => {
                const qDate = new Date(q.createdAt);
                return qDate.getFullYear() === year && 
                       qDate.getMonth() === month && 
                       q.status === 'accepted';
              })
              .reduce((sum, q) => sum + q.total, 0);
            
            // Use tolerance for floating point comparison
            return Math.abs(result - expectedSum) < 0.01;
          }
        ),
        { numRuns: 100 }
      );
    });


    it('totalPendingAmount equals sum of all pending quote totals', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          (quotes) => {
            const result = calculateTotalPendingAmount(quotes);
            
            // Manually sum pending quotes
            const expectedSum = quotes
              .filter(q => q.status === 'pending')
              .reduce((sum, q) => sum + q.total, 0);
            
            // Use tolerance for floating point comparison
            return Math.abs(result - expectedSum) < 0.01;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('calculateDashboardStats returns consistent values with individual functions', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (quotes, currentDate) => {
            const stats = calculateDashboardStats(quotes, currentDate);
            
            const expectedQuotesThisMonth = calculateTotalQuotesThisMonth(quotes, currentDate);
            const expectedAcceptedValue = calculateTotalAcceptedValueThisMonth(quotes, currentDate);
            const expectedPendingAmount = calculateTotalPendingAmount(quotes);
            
            return (
              stats.totalQuotesThisMonth === expectedQuotesThisMonth &&
              Math.abs(stats.totalAcceptedValueThisMonth - expectedAcceptedValue) < 0.01 &&
              Math.abs(stats.totalPendingAmount - expectedPendingAmount) < 0.01
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Recent quotes', () => {
    it('getRecentQuotes returns at most the requested count', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          fc.integer({ min: 1, max: 20 }),
          (quotes, count) => {
            const recent = getRecentQuotes(quotes, count);
            return recent.length <= count && recent.length <= quotes.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getRecentQuotes returns quotes sorted by creation date descending', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          fc.integer({ min: 1, max: 20 }),
          (quotes, count) => {
            const recent = getRecentQuotes(quotes, count);
            
            // Verify descending order
            for (let i = 0; i < recent.length - 1; i++) {
              const currentDate = new Date(recent[i].createdAt).getTime();
              const nextDate = new Date(recent[i + 1].createdAt).getTime();
              if (currentDate < nextDate) {
                return false;
              }
            }
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
