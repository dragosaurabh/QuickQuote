'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { QuotePreview, QuoteShare } from '@quickquote/core/components';
import { LoadingSpinner } from '@quickquote/core/components';
import { ToastProvider } from '@quickquote/core/components';
import type { Quote, Business, Customer, QuoteItem } from '@quickquote/core/types';

interface QuoteData {
  quote: Quote;
  business: Business;
  customer?: Customer;
  items: QuoteItem[];
}

/**
 * Public Quote View Page
 * Displays a quote preview without requiring authentication.
 * 
 * Validates: Requirements 8.4
 */
export default function PublicQuotePage() {
  const params = useParams();
  const quoteId = params.id as string;
  
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuote() {
      if (!quoteId) {
        setError('Quote ID is required');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClientComponentClient();

        // Fetch quote with customer and items
        const { data: quoteData, error: quoteError } = await supabase
          .from('quotes')
          .select(`
            *,
            customers (*),
            quote_items (*)
          `)
          .eq('id', quoteId)
          .single();

        if (quoteError) {
          throw new Error(quoteError.message);
        }

        if (!quoteData) {
          setError('Quote not found');
          setLoading(false);
          return;
        }

        // Fetch business data
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', quoteData.business_id)
          .single();

        if (businessError) {
          throw new Error(businessError.message);
        }

        if (!businessData) {
          setError('Business not found');
          setLoading(false);
          return;
        }

        // Transform data to models
        const quote: Quote = {
          id: quoteData.id,
          businessId: quoteData.business_id,
          customerId: quoteData.customer_id || undefined,
          quoteNumber: quoteData.quote_number,
          status: quoteData.status,
          subtotal: quoteData.subtotal,
          discountType: quoteData.discount_type || undefined,
          discountValue: quoteData.discount_value,
          total: quoteData.total,
          notes: quoteData.notes || undefined,
          terms: quoteData.terms || undefined,
          validUntil: quoteData.valid_until ? new Date(quoteData.valid_until) : undefined,
          createdAt: new Date(quoteData.created_at),
          updatedAt: new Date(quoteData.updated_at),
        };

        const business: Business = {
          id: businessData.id,
          userId: businessData.user_id,
          name: businessData.name,
          logoUrl: businessData.logo_url || undefined,
          phone: businessData.phone || undefined,
          email: businessData.email || undefined,
          address: businessData.address || undefined,
          defaultTerms: businessData.default_terms || undefined,
          defaultValidityDays: businessData.default_validity_days,
          createdAt: new Date(businessData.created_at),
          updatedAt: new Date(businessData.updated_at),
        };

        let customer: Customer | undefined;
        if (quoteData.customers) {
          const c = quoteData.customers as {
            id: string;
            business_id: string;
            name: string;
            phone: string;
            email: string | null;
            address: string | null;
            created_at: string;
            updated_at: string;
          };
          customer = {
            id: c.id,
            businessId: c.business_id,
            name: c.name,
            phone: c.phone,
            email: c.email || undefined,
            address: c.address || undefined,
            createdAt: new Date(c.created_at),
            updatedAt: new Date(c.updated_at),
          };
        }

        const items: QuoteItem[] = (quoteData.quote_items || []).map((item: {
          id: string;
          quote_id: string;
          service_id: string | null;
          service_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        }) => ({
          id: item.id,
          quoteId: item.quote_id,
          serviceId: item.service_id || undefined,
          serviceName: item.service_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          createdAt: new Date(item.created_at),
        }));

        setData({ quote, business, customer, items });
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quote');
        setLoading(false);
      }
    }

    fetchQuote();
  }, [quoteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" customMessage="Summoning your quote from the shadows..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">👻</div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Quote Not Found
          </h1>
          <p className="text-text-muted">
            {error || 'This quote has vanished into the mist...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              🎃 SpookyQuote
            </h1>
            <p className="text-text-muted">
              Professional quotes with a spooky twist
            </p>
          </div>

          {/* Quote Preview */}
          <QuotePreview
            quote={data.quote}
            business={data.business}
            customer={data.customer}
            items={data.items}
            showActions={false}
          />

          {/* Share Actions */}
          <div className="mt-6 flex justify-center">
            <QuoteShare
              quote={data.quote}
              business={data.business}
              customer={data.customer}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-text-muted text-sm">
            <p>Powered by SpookyQuote 👻</p>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
