'use client';

import React, { useRef, useCallback, useState } from 'react';
import { Quote, Business, Customer, QuoteItem } from '../../types/models';

export interface QuotePDFProps {
  quote: Quote;
  business: Business;
  customer?: Customer;
  items?: QuoteItem[];
}

export interface UseQuotePDFReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  downloadPDF: () => Promise<void>;
  isGenerating: boolean;
}

/**
 * Hook for PDF generation functionality
 * Uses html2pdf.js to convert the quote preview to PDF
 * 
 * Validates: Requirements 7.2, 7.3, 7.4, 7.5
 */
export const useQuotePDF = (
  quote: Quote,
  business: Business
): UseQuotePDFReturn => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = useCallback(async () => {
    if (!containerRef.current || isGenerating) return;

    setIsGenerating(true);

    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;

      const element = containerRef.current;
      const filename = `${quote.quoteNumber}-${business.name.replace(/\s+/g, '-')}.pdf`;

      const opt = {
        margin: 0,
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [quote.quoteNumber, business.name, isGenerating]);

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    downloadPDF,
    isGenerating,
  };
};


/**
 * QuotePDF Component
 * A printable/PDF-ready version of the quote preview
 * Designed to match the preview layout for PDF generation
 * 
 * Validates: Requirements 7.2, 7.3, 7.4, 7.5
 */
export const QuotePDF: React.FC<QuotePDFProps> = ({
  quote,
  business,
  customer,
  items,
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
  const hasDiscount = quote.discountType && quote.discountValue && quote.discountValue > 0;
  const discountAmount = hasDiscount
    ? quote.discountType === 'percentage'
      ? (quote.subtotal * quote.discountValue) / 100
      : quote.discountValue
    : 0;

  return (
    <div
      style={{
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: 'white',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        lineHeight: '1.5',
      }}
    >
      {/* Business Header */}
      <div
        style={{
          background: 'linear-gradient(to right, #581c87, #7c3aed)',
          padding: '24px',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={`${business.name} logo`}
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'contain',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '4px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}
              >
                🎃
              </div>
            )}
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{business.name}</h1>
              {business.email && (
                <p style={{ color: '#e9d5ff', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {business.email}
                </p>
              )}
              {business.phone && (
                <p style={{ color: '#e9d5ff', fontSize: '12px', margin: '2px 0 0 0' }}>
                  {business.phone}
                </p>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '500',
                textTransform: 'capitalize',
              }}
            >
              {quote.status}
            </span>
          </div>
        </div>
      </div>


      {/* Quote Info & Customer Details */}
      <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Quote Details */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              Quote Details
            </h2>
            <div style={{ fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Quote Number:</span>
                <span style={{ fontWeight: '500' }}>{quote.quoteNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#6b7280' }}>Date:</span>
                <span style={{ fontWeight: '500' }}>{formatDate(quote.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Valid Until:</span>
                <span style={{ fontWeight: '500', color: '#ea580c' }}>{formatDate(quote.validUntil)}</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
              Bill To
            </h2>
            {displayCustomer ? (
              <div style={{ fontSize: '12px' }}>
                <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 4px 0' }}>
                  {displayCustomer.name}
                </p>
                <p style={{ color: '#6b7280', margin: '0 0 2px 0' }}>{displayCustomer.phone}</p>
                {displayCustomer.email && (
                  <p style={{ color: '#6b7280', margin: '0 0 2px 0' }}>{displayCustomer.email}</p>
                )}
                {displayCustomer.address && (
                  <p style={{ color: '#6b7280', margin: 0 }}>{displayCustomer.address}</p>
                )}
              </div>
            ) : (
              <p style={{ color: '#9ca3af', fontSize: '12px' }}>Customer details not available</p>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Services Table */}
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
          Services
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', fontWeight: '600', color: '#374151' }}>
                Service
              </th>
              <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: '600', color: '#374151' }}>
                Qty
              </th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: '600', color: '#374151' }}>
                Unit Price
              </th>
              <th style={{ textAlign: 'right', padding: '12px 8px', fontWeight: '600', color: '#374151' }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((item, index) => (
              <tr key={item.id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 8px', color: '#111827' }}>{item.serviceName}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#6b7280' }}>
                  {item.quantity}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', color: '#6b7280' }}>
                  {formatPrice(item.unitPrice)}
                </td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: '500', color: '#111827' }}>
                  {formatPrice(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>


        {/* Totals Section */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>Subtotal:</span>
                <span style={{ fontWeight: '500' }}>{formatPrice(quote.subtotal)}</span>
              </div>
              {hasDiscount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#16a34a' }}>
                  <span>
                    Discount{quote.discountType === 'percentage' && ` (${quote.discountValue}%)`}:
                  </span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  borderTop: '2px solid #d1d5db',
                  paddingTop: '8px',
                  marginTop: '8px',
                }}
              >
                <span style={{ color: '#111827' }}>Total:</span>
                <span style={{ color: '#7c3aed' }}>{formatPrice(quote.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Notes */}
      {(quote.terms || quote.notes) && (
        <div style={{ padding: '0 24px 24px 24px' }}>
          {quote.notes && (
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Notes
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '8px',
                  margin: 0,
                }}
              >
                {quote.notes}
              </p>
            </div>
          )}
          {quote.terms && (
            <div>
              <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Terms & Conditions
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f9fafb',
                  padding: '12px',
                  borderRadius: '8px',
                  margin: 0,
                }}
              >
                {quote.terms}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          backgroundColor: '#581c87',
          color: '#e9d5ff',
          textAlign: 'center',
          padding: '12px',
          fontSize: '10px',
          marginTop: 'auto',
        }}
      >
        <p style={{ margin: 0 }}>Thank you for your business! 🎃</p>
        {business.address && <p style={{ margin: '4px 0 0 0' }}>{business.address}</p>}
      </div>
    </div>
  );
};

export default QuotePDF;
