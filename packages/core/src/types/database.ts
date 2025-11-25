// Database row types (snake_case to match Supabase schema)
// These types represent the raw data from the database

export interface BusinessRow {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  default_terms: string | null;
  default_validity_days: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceRow {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteRow {
  id: string;
  business_id: string;
  customer_id: string | null;
  quote_number: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: number;
  total: number;
  notes: string | null;
  terms: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItemRow {
  id: string;
  quote_id: string;
  service_id: string | null;
  service_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}


// ============================================
// TYPE CONVERTERS
// ============================================

import type { Business, Service, Customer, Quote, QuoteItem } from './models';

/**
 * Convert a database business row to the application Business type
 */
export function toBusinessModel(row: BusinessRow): Business {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    logoUrl: row.logo_url ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    defaultTerms: row.default_terms ?? undefined,
    defaultValidityDays: row.default_validity_days,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert a database service row to the application Service type
 */
export function toServiceModel(row: ServiceRow): Service {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    description: row.description ?? undefined,
    price: row.price,
    category: row.category ?? undefined,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert a database customer row to the application Customer type
 */
export function toCustomerModel(row: CustomerRow): Customer {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    address: row.address ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert a database quote row to the application Quote type
 */
export function toQuoteModel(row: QuoteRow): Quote {
  return {
    id: row.id,
    businessId: row.business_id,
    customerId: row.customer_id ?? undefined,
    quoteNumber: row.quote_number,
    status: row.status,
    subtotal: row.subtotal,
    discountType: row.discount_type ?? undefined,
    discountValue: row.discount_value,
    total: row.total,
    notes: row.notes ?? undefined,
    terms: row.terms ?? undefined,
    validUntil: row.valid_until ? new Date(row.valid_until) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Convert a database quote item row to the application QuoteItem type
 */
export function toQuoteItemModel(row: QuoteItemRow): QuoteItem {
  return {
    id: row.id,
    quoteId: row.quote_id,
    serviceId: row.service_id ?? undefined,
    serviceName: row.service_name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    totalPrice: row.total_price,
    createdAt: new Date(row.created_at),
  };
}

// ============================================
// DATABASE INSERT TYPES
// ============================================

export type BusinessInsert = Omit<BusinessRow, 'id' | 'created_at' | 'updated_at'>;
export type ServiceInsert = Omit<ServiceRow, 'id' | 'created_at' | 'updated_at'>;
export type CustomerInsert = Omit<CustomerRow, 'id' | 'created_at' | 'updated_at'>;
export type QuoteInsert = Omit<QuoteRow, 'id' | 'created_at' | 'updated_at'>;
export type QuoteItemInsert = Omit<QuoteItemRow, 'id' | 'created_at'>;

export type BusinessUpdate = Partial<Omit<BusinessRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type ServiceUpdate = Partial<Omit<ServiceRow, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
export type CustomerUpdate = Partial<Omit<CustomerRow, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
export type QuoteUpdate = Partial<Omit<QuoteRow, 'id' | 'business_id' | 'created_at' | 'updated_at'>>;
