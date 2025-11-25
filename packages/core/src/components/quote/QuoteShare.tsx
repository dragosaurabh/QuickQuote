'use client';

import React, { useState, useCallback } from 'react';
import { Quote, Business, Customer } from '../../types/models';
import {
  generateWhatsAppMessage,
  generateWhatsAppLink,
  generateQuoteLink,
  copyToClipboard,
} from '../../lib/whatsapp';
import { useToast } from '../feedback/Toast';

export interface QuoteShareProps {
  quote: Quote;
  business: Business;
  customer?: Customer;
  baseUrl?: string;
  className?: string;
}

/**
 * Quote Share Component
 * Provides WhatsApp share button and copy link functionality.
 * 
 * Validates: Requirements 8.1, 8.3
 */
export const QuoteShare: React.FC<QuoteShareProps> = ({
  quote,
  business,
  customer,
  baseUrl = typeof window !== 'undefined' ? window.location.origin : '',
  className = '',
}) => {
  const { addToast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  // Generate the quote link
  const quoteLink = generateQuoteLink(quote.id, baseUrl);

  // Handle WhatsApp share
  const handleShareWhatsApp = useCallback(() => {
    const displayCustomer = customer || quote.customer;
    const message = generateWhatsAppMessage({
      quote,
      business,
      customer: displayCustomer,
      quoteLink,
    });

    const whatsAppUrl = generateWhatsAppLink(message, displayCustomer?.phone);
    
    // Open WhatsApp in a new tab
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    
    addToast('success', '🎃 Opening WhatsApp... Spooky quote on its way!');
  }, [quote, business, customer, quoteLink, addToast]);

  // Handle copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    setIsCopying(true);
    try {
      const success = await copyToClipboard(quoteLink);
      if (success) {
        addToast('success', '👻 Link copied to clipboard!');
      } else {
        addToast('error', '😱 Failed to copy link. Please try again.');
      }
    } catch {
      addToast('error', '😱 Failed to copy link. Please try again.');
    } finally {
      setIsCopying(false);
    }
  }, [quoteLink, addToast]);

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {/* WhatsApp Share Button */}
      <button
        onClick={handleShareWhatsApp}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="Share quote on WhatsApp"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Share on WhatsApp
      </button>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        disabled={isCopying}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Copy quote link to clipboard"
      >
        {isCopying ? (
          <>
            <span className="animate-spin">⏳</span>
            Copying...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
              />
            </svg>
            Copy Link
          </>
        )}
      </button>
    </div>
  );
};

export default QuoteShare;
