import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateBusinessForm, validateServiceForm, validateCustomerForm } from './validation';

// Arbitrary for generating valid non-whitespace strings
const validNonEmptyStringArb = fc.string({ minLength: 1, maxLength: 255 })
  .filter(s => s.trim().length > 0);

// Arbitrary for generating valid emails that pass Zod's stricter validation
// Zod's email validator is stricter than RFC 5322, so we generate simple emails
const validEmailArb = fc.tuple(
  fc.stringMatching(/^[a-z][a-z0-9]{0,9}$/), // local part: starts with letter, alphanumeric
  fc.stringMatching(/^[a-z]{2,10}$/),        // domain name
  fc.stringMatching(/^[a-z]{2,4}$/)          // TLD
).map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

// Arbitrary for generating valid business form data
const validBusinessFormArb = fc.record({
  name: validNonEmptyStringArb,
  phone: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  email: fc.option(validEmailArb, { nil: undefined }),
  address: fc.option(fc.string(), { nil: undefined }),
  defaultTerms: fc.option(fc.string(), { nil: undefined }),
  defaultValidityDays: fc.integer({ min: 1, max: 365 }),
});

// Arbitrary for generating empty/whitespace-only strings
const emptyOrWhitespaceArb = fc.oneof(
  fc.constant(''),
  fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 1, maxLength: 10 })
    .map(arr => arr.join(''))
);

// Arbitrary for generating invalid email formats
const invalidEmailArb = fc.oneof(
  fc.string({ minLength: 1 }).filter(s => !s.includes('@')),
  fc.string({ minLength: 1 }).map(s => `${s}@`),
  fc.string({ minLength: 1 }).map(s => `@${s}`),
);

// Arbitrary for generating valid positive prices (32-bit floats)
const validPriceArb = fc.integer({ min: 1, max: 10000000 })
  .map(n => Math.fround(n / 100)); // Convert to price with 2 decimal places

// Arbitrary for generating invalid prices (zero or negative)
const invalidPriceArb = fc.integer({ min: -10000000, max: 0 })
  .map(n => Math.fround(n / 100));

describe('Business Validation', () => {
  /**
   * Feature: quickquote, Property 8: Required field validation
   * Validates: Requirements 2.2, 13.2
   * 
   * For any form submission with empty required fields, 
   * the system SHALL reject the submission.
   */
  describe('Property 8: Required field validation', () => {
    it('rejects business form when name is empty or whitespace-only', () => {
      fc.assert(
        fc.property(
          emptyOrWhitespaceArb,
          fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
          fc.option(fc.emailAddress(), { nil: undefined }),
          fc.integer({ min: 1, max: 365 }),
          (name, phone, email, validityDays) => {
            const data = {
              name,
              phone,
              email,
              defaultValidityDays: validityDays,
            };
            const result = validateBusinessForm(data);
            // Should fail validation when name is empty/whitespace
            return result.success === false && 'name' in result.errors;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('accepts business form when all required fields are valid', () => {
      fc.assert(
        fc.property(
          validBusinessFormArb,
          (data) => {
            const result = validateBusinessForm(data);
            // Should pass validation when all required fields are present
            return result.success === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects business form when email format is invalid', () => {
      fc.assert(
        fc.property(
          validNonEmptyStringArb, // valid name
          invalidEmailArb,
          fc.integer({ min: 1, max: 365 }),
          (name, email, validityDays) => {
            const data = {
              name,
              email,
              defaultValidityDays: validityDays,
            };
            const result = validateBusinessForm(data);
            // Should fail validation when email format is invalid
            return result.success === false && 'email' in result.errors;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects business form when validity days is out of range', () => {
      fc.assert(
        fc.property(
          validNonEmptyStringArb, // valid name
          fc.oneof(
            fc.integer({ min: -1000, max: 0 }), // too low
            fc.integer({ min: 366, max: 10000 }) // too high
          ),
          (name, validityDays) => {
            const data = {
              name,
              defaultValidityDays: validityDays,
            };
            const result = validateBusinessForm(data);
            // Should fail validation when validity days is out of range
            return result.success === false && 'defaultValidityDays' in result.errors;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Service Validation', () => {
  /**
   * Feature: quickquote, Property 7: Service price validation
   * Validates: Requirements 3.5
   * 
   * For any service price input, the system SHALL accept only positive numbers.
   */
  describe('Property 7: Service price validation', () => {
    it('rejects service when price is zero or negative', () => {
      fc.assert(
        fc.property(
          validNonEmptyStringArb, // valid name
          invalidPriceArb, // invalid price
          (name, price) => {
            const data = { name, price };
            const result = validateServiceForm(data);
            // Should fail validation when price is not positive
            return result.success === false && 'price' in result.errors;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('accepts service when price is positive', () => {
      fc.assert(
        fc.property(
          validNonEmptyStringArb, // valid name
          validPriceArb, // valid price
          (name, price) => {
            const data = { name, price };
            const result = validateServiceForm(data);
            // Should pass validation when price is positive
            return result.success === true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('rejects service when name is empty', () => {
      fc.assert(
        fc.property(
          emptyOrWhitespaceArb,
          validPriceArb,
          (name, price) => {
            const data = { name, price };
            const result = validateServiceForm(data);
            // Should fail validation when name is empty
            return result.success === false && 'name' in result.errors;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Customer Validation', () => {
  it('rejects customer when name is empty', () => {
    fc.assert(
      fc.property(
        emptyOrWhitespaceArb, // empty name
        validNonEmptyStringArb, // valid phone (non-whitespace)
        (name, phone) => {
          const data = { name, phone };
          const result = validateCustomerForm(data);
          // Should fail validation when name is empty
          return result.success === false && 'name' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rejects customer when phone is empty', () => {
    fc.assert(
      fc.property(
        validNonEmptyStringArb, // valid name (non-whitespace)
        emptyOrWhitespaceArb, // empty phone
        (name, phone) => {
          const data = { name, phone };
          const result = validateCustomerForm(data);
          // Should fail validation when phone is empty
          return result.success === false && 'phone' in result.errors;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('accepts customer when all required fields are valid', () => {
    fc.assert(
      fc.property(
        validNonEmptyStringArb, // valid name (non-whitespace)
        validNonEmptyStringArb.filter(s => s.length <= 50), // valid phone (non-whitespace, max 50)
        fc.option(validEmailArb, { nil: undefined }),
        (name, phone, email) => {
          const data = { name, phone, email };
          const result = validateCustomerForm(data);
          // Should pass validation when all required fields are present
          return result.success === true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
