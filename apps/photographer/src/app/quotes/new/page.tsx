'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  LoadingSpinner,
  QuoteCreationForm,
  useToast,
} from '@quickquote/core/components';
import {
  useAuth,
  useBusiness,
  useCustomers,
  useServices,
  useCreateCustomer,
  useCreateQuote,
} from '@quickquote/core/hooks';
import type { QuoteFormData } from '@quickquote/core/components';

/**
 * Quote creation page
 * Validates: Requirements 5.1, 5.2, 5.6, 5.7, 5.8
 */
export default function NewQuotePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { customers, loading: customersLoading, refetch: refetchCustomers } = useCustomers();
  const { services, loading: servicesLoading } = useServices();
  const { createCustomer, loading: createCustomerLoading } = useCreateCustomer();
  const { createQuote, loading: createQuoteLoading, error: createQuoteError } = useCreateQuote();
  const router = useRouter();
  const { addToast } = useToast();

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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleCreateCustomer = async (data: Parameters<typeof createCustomer>[0]) => {
    const customer = await createCustomer(data);
    if (customer) {
      await refetchCustomers();
      addToast('success', '👻 Customer summoned successfully!');
    }
    return customer;
  };


  const handleSubmit = async (data: QuoteFormData) => {
    const quote = await createQuote({
      customerId: data.customerId,
      items: data.items,
      subtotal: data.subtotal,
      discountType: data.discountType,
      discountValue: data.discountValue,
      total: data.total,
      notes: data.notes,
      terms: data.terms,
      validUntil: data.validUntil,
    });

    if (quote) {
      addToast('success', '🎃 Quote conjured successfully!');
      // Navigate to quote preview/detail page
      router.push(`/quotes/${quote.id}`);
    } else if (createQuoteError) {
      addToast('error', createQuoteError.message || 'Failed to create quote');
    }
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-halloween-purple">Spooky</span>
              <span className="text-halloween-orange">Quote</span>
              <span className="ml-2">📸</span>
            </h1>
            <p className="text-text-muted mt-1">{business.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push('/quotes')}>
              All Quotes
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary">Create New Quote</h2>
          <p className="text-text-secondary mt-1">
            Select a customer and services to generate a professional quote
          </p>
        </div>

        {/* Quote Creation Form */}
        <QuoteCreationForm
          business={business}
          customers={customers}
          services={services}
          customersLoading={customersLoading}
          servicesLoading={servicesLoading}
          onCreateCustomer={handleCreateCustomer}
          onSubmit={handleSubmit}
          isSubmitting={createQuoteLoading || createCustomerLoading}
        />
      </div>
    </main>
  );
}
