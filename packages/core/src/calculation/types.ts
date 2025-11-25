// Calculation engine types

export interface CalcQuoteItem {
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
}

export interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
}

export interface QuoteCalculation {
  items: CalcQuoteItem[];
  discount?: DiscountConfig;
}

export interface QuoteResult {
  lineItems: Array<CalcQuoteItem & { lineTotal: number }>;
  subtotal: number;
  discountAmount: number;
  total: number;
}
