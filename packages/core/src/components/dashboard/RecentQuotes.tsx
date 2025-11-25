'use client';

import React from 'react';
import { Quote } from '../../types/models';
import { Badge, getQuoteStatusVariant, formatQuoteStatus } from '../feedback';

export interface RecentQuotesProps {
  quotes: Quote[];
  onViewQuote?: (quoteId: string) => void;
  className?: string;
}

/**
 * RecentQuotes component for displaying the last 5 quotes
 * Validates: Requirements 10.4
 */
export function RecentQuotes({
  quotes,
  onViewQuote,
  className = '',
}: RecentQuotesProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (quotes.length === 0) {
    return (
      <div
        className={`
          bg-surface rounded-xl p-6 
          border border-halloween-purple/20
          ${className}
        `}
      >
        <h3 className="text-lg font-semibold text-text mb-4">
          Recent Quotes 📜
        </h3>
        <p className="text-text-muted text-center py-8">
          No quotes yet. Create your first spooky quote! 🎃
        </p>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-surface rounded-xl p-6 
        border border-halloween-purple/20
        ${className}
      `}
    >
      <h3 className="text-lg font-semibold text-text mb-4">
        Recent Quotes 📜
      </h3>

      <div className="space-y-3">
        {quotes.map((quote) => (
          <div
            key={quote.id}
            onClick={() => onViewQuote?.(quote.id)}
            className={`
              flex items-center justify-between p-3 rounded-lg
              bg-background/50 hover:bg-background
              transition-colors duration-200
              ${onViewQuote ? 'cursor-pointer' : ''}
            `}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-text truncate">
                  {quote.quoteNumber}
                </span>
                <Badge variant={getQuoteStatusVariant(quote.status)} size="sm">
                  {formatQuoteStatus(quote.status)}
                </Badge>
              </div>
              <p className="text-sm text-text-muted truncate">
                {quote.customer?.name || 'Unknown Customer'}
              </p>
            </div>
            <div className="text-right ml-4">
              <p className="font-semibold text-halloween-green">
                {formatCurrency(quote.total)}
              </p>
              <p className="text-xs text-text-muted">
                {formatDate(quote.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
