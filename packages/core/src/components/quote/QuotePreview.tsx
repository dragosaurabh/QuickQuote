'use client';

import React from 'react';
import { Quote, Business, Customer, QuoteItem } from '../../types/models';
import { Badge, getQuoteStatusVariant, formatQuoteStatus } from '../feedback/Badge';

export interface QuotePreviewProps {
  quote: Quote;
  business: Business;
  customer?: Customer;
  items?: QuoteItem[];
  showActions?: boolean;
  onDownloadPDF?: () => void;
  onShareWhatsApp?: () => void;
  isDownloading?: boolean;
}

/**
 * Quote Preview Component
 * Displays a professional quote with business header, customer details,
 * itemized services table, and totals.
 * 
 * Validates: Requirements 7.1, 7.3, 7.4, 7.5
 */
export const QuotePreview: React.FC<QuotePreviewProps> = ({
  quote,
  business,
  customer,
  items,
  showActions = true,
  onDownloadPDF,
  onShareWhatsApp,
  isDownloading = false,
}) => {
  // Use provided customer/items or fall back to quote relations
  const displayCustomer = customer || quote.customer;
  const displayItems = items || quote.items || [];

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate discount amount for display
  const discountAmount = quote.subtotal - quote.total + (quote.discountValue || 0);
  const hasDiscount = quote.discountType && quote.discountValue && quote.discountValue > 0;

  return (
    <div className="bg-white text-gray-900 rounded-xl shadow-lg overflow-hidden">
      {/* Business Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                className="w-16 h-16 object-contain bg-white rounded-lg p-1"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎃</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{business.name}</h1>
              {business.email && (
                <p className="text-purple-200 text-sm">{business.email}</p>
              )}
              {business.phone && (
                <p className="text-purple-200 text-sm">{business.phone}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <Badge variant={getQuoteStatusVariant(quote.status)} size="md">
              {formatQuoteStatus(quote.status)}
            </Badge>
          </div>
        </div>
      </div>


      {/* Quote Info & Customer Details */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quote Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Quote Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Quote Number:</span>
                <span className="font-medium">{quote.quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formatDate(quote.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valid Until:</span>
                <span className="font-medium text-orange-600">
                  {formatDate(quote.validUntil)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Bill To</h2>
            {displayCustomer ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium text-gray-900">{displayCustomer.name}</p>
                <p className="text-gray-600">{displayCustomer.phone}</p>
                {displayCustomer.email && (
                  <p className="text-gray-600">{displayCustomer.email}</p>
                )}
                {displayCustomer.address && (
                  <p className="text-gray-600">{displayCustomer.address}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Customer details not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Services Table */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-2 font-semibold text-gray-700">Service</th>
                <th className="text-center py-3 px-2 font-semibold text-gray-700">Qty</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Unit Price</th>
                <th className="text-right py-3 px-2 font-semibold text-gray-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-2 text-gray-900">{item.serviceName}</td>
                  <td className="py-3 px-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {formatPrice(item.unitPrice)}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-gray-900">
                    {formatPrice(item.totalPrice)}
                  </td>
                </tr>
              ))}
              {displayItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No items in this quote
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex flex-col items-end space-y-2">
            <div className="flex justify-between w-full max-w-xs text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(quote.subtotal)}</span>
            </div>
            {hasDiscount && (
              <div className="flex justify-between w-full max-w-xs text-sm text-green-600">
                <span>
                  Discount
                  {quote.discountType === 'percentage' && ` (${quote.discountValue}%)`}:
                </span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between w-full max-w-xs text-lg font-bold border-t border-gray-300 pt-2 mt-2">
              <span className="text-gray-900">Total:</span>
              <span className="text-purple-700">{formatPrice(quote.total)}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Terms & Notes */}
      {(quote.terms || quote.notes) && (
        <div className="px-6 pb-6 space-y-4">
          {quote.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {quote.notes}
              </p>
            </div>
          )}
          {quote.terms && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {quote.terms}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (onDownloadPDF || onShareWhatsApp) && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-end">
            {onDownloadPDF && (
              <button
                onClick={onDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    📄 Download PDF
                  </>
                )}
              </button>
            )}
            {onShareWhatsApp && (
              <button
                onClick={onShareWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                💬 Share on WhatsApp
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-purple-900 text-purple-200 text-center py-3 text-xs">
        <p>Thank you for your business! 🎃</p>
        {business.address && <p className="mt-1">{business.address}</p>}
      </div>
    </div>
  );
};

export default QuotePreview;
