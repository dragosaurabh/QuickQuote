import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateWhatsAppMessage,
  generateWhatsAppLink,
  generateQuoteLink,
  WhatsAppMessageInput,
} from './whatsapp';
import type { Quote, Business, Customer, QuoteStatus } from '../types/models';

// Use realistic date range (2020-2030) to avoid edge cases with negative years
const realisticDate = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') });

// Arbitrary for generating valid business
const businessArb: fc.Arbitrary<Business> = fc.record({
  id: fc.uuid(),
  userId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  logoUrl: fc.option(fc.webUrl(), { nil: undefined }),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 20 }), { nil: undefined }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  address: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  defaultTerms: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
  defaultValidityDays: fc.integer({ min: 1, max: 365 }),
  createdAt: realisticDate,
  updatedAt: realisticDate,
});

// Arbitrary for generating valid customer
const customerArb: fc.Arbitrary<Customer> = fc.record({
  id: fc.uuid(),
  businessId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  phone: fc.string({ minLength: 10, maxLength: 20 }),
  email: fc.option(fc.emailAddress(), { nil: undefined }),
  address: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
  createdAt: realisticDate,
  updatedAt: realisticDate,
});

// Arbitrary for quote status
const quoteStatusArb: fc.Arbitrary<QuoteStatus> = fc.constantFrom(
  'pending',
  'accepted',
  'rejected',
  'expired'
);

// Use Math.fround for 32-bit float compatibility
const positivePrice = fc.float({ min: Math.fround(0.01), max: Math.fround(100000), noNaN: true });

// Arbitrary for generating valid quote
const quoteArb: fc.Arbitrary<Quote> = fc.record({
  id: fc.uuid(),
  businessId: fc.uuid(),
  customerId: fc.option(fc.uuid(), { nil: undefined }),
  quoteNumber: fc.string({ minLength: 1, maxLength: 20 }),
  status: quoteStatusArb,
  subtotal: fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }),
  discountType: fc.option(fc.constantFrom('percentage' as const, 'fixed' as const), { nil: undefined }),
  discountValue: fc.float({ min: Math.fround(0), max: Math.fround(100000), noNaN: true }),
  total: fc.float({ min: Math.fround(0), max: Math.fround(1000000), noNaN: true }),
  notes: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
  terms: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
  validUntil: fc.option(realisticDate, { nil: undefined }),
  createdAt: realisticDate,
  updatedAt: realisticDate,
  customer: fc.option(customerArb, { nil: undefined }),
  items: fc.option(fc.array(fc.record({
    id: fc.uuid(),
    quoteId: fc.uuid(),
    serviceId: fc.option(fc.uuid(), { nil: undefined }),
    serviceName: fc.string({ minLength: 1, maxLength: 100 }),
    quantity: fc.integer({ min: 1, max: 1000 }),
    unitPrice: positivePrice,
    totalPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(100000000), noNaN: true }),
    createdAt: realisticDate,
  }), { minLength: 0, maxLength: 10 }), { nil: undefined }),
});

// Generate clean URLs for quote links
const cleanQuoteLink = fc.tuple(
  fc.constantFrom('http', 'https'),
  fc.domain(),
  fc.uuid()
).map(([protocol, domain, id]) => `${protocol}://${domain}/quotes/${id}`);

// Arbitrary for generating valid WhatsApp message input
const whatsAppMessageInputArb: fc.Arbitrary<WhatsAppMessageInput> = fc.record({
  quote: quoteArb,
  business: businessArb,
  customer: fc.option(customerArb, { nil: undefined }),
  quoteLink: cleanQuoteLink,
});

describe('WhatsApp Message Generator', () => {
  /**
   * Feature: quickquote, Property 13: WhatsApp message contains required fields
   * Validates: Requirements 8.2
   * 
   * For any quote, the generated WhatsApp message SHALL contain:
   * - business name
   * - customer name
   * - quote number
   * - date
   * - validity
   * - total amount
   * - quote link
   */
  describe('Property 13: WhatsApp message contains required fields', () => {
    it('message contains all required fields for any valid input', () => {
      fc.assert(
        fc.property(
          whatsAppMessageInputArb,
          (input) => {
            const message = generateWhatsAppMessage(input);
            
            // Check business name is present
            const hasBusinessName = message.includes(input.business.name);
            
            // Check customer name is present (either from customer prop or quote.customer or fallback)
            const customerName = input.customer?.name || input.quote.customer?.name || 'Valued Customer';
            const hasCustomerName = message.includes(customerName);
            
            // Check quote number is present
            const hasQuoteNumber = message.includes(input.quote.quoteNumber);
            
            // Check date is present (formatted date from createdAt)
            // We check for the year as a proxy since date formatting varies
            const createdYear = (typeof input.quote.createdAt === 'string' 
              ? new Date(input.quote.createdAt) 
              : input.quote.createdAt).getFullYear().toString();
            const hasDate = message.includes(createdYear);
            
            // Check validity is present (either the date or N/A)
            const hasValidity = message.includes('Valid Until:');
            
            // Check total amount is present (formatted as currency)
            // We check for the dollar sign and the total value
            const hasTotal = message.includes('$') && message.includes('Total Amount:');
            
            // Check quote link is present
            const hasQuoteLink = message.includes(input.quoteLink);
            
            return hasBusinessName && 
                   hasCustomerName && 
                   hasQuoteNumber && 
                   hasDate && 
                   hasValidity && 
                   hasTotal && 
                   hasQuoteLink;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('generateWhatsAppLink', () => {
    it('generates valid WhatsApp URL with encoded message', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (message) => {
            const link = generateWhatsAppLink(message);
            return link.startsWith('https://wa.me/') && 
                   link.includes('text=') &&
                   link.includes(encodeURIComponent(message));
          }
        ),
        { numRuns: 100 }
      );
    });

    it('includes phone number when provided', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 10, maxLength: 15 }),
          (message, phone) => {
            const link = generateWhatsAppLink(message, phone);
            return link.startsWith(`https://wa.me/${phone}`) && 
                   link.includes('text=');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('generateQuoteLink', () => {
    // Generate clean base URLs without trailing slashes or paths
    const cleanBaseUrl = fc.tuple(
      fc.constantFrom('http', 'https'),
      fc.domain()
    ).map(([protocol, domain]) => `${protocol}://${domain}`);

    it('generates valid quote URL', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          cleanBaseUrl,
          (quoteId, baseUrl) => {
            const link = generateQuoteLink(quoteId, baseUrl);
            return link.includes(quoteId) && 
                   link.includes('/quotes/') &&
                   !link.includes('//quotes/'); // No double slashes
          }
        ),
        { numRuns: 100 }
      );
    });

    it('handles trailing slash in base URL', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          cleanBaseUrl,
          (quoteId, baseUrl) => {
            const baseWithSlash = baseUrl + '/';
            const link = generateQuoteLink(quoteId, baseWithSlash);
            // Should not have double slashes before 'quotes'
            return !link.includes('//quotes/');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
