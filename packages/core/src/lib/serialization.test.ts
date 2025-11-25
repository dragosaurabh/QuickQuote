import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { serializeQuote, deserializeQuote } from './serialization';
import type { Quote, QuoteItem, Customer, QuoteStatus } from '../types/models';

// Arbitrary for generating valid dates (within reasonable range)
const dateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2030-12-31'),
});

// Arbitrary for generating valid quote statuses
const quoteStatusArb: fc.Arbitrary<QuoteStatus> = fc.constantFrom(
  'pending',
  'accepted',
  'rejected',
  'expired'
);

// Arbitrary for generating valid discount types
const discountTypeArb = fc.constantFrom('percentage' as const, 'fixed' as const);

// Use Math.fround to ensure 32-bit float compatibility
const positivePrice = fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true });

// Arbitrary for generating valid quote items
const quoteItemArb: fc.Arbitrary<QuoteItem> = fc.record({
  id: fc.uuid(),
  quoteId: fc.uuid(),
  serviceId: fc.option(fc.uuid(), { nil: undefined }),
  serviceName: fc.string({ minLength: 1, maxLength: 100 }),
  quantity: fc.integer({ min: 1, max: 1000 }),
  unitPrice: positivePrice,
  totalPrice: positivePrice,
  createdAt: dateArb,
});

// Arbitrary for generating valid customers
const customerArb: fc.Arbitrary<Customer> = fc.record({
  id: fc.uuid(),
  businessId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  phone: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  address: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  createdAt: dateArb,
  updatedAt: dateArb,
});

// Arbitrary for generating valid quotes
const quoteArb: fc.Arbitrary<Quote> = fc.record({
  id: fc.uuid(),
  businessId: fc.uuid(),
  customerId: fc.option(fc.uuid(), { nil: undefined }),
  quoteNumber: fc.stringMatching(/^QQ-20[2-3][0-9]-[0-9]{3}$/),
  status: quoteStatusArb,
  subtotal: positivePrice,
  discountType: fc.option(discountTypeArb, { nil: undefined }),
  discountValue: fc.float({ min: 0, max: 100, noNaN: true }),
  total: positivePrice,
  notes: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  terms: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
  validUntil: fc.option(dateArb, { nil: undefined }),
  createdAt: dateArb,
  updatedAt: dateArb,
  customer: fc.option(customerArb, { nil: undefined }),
  items: fc.option(fc.array(quoteItemArb, { minLength: 0, maxLength: 10 }), { nil: undefined }),
});

/**
 * Helper to compare two Quote objects for equality
 * Handles Date comparison by converting to ISO strings
 */
function quotesAreEqual(a: Quote, b: Quote): boolean {
  // Compare primitive fields
  if (a.id !== b.id) return false;
  if (a.businessId !== b.businessId) return false;
  if (a.customerId !== b.customerId) return false;
  if (a.quoteNumber !== b.quoteNumber) return false;
  if (a.status !== b.status) return false;
  if (Math.abs(a.subtotal - b.subtotal) > 0.001) return false;
  if (a.discountType !== b.discountType) return false;
  if (Math.abs(a.discountValue - b.discountValue) > 0.001) return false;
  if (Math.abs(a.total - b.total) > 0.001) return false;
  if (a.notes !== b.notes) return false;
  if (a.terms !== b.terms) return false;

  // Compare dates (using ISO string comparison for millisecond precision)
  if (a.validUntil?.toISOString() !== b.validUntil?.toISOString()) return false;
  if (a.createdAt.toISOString() !== b.createdAt.toISOString()) return false;
  if (a.updatedAt.toISOString() !== b.updatedAt.toISOString()) return false;

  // Compare customer
  if ((a.customer === undefined) !== (b.customer === undefined)) return false;
  if (a.customer && b.customer) {
    if (a.customer.id !== b.customer.id) return false;
    if (a.customer.name !== b.customer.name) return false;
    if (a.customer.phone !== b.customer.phone) return false;
    if (a.customer.email !== b.customer.email) return false;
    if (a.customer.address !== b.customer.address) return false;
    if (a.customer.createdAt.toISOString() !== b.customer.createdAt.toISOString()) return false;
    if (a.customer.updatedAt.toISOString() !== b.customer.updatedAt.toISOString()) return false;
  }

  // Compare items
  if ((a.items === undefined) !== (b.items === undefined)) return false;
  if (a.items && b.items) {
    if (a.items.length !== b.items.length) return false;
    for (let i = 0; i < a.items.length; i++) {
      const itemA = a.items[i];
      const itemB = b.items[i];
      if (itemA.id !== itemB.id) return false;
      if (itemA.quoteId !== itemB.quoteId) return false;
      if (itemA.serviceId !== itemB.serviceId) return false;
      if (itemA.serviceName !== itemB.serviceName) return false;
      if (itemA.quantity !== itemB.quantity) return false;
      if (Math.abs(itemA.unitPrice - itemB.unitPrice) > 0.001) return false;
      if (Math.abs(itemA.totalPrice - itemB.totalPrice) > 0.001) return false;
      if (itemA.createdAt.toISOString() !== itemB.createdAt.toISOString()) return false;
    }
  }

  return true;
}

describe('Serialization', () => {
  /**
   * Feature: quickquote, Property 6: Quote data round-trip
   * Validates: Requirements 6.5, 6.6
   *
   * For any valid quote object, serializing to JSON then deserializing
   * SHALL produce an equivalent quote object.
   */
  describe('Property 6: Quote data round-trip', () => {
    it('serializing then deserializing produces equivalent quote', () => {
      fc.assert(
        fc.property(quoteArb, (quote) => {
          const serialized = serializeQuote(quote);
          const deserialized = deserializeQuote(serialized);
          return quotesAreEqual(quote, deserialized);
        }),
        { numRuns: 100 }
      );
    });

    it('serialized output is valid JSON', () => {
      fc.assert(
        fc.property(quoteArb, (quote) => {
          const serialized = serializeQuote(quote);
          // Should not throw
          JSON.parse(serialized);
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('deserialized dates are Date objects', () => {
      fc.assert(
        fc.property(quoteArb, (quote) => {
          const serialized = serializeQuote(quote);
          const deserialized = deserializeQuote(serialized);

          // Check that dates are actual Date objects
          if (!(deserialized.createdAt instanceof Date)) return false;
          if (!(deserialized.updatedAt instanceof Date)) return false;
          if (deserialized.validUntil && !(deserialized.validUntil instanceof Date)) return false;

          // Check customer dates
          if (deserialized.customer) {
            if (!(deserialized.customer.createdAt instanceof Date)) return false;
            if (!(deserialized.customer.updatedAt instanceof Date)) return false;
          }

          // Check item dates
          if (deserialized.items) {
            for (const item of deserialized.items) {
              if (!(item.createdAt instanceof Date)) return false;
            }
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
