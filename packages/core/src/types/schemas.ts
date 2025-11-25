// Zod validation schemas for QuickQuote models
import { z } from 'zod';

// ============================================
// BUSINESS SCHEMAS
// ============================================

export const businessSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'Business name is required'),
  logoUrl: z.string().url().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  address: z.string().optional().nullable(),
  defaultTerms: z.string().optional().nullable(),
  defaultValidityDays: z.number().int().min(1).default(7),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createBusinessSchema = businessSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBusinessSchema = createBusinessSchema.partial().omit({
  userId: true,
});

// ============================================
// SERVICE SCHEMAS
// ============================================

export const serviceSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createServiceSchema = serviceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateServiceSchema = createServiceSchema.partial().omit({
  businessId: true,
});


// ============================================
// CUSTOMER SCHEMAS
// ============================================

export const customerSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email format').optional().nullable(),
  address: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createCustomerSchema = customerSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({
  businessId: true,
});

// ============================================
// QUOTE STATUS
// ============================================

export const quoteStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'expired']);

// ============================================
// QUOTE ITEM SCHEMAS
// ============================================

export const quoteItemSchema = z.object({
  id: z.string().uuid(),
  quoteId: z.string().uuid(),
  serviceId: z.string().uuid().optional().nullable(),
  serviceName: z.string().min(1, 'Service name is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
  totalPrice: z.number().nonnegative('Total price must be non-negative'),
  createdAt: z.coerce.date(),
});

export const createQuoteItemSchema = quoteItemSchema.omit({
  id: true,
  quoteId: true,
  createdAt: true,
});

// ============================================
// QUOTE SCHEMAS
// ============================================

export const discountTypeSchema = z.enum(['percentage', 'fixed']);

export const quoteSchema = z.object({
  id: z.string().uuid(),
  businessId: z.string().uuid(),
  customerId: z.string().uuid().optional().nullable(),
  quoteNumber: z.string().regex(/^QQ-\d{4}-\d{3,}$/, 'Invalid quote number format'),
  status: quoteStatusSchema.default('pending'),
  subtotal: z.number().nonnegative('Subtotal must be non-negative'),
  discountType: discountTypeSchema.optional().nullable(),
  discountValue: z.number().nonnegative('Discount value must be non-negative').default(0),
  total: z.number().nonnegative('Total must be non-negative'),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  validUntil: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  // Relations (optional, populated when joined)
  customer: z.lazy(() => customerSchema).optional(),
  items: z.array(z.lazy(() => quoteItemSchema)).optional(),
});

export const createQuoteSchema = quoteSchema.omit({
  id: true,
  quoteNumber: true,
  createdAt: true,
  updatedAt: true,
  customer: true,
  items: true,
});

export const updateQuoteSchema = createQuoteSchema.partial().omit({
  businessId: true,
});

// ============================================
// INPUT VALIDATION SCHEMAS
// ============================================

// Helper for non-empty string validation (rejects whitespace-only strings)
// Validates: Requirements 2.2, 13.2
const nonEmptyString = (fieldName: string) => 
  z.string()
    .refine(val => val.trim().length > 0, { message: `${fieldName} is required` });

// For validating form inputs before submission
export const businessFormSchema = z.object({
  name: nonEmptyString('Business name').pipe(z.string().max(255)),
  phone: z.string().max(50).optional(),
  email: z.string().email('Invalid email format').max(255).optional().or(z.literal('')),
  address: z.string().optional(),
  defaultTerms: z.string().optional(),
  defaultValidityDays: z.number().int().min(1).max(365).default(7),
});

export const serviceFormSchema = z.object({
  name: nonEmptyString('Service name').pipe(z.string().max(255)),
  description: z.string().optional(),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().max(100).optional(),
});

export const customerFormSchema = z.object({
  name: nonEmptyString('Customer name').pipe(z.string().max(255)),
  phone: nonEmptyString('Phone number').pipe(z.string().max(50)),
  email: z.string().email('Invalid email format').max(255).optional().or(z.literal('')),
  address: z.string().optional(),
});

// ============================================
// TYPE EXPORTS FROM SCHEMAS
// ============================================

export type BusinessInput = z.infer<typeof createBusinessSchema>;
export type BusinessFormInput = z.infer<typeof businessFormSchema>;
export type ServiceInput = z.infer<typeof createServiceSchema>;
export type ServiceFormInput = z.infer<typeof serviceFormSchema>;
export type CustomerInput = z.infer<typeof createCustomerSchema>;
export type CustomerFormInput = z.infer<typeof customerFormSchema>;
export type QuoteInput = z.infer<typeof createQuoteSchema>;
export type QuoteItemInput = z.infer<typeof createQuoteItemSchema>;
// Note: QuoteStatus is exported from models.ts to avoid duplicate exports
export type DiscountType = z.infer<typeof discountTypeSchema>;
