// Quote serialization utilities
// Requirements: 6.5, 6.6

import type { Quote, QuoteItem, Customer } from '../types/models';

/**
 * Serialized quote item representation (dates as ISO strings)
 */
export interface SerializedQuoteItem {
  id: string;
  quoteId: string;
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

/**
 * Serialized customer representation (dates as ISO strings)
 */
export interface SerializedCustomer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Serialized quote representation (dates as ISO strings)
 */
export interface SerializedQuote {
  id: string;
  businessId: string;
  customerId?: string;
  quoteNumber: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue: number;
  total: number;
  notes?: string;
  terms?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
  customer?: SerializedCustomer;
  items?: SerializedQuoteItem[];
}

/**
 * Serializes a QuoteItem to JSON-safe format
 */
function serializeQuoteItem(item: QuoteItem): SerializedQuoteItem {
  return {
    id: item.id,
    quoteId: item.quoteId,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    createdAt: item.createdAt.toISOString(),
  };
}

/**
 * Deserializes a QuoteItem from JSON format
 */
function deserializeQuoteItem(item: SerializedQuoteItem): QuoteItem {
  return {
    id: item.id,
    quoteId: item.quoteId,
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    createdAt: new Date(item.createdAt),
  };
}

/**
 * Serializes a Customer to JSON-safe format
 */
function serializeCustomer(customer: Customer): SerializedCustomer {
  return {
    id: customer.id,
    businessId: customer.businessId,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
  };
}

/**
 * Deserializes a Customer from JSON format
 */
function deserializeCustomer(customer: SerializedCustomer): Customer {
  return {
    id: customer.id,
    businessId: customer.businessId,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    createdAt: new Date(customer.createdAt),
    updatedAt: new Date(customer.updatedAt),
  };
}

/**
 * Serializes a Quote object to a JSON string for storage.
 * Converts Date objects to ISO 8601 strings.
 * 
 * @param quote - The Quote object to serialize
 * @returns JSON string representation of the quote
 * 
 * Requirements: 6.5
 */
export function serializeQuote(quote: Quote): string {
  const serialized: SerializedQuote = {
    id: quote.id,
    businessId: quote.businessId,
    customerId: quote.customerId,
    quoteNumber: quote.quoteNumber,
    status: quote.status,
    subtotal: quote.subtotal,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    total: quote.total,
    notes: quote.notes,
    terms: quote.terms,
    validUntil: quote.validUntil?.toISOString(),
    createdAt: quote.createdAt.toISOString(),
    updatedAt: quote.updatedAt.toISOString(),
    customer: quote.customer ? serializeCustomer(quote.customer) : undefined,
    items: quote.items?.map(serializeQuoteItem),
  };

  return JSON.stringify(serialized);
}

/**
 * Deserializes a JSON string back to a Quote object.
 * Converts ISO 8601 strings back to Date objects.
 * 
 * @param json - The JSON string to deserialize
 * @returns The restored Quote object
 * @throws Error if JSON is invalid
 * 
 * Requirements: 6.6
 */
export function deserializeQuote(json: string): Quote {
  const parsed: SerializedQuote = JSON.parse(json);

  return {
    id: parsed.id,
    businessId: parsed.businessId,
    customerId: parsed.customerId,
    quoteNumber: parsed.quoteNumber,
    status: parsed.status,
    subtotal: parsed.subtotal,
    discountType: parsed.discountType,
    discountValue: parsed.discountValue,
    total: parsed.total,
    notes: parsed.notes,
    terms: parsed.terms,
    validUntil: parsed.validUntil ? new Date(parsed.validUntil) : undefined,
    createdAt: new Date(parsed.createdAt),
    updatedAt: new Date(parsed.updatedAt),
    customer: parsed.customer ? deserializeCustomer(parsed.customer) : undefined,
    items: parsed.items?.map(deserializeQuoteItem),
  };
}
