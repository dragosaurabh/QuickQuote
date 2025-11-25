'use client';

import React, { useState, useMemo } from 'react';
import { Quote, QuoteStatus } from '../../types/models';
import { Badge, getQuoteStatusVariant, formatQuoteStatus } from '../feedback/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../feedback/LoadingSpinner';

export interface QuoteListProps {
  quotes: Quote[];
  loading: boolean;
  error: Error | null;
  onViewQuote?: (quote: Quote) => void;
  onDuplicateQuote?: (quote: Quote) => void;
  onUpdateStatus?: (quoteId: string, status: QuoteStatus) => Promise<void>;
  onRefetch?: () => void;
  duplicateLoading?: boolean;
  statusUpdateLoading?: boolean;
}

const STATUS_TABS: Array<{ label: string; value: QuoteStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
];

/**
 * QuoteList component for displaying and managing quotes
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */
export const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  loading,
  error,
  onViewQuote,
  onDuplicateQuote,
  onUpdateStatus,
  onRefetch,
  duplicateLoading = false,
  statusUpdateLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<QuoteStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingQuoteId, setUpdatingQuoteId] = useState<string | null>(null);


  /**
   * Filter quotes by status and search query
   * Validates: Requirements 9.2 (status filter), 9.3 (search)
   */
  const filteredQuotes = useMemo(() => {
    let filtered = quotes;

    // Filter by status tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(quote => quote.status === activeTab);
    }

    // Filter by search query (customer name or quote number)
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(quote =>
        quote.quoteNumber.toLowerCase().includes(lowerQuery) ||
        (quote.customer?.name.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [quotes, activeTab, searchQuery]);

  const handleStatusChange = async (quoteId: string, newStatus: QuoteStatus) => {
    if (!onUpdateStatus) return;
    setUpdatingQuoteId(quoteId);
    try {
      await onUpdateStatus(quoteId, newStatus);
    } finally {
      setUpdatingQuoteId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">👻 {error.message}</p>
        {onRefetch && (
          <Button variant="secondary" onClick={onRefetch}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-halloween-green">
          📜 Your Quotes
        </h2>
      </div>

      {/* Search Input - Validates: Requirements 9.3 */}
      <div className="max-w-md">
        <Input
          placeholder="Search by customer name or quote number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Status Filter Tabs - Validates: Requirements 9.2 */}
      <div className="flex flex-wrap gap-2 border-b border-halloween-purple/20 pb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${activeTab === tab.value
                ? 'bg-halloween-purple text-white'
                : 'bg-surface text-text-muted hover:bg-halloween-purple/20'
              }
            `}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="ml-2 text-xs opacity-70">
                ({quotes.filter(q => q.status === tab.value).length})
              </span>
            )}
          </button>
        ))}
      </div>


      {/* Quotes Table/List - Validates: Requirements 9.1 */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p className="text-4xl mb-4">🦇</p>
          <p>No quotes found. Time to conjure some new ones!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-halloween-purple/20">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Quote #</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Date</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="text-right py-3 px-4 text-text-muted font-medium">Total</th>
                <th className="text-right py-3 px-4 text-text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-halloween-purple/10 hover:bg-halloween-purple/5 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="font-mono text-halloween-orange">
                      {quote.quoteNumber}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-text">
                      {quote.customer?.name || 'Unknown Customer'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-muted">
                    {formatDate(quote.createdAt)}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant={getQuoteStatusVariant(quote.status)}>
                      {formatQuoteStatus(quote.status)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-right font-semibold text-halloween-green">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Button */}
                      {onViewQuote && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewQuote(quote)}
                        >
                          View
                        </Button>
                      )}

                      {/* Duplicate Button - Validates: Requirements 9.4 */}
                      {onDuplicateQuote && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDuplicateQuote(quote)}
                          disabled={duplicateLoading}
                        >
                          Duplicate
                        </Button>
                      )}

                      {/* Status Update Dropdown - Validates: Requirements 9.5 */}
                      {onUpdateStatus && quote.status !== 'expired' && (
                        <select
                          value={quote.status}
                          onChange={(e) => handleStatusChange(quote.id, e.target.value as QuoteStatus)}
                          disabled={statusUpdateLoading && updatingQuoteId === quote.id}
                          className="
                            bg-surface border border-halloween-purple/30 rounded-lg
                            px-2 py-1 text-sm text-text
                            focus:outline-none focus:ring-2 focus:ring-halloween-purple/50
                            disabled:opacity-50
                          "
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      <div className="flex justify-between items-center pt-4 border-t border-halloween-purple/20 text-text-muted text-sm">
        <span>
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </span>
        {activeTab !== 'all' && (
          <button
            onClick={() => setActiveTab('all')}
            className="text-halloween-purple hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
};
