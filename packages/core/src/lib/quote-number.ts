/**
 * Quote Number Generator
 * Validates: Requirements 5.9
 * 
 * Generates unique quote numbers in format "QQ-YYYY-NNN"
 * where YYYY is the 4-digit year and NNN is a sequential number (padded to 3 digits minimum)
 */

/**
 * Validates that a quote number matches the expected format "QQ-YYYY-NNN"
 * @param quoteNumber - The quote number to validate
 * @returns true if the format is valid
 */
export function isValidQuoteNumberFormat(quoteNumber: string): boolean {
  const pattern = /^QQ-\d{4}-\d{3,}$/;
  return pattern.test(quoteNumber);
}

/**
 * Generates a quote number for a given year and sequence number
 * @param year - The 4-digit year
 * @param sequenceNumber - The sequence number (will be padded to at least 3 digits)
 * @returns The formatted quote number
 */
export function formatQuoteNumber(year: number, sequenceNumber: number): string {
  if (year < 1000 || year > 9999) {
    throw new Error('Year must be a 4-digit number');
  }
  if (sequenceNumber < 1) {
    throw new Error('Sequence number must be positive');
  }
  
  const paddedNumber = sequenceNumber.toString().padStart(3, '0');
  return `QQ-${year}-${paddedNumber}`;
}

/**
 * Parses a quote number to extract year and sequence number
 * @param quoteNumber - The quote number to parse
 * @returns Object with year and sequenceNumber, or null if invalid format
 */
export function parseQuoteNumber(quoteNumber: string): { year: number; sequenceNumber: number } | null {
  const match = quoteNumber.match(/^QQ-(\d{4})-(\d+)$/);
  if (!match) {
    return null;
  }
  
  return {
    year: parseInt(match[1], 10),
    sequenceNumber: parseInt(match[2], 10),
  };
}

/**
 * Calculates the next sequence number from a list of existing quote numbers for a given year
 * @param existingQuoteNumbers - Array of existing quote numbers
 * @param year - The year to filter by
 * @returns The next sequence number to use
 */
export function getNextSequenceNumber(existingQuoteNumbers: string[], year: number): number {
  const prefix = `QQ-${year}-`;
  
  let maxSequence = 0;
  for (const qn of existingQuoteNumbers) {
    if (qn.startsWith(prefix)) {
      const parsed = parseQuoteNumber(qn);
      if (parsed && parsed.sequenceNumber > maxSequence) {
        maxSequence = parsed.sequenceNumber;
      }
    }
  }
  
  return maxSequence + 1;
}
