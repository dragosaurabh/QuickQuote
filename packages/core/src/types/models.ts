// Database model types

export interface Business {
  id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  defaultTerms?: string;
  defaultValidityDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export interface Quote {
  id: string;
  businessId: string;
  customerId?: string;
  quoteNumber: string;
  status: QuoteStatus;
  subtotal: number;
  discountType?: 'percentage' | 'fixed';
  discountValue: number;
  total: number;
  notes?: string;
  terms?: string;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  customer?: Customer;
  items?: QuoteItem[];
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
}
