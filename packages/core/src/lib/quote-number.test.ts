import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  isValidQuoteNumberFormat,
  formatQuoteNumber,
  parseQuoteNumber,
  getNextSequenceNumber,
} from './quote-number';

// Arbitrary for generating valid years (4-digit)
const validYearArb = fc.integer({ min: 2000, max: 2099 });

// Arbitrary for generating valid sequence numbers
const validSequenceArb = fc.integer({ min: 1, max: 99999 });

describe('Quote Number Generator', () => {
  /**
   * Feature: quickquote, Property 9: Quote number format
   * Validates: Requirements 5.9
   * 
   * For any generated quote, the quote number SHALL match the pattern 
   * "QQ-YYYY-NNN" where YYYY is a 4-digit year and NNN is a sequential number.
   */
  describe('Property 9: Quote number format', () => {
    it('all generated quote numbers match the format QQ-YYYY-NNN', () => {
      fc.assert(
        fc.property(
          validYearArb,
          validSequenceArb,
          (year, sequenceNumber) => {
            const quoteNumber = formatQuoteNumber(year, sequenceNumber);
            
            // Must match the pattern QQ-YYYY-NNN (at least 3 digits for sequence)
            const isValid = isValidQuoteNumberFormat(quoteNumber);
            
            // Must start with QQ-
            const startsCorrectly = quoteNumber.startsWith('QQ-');
            
            // Must contain the correct year
            const containsYear = quoteNumber.includes(`-${year}-`);
            
            return isValid && startsCorrectly && containsYear;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('format and parse are inverse operations (round-trip)', () => {
      fc.assert(
        fc.property(
          validYearArb,
          validSequenceArb,
          (year, sequenceNumber) => {
            const quoteNumber = formatQuoteNumber(year, sequenceNumber);
            const parsed = parseQuoteNumber(quoteNumber);

            
            if (!parsed) return false;
            
            return parsed.year === year && parsed.sequenceNumber === sequenceNumber;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('sequence numbers are padded to at least 3 digits', () => {
      fc.assert(
        fc.property(
          validYearArb,
          fc.integer({ min: 1, max: 999 }),
          (year, sequenceNumber) => {
            const quoteNumber = formatQuoteNumber(year, sequenceNumber);
            
            // Extract the sequence part
            const parts = quoteNumber.split('-');
            const sequencePart = parts[2];
            
            // Must be at least 3 characters
            return sequencePart.length >= 3;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getNextSequenceNumber returns correct next value', () => {
      fc.assert(
        fc.property(
          validYearArb,
          fc.array(validSequenceArb, { minLength: 0, maxLength: 20 }),
          (year, sequences) => {
            // Generate quote numbers from sequences
            const existingQuoteNumbers = sequences.map(seq => formatQuoteNumber(year, seq));
            
            const nextSeq = getNextSequenceNumber(existingQuoteNumbers, year);
            
            // Next sequence should be greater than all existing sequences for this year
            const maxExisting = sequences.length > 0 ? Math.max(...sequences) : 0;
            
            return nextSeq === maxExisting + 1;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('getNextSequenceNumber ignores quote numbers from other years', () => {
      fc.assert(
        fc.property(
          validYearArb,
          validSequenceArb,
          (targetYear, sequence) => {
            // Use a different year (targetYear + 1, wrapping if needed)
            const otherYear = targetYear === 2099 ? 2000 : targetYear + 1;
            
            // Create quote numbers from a different year
            const existingQuoteNumbers = [formatQuoteNumber(otherYear, sequence)];
            
            const nextSeq = getNextSequenceNumber(existingQuoteNumbers, targetYear);
            
            // Should start at 1 since there are no quotes for the target year
            return nextSeq === 1;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Unit tests for edge cases
  describe('Edge cases', () => {
    it('rejects invalid year in formatQuoteNumber', () => {
      expect(() => formatQuoteNumber(999, 1)).toThrow('Year must be a 4-digit number');
      expect(() => formatQuoteNumber(10000, 1)).toThrow('Year must be a 4-digit number');
    });

    it('rejects non-positive sequence in formatQuoteNumber', () => {
      expect(() => formatQuoteNumber(2025, 0)).toThrow('Sequence number must be positive');
      expect(() => formatQuoteNumber(2025, -1)).toThrow('Sequence number must be positive');
    });

    it('parseQuoteNumber returns null for invalid formats', () => {
      expect(parseQuoteNumber('invalid')).toBeNull();
      expect(parseQuoteNumber('QQ-2025')).toBeNull();
      expect(parseQuoteNumber('XX-2025-001')).toBeNull();
      expect(parseQuoteNumber('QQ-25-001')).toBeNull();
    });

    it('isValidQuoteNumberFormat validates correctly', () => {
      expect(isValidQuoteNumberFormat('QQ-2025-001')).toBe(true);
      expect(isValidQuoteNumberFormat('QQ-2025-999')).toBe(true);
      expect(isValidQuoteNumberFormat('QQ-2025-1000')).toBe(true);
      expect(isValidQuoteNumberFormat('QQ-2025-01')).toBe(false); // only 2 digits
      expect(isValidQuoteNumberFormat('invalid')).toBe(false);
    });
  });
});
