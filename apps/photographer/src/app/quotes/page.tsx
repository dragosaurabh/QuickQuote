'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  LoadingSpinner, 
  QuoteList 
} from '@quickquote/core/components';
import { 
  useAuth, 
  useBusiness, 
  useQuotes,
  useUpdateQuote,
  useCreateQuote,
} from '@quickquote/core/hooks';
import { Quote, QuoteStatus } from '@quickquote/core/types';

/**
 * Quotes management page
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
export default function QuotesPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { quotes, loading: quotesLoading, error, refetch } = useQuotes();
  const { updateQuote, loading: updateLoading } = useUpdateQuote();
  const { createQuote, loading: createLoading } = useCreateQuote();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Redirect to onboarding if no business profile exists
  useEffect(() => {
    if (!authLoading && !businessLoading && user && !business) {
      router.push('/onboarding');
    }
  }, [user, authLoading, business, businessLoading, router]);

  /**
   * Check and update expired quotes on page load
   * Validates: Requirements 9.6
   */
  useEffect(() => {
    const checkExpiredQuotes = async () => {
      const now = new Date();
      const expiredQuotes = quotes.filter(
        quote => 
          quote.status === 'pending' && 
          quote.validUntil && 
          new Date(quote.validUntil) < now
      );

      for (const quote of expiredQuotes) {
        await updateQuote(quote.id, { status: 'expired' });
      }

      if (expiredQuotes.length > 0) {
        refetch();
      }
    };

    if (!quotesLoading && quotes.length > 0) {
      checkExpiredQuotes();
    }
  }, [quotes, quotesLoading, updateQuote, refetch]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleViewQuote = (quote: Quote) => {
    router.push(`/quotes/${quote.id}`);
  };

  /**
   * Duplicate a quote with same customer and services
   * Validates: Requirements 9.4
   */
  const handleDuplicateQuote = async (quote: Quote) => {
    if (!quote.items || quote.items.length === 0 || !quote.customerId) {
      // Need to fetch full quote with items first
      router.push(`/quotes/new?duplicate=${quote.id}`);
      return;
    }

    // Calculate validity days from validUntil date
    const validityDays = quote.validUntil 
      ? Math.max(1, Math.ceil((new Date(quote.validUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 7;
    
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + validityDays);

    // Create new quote with same data
    const newQuote = await createQuote({
      customerId: quote.customerId,
      items: quote.items.map(item => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      subtotal: quote.subtotal,
      discountType: quote.discountType,
      discountValue: quote.discountValue,
      total: quote.total,
      notes: quote.notes,
      terms: quote.terms,
      validUntil,
    });

    if (newQuote) {
      router.push(`/quotes/${newQuote.id}`);
    }
  };

  /**
   * Update quote status
   * Validates: Requirements 9.5
   */
  const handleUpdateStatus = async (quoteId: string, status: QuoteStatus) => {
    await updateQuote(quoteId, { status });
    refetch();
  };

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !business) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-halloween-purple">Spooky</span>
              <span className="text-halloween-orange">Quote</span>
              <span className="ml-2">🎃</span>
            </h1>
            <p className="text-text-muted mt-1">{business.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="primary" onClick={() => router.push('/quotes/new')}>
              + New Quote
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quotes List */}
        <div className="bg-surface rounded-xl p-6 border border-halloween-purple/20">
          <QuoteList
            quotes={quotes}
            loading={quotesLoading}
            error={error}
            onViewQuote={handleViewQuote}
            onDuplicateQuote={handleDuplicateQuote}
            onUpdateStatus={handleUpdateStatus}
            onRefetch={refetch}
            duplicateLoading={createLoading}
            statusUpdateLoading={updateLoading}
          />
        </div>
      </div>
    </main>
  );
}
