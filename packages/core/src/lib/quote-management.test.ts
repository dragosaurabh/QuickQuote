import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  sortQuotesByDate,
  filterQuotesByStatus,
  searchQuotes,
  createDuplicateQuoteData,
  isQuoteExpired,
  getExpiredQuotes,
} from './quote-management';
import { Quote, QuoteStatus, QuoteItem, Customer } from '../types/models';

// Arbitrary for generating valid quote statuses
const quoteStatusArb: fc.Arbitrary<QuoteStatus> = fc.constantFrom(
  'pending',
  'accepted',
  'rejected',
  'expired'
);

// Arbitrary for generating valid customers
const customerArb: fc.Arbitrary<Customer> = fc.record({
  id: fc.uuid(),
  businessId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  phone: fc.string({ minLength: 10, maxLength: 20 }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  address: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

// Arbitrary for generating valid quote items
const quoteItemArb: fc.Arbitrary<QuoteItem> = fc.record({
  id: fc.uuid(),
  quoteId: fc.uuid(),
  serviceId: fc.option(fc.uuid(), { nil: undefined }),
  serviceName: fc.string({ minLength: 1, maxLength: 100 }),
  quantity: fc.integer({ min: 1, max: 100 }),
  unitPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
  totalPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true }),
  createdAt: fc.date(),
});

// Arbitrary for generating valid quotes
const quoteArb: fc.Arbitrary<Quote> = fc.record({
  id: fc.uuid(),
  businessId: fc.uuid(),
  customerId: fc.option(fc.uuid(), { nil: undefined }),
  quoteNumber: fc.stringMatching(/^QQ-\d{4}-\d{3,}$/),
  status: quoteStatusArb,
  subtotal: fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true }),
  discountType: fc.option(fc.constantFrom('percentage' as const, 'fixed' as const), { nil: undefined }),
  discountValue: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
  total: fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true }),
  notes: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  terms: fc.option(fc.string({ maxLength: 500 }), { nil: undefined }),
  validUntil: fc.option(fc.date(), { nil: undefined }),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  customer: fc.option(customerArb, { nil: undefined }),
  items: fc.option(fc.array(quoteItemArb, { minLength: 0, maxLength: 10 }), { nil: undefined }),
});


describe('Quote Management', () => {
  /**
   * Feature: quickquote, Property 10: Quote list sorting
   * Validates: Requirements 9.1
   * 
   * For any list of quotes returned by the system, they SHALL be 
   * sorted by creation date in descending order.
   */
  describe('Property 10: Quote list sorting', () => {
    it('quotes are sorted by creation date in descending order', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          (quotes) => {
            const sorted = sortQuotesByDate(quotes);
            
            // Verify the result has the same length
            if (sorted.length !== quotes.length) {
              return false;
            }
            
            // Verify descending order: each quote's date >= next quote's date
            for (let i = 0; i < sorted.length - 1; i++) {
              const currentDate = new Date(sorted[i].createdAt).getTime();
              const nextDate = new Date(sorted[i + 1].createdAt).getTime();
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

    it('sorting preserves all original quotes', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          (quotes) => {
            const sorted = sortQuotesByDate(quotes);
            
            // Every quote in original should be in sorted
            const sortedIds = new Set(sorted.map(q => q.id));
            return quotes.every(q => sortedIds.has(q.id));
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: quickquote, Property 11: Quote status filtering
   * Validates: Requirements 9.2
   * 
   * For any status filter applied, all returned quotes SHALL have 
   * the matching status.
   */
  describe('Property 11: Quote status filtering', () => {
    it('all filtered quotes have the matching status', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          quoteStatusArb,
          (quotes, status) => {
            const filtered = filterQuotesByStatus(quotes, status);
            
            // All filtered quotes must have the specified status
            return filtered.every(quote => quote.status === status);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('filtering captures all quotes with matching status', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 50 }),
          quoteStatusArb,
          (quotes, status) => {
            const filtered = filterQuotesByStatus(quotes, status);
            const expectedCount = quotes.filter(q => q.status === status).length;
            
            return filtered.length === expectedCount;
          }
        ),
        { numRuns: 100 }
      );
    });
  });


  /**
   * Feature: quickquote, Property 12: Quote duplication preserves data
   * Validates: Requirements 9.4
   * 
   * For any duplicated quote, the new quote SHALL contain the same 
   * customer and services as the original.
   */
  describe('Property 12: Quote duplication preserves data', () => {
    it('duplicated quote preserves customer ID', () => {
      fc.assert(
        fc.property(
          quoteArb,
          (quote) => {
            const duplicateData = createDuplicateQuoteData(quote);
            return duplicateData.customerId === quote.customerId;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('duplicated quote preserves all service items', () => {
      fc.assert(
        fc.property(
          quoteArb,
          (quote) => {
            const duplicateData = createDuplicateQuoteData(quote);
            const originalItems = quote.items || [];
            
            // Same number of items
            if (duplicateData.items.length !== originalItems.length) {
              return false;
            }
            
            // Each item preserves key data
            for (let i = 0; i < originalItems.length; i++) {
              const orig = originalItems[i];
              const dup = duplicateData.items[i];
              
              if (
                dup.serviceId !== orig.serviceId ||
                dup.serviceName !== orig.serviceName ||
                dup.quantity !== orig.quantity ||
                dup.unitPrice !== orig.unitPrice ||
                dup.totalPrice !== orig.totalPrice
              ) {
                return false;
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('duplicated quote preserves financial data', () => {
      fc.assert(
        fc.property(
          quoteArb,
          (quote) => {
            const duplicateData = createDuplicateQuoteData(quote);
            
            return (
              duplicateData.subtotal === quote.subtotal &&
              duplicateData.discountType === quote.discountType &&
              duplicateData.discountValue === quote.discountValue &&
              duplicateData.total === quote.total
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('duplicated quote preserves notes and terms', () => {
      fc.assert(
        fc.property(
          quoteArb,
          (quote) => {
            const duplicateData = createDuplicateQuoteData(quote);
            
            return (
              duplicateData.notes === quote.notes &&
              duplicateData.terms === quote.terms
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional tests for quote expiration logic
   * Validates: Requirements 9.6
   */
  describe('Quote expiration', () => {
    it('quotes with validUntil in the past are expired', () => {
      fc.assert(
        fc.property(
          quoteArb,
          fc.date({ min: new Date('2020-01-01'), max: new Date('2023-12-31') }),
          (quote, pastDate) => {
            const futureDate = new Date(pastDate.getTime() + 86400000 * 30); // 30 days later
            const quoteWithPastValidity = {
              ...quote,
              validUntil: pastDate,
            };
            
            return isQuoteExpired(quoteWithPastValidity, futureDate) === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('quotes without validUntil are never expired', () => {
      fc.assert(
        fc.property(
          quoteArb,
          fc.date(),
          (quote, currentDate) => {
            const quoteWithoutValidity = {
              ...quote,
              validUntil: undefined,
            };
            
            return isQuoteExpired(quoteWithoutValidity, currentDate) === false;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getExpiredQuotes only returns pending quotes that are expired', () => {
      fc.assert(
        fc.property(
          fc.array(quoteArb, { minLength: 0, maxLength: 20 }),
          fc.date(),
          (quotes, currentDate) => {
            const expired = getExpiredQuotes(quotes, currentDate);
            
            // All returned quotes must be pending and expired
            return expired.every(
              quote => 
                quote.status === 'pending' && 
                isQuoteExpired(quote, currentDate)
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
