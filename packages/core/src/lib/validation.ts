import { z } from 'zod';
import { businessFormSchema, serviceFormSchema, customerFormSchema } from '../types/schemas';

/**
 * Validation result type
 */
export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}

/**
 * Validates business form input
 * Returns validation result with field-specific errors
 * Validates: Requirements 2.2, 13.2
 */
export function validateBusinessForm(data: unknown): ValidationResult {
  try {
    businessFormSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(e => {
        const field = e.path.join('.');
        errors[field] = e.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
}

/**
 * Validates service form input
 * Returns validation result with field-specific errors
 * Validates: Requirements 3.5
 */
export function validateServiceForm(data: unknown): ValidationResult {
  try {
    serviceFormSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(e => {
        const field = e.path.join('.');
        errors[field] = e.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
}

/**
 * Validates customer form input
 * Returns validation result with field-specific errors
 */
export function validateCustomerForm(data: unknown): ValidationResult {
  try {
    customerFormSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(e => {
        const field = e.path.join('.');
        errors[field] = e.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
}

/**
 * Checks if a string is empty or only whitespace
 */
export function isEmptyOrWhitespace(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Checks if a required field is valid (non-empty, non-whitespace)
 */
export function isRequiredFieldValid(value: string | undefined | null): boolean {
  return !isEmptyOrWhitespace(value);
}
