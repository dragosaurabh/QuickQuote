'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  LoadingSpinner, 
  CustomerList 
} from '@quickquote/core/components';
import { 
  useAuth, 
  useBusiness, 
  useCustomers, 
  useCreateCustomer, 
  useUpdateCustomer 
} from '@quickquote/core/hooks';

/**
 * Customers management page
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4
 */
export default function CustomersPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { customers, loading: customersLoading, error, refetch } = useCustomers();
  const { createCustomer, loading: createLoading } = useCreateCustomer();
  const { updateCustomer, loading: updateLoading } = useUpdateCustomer();
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
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
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push('/services')}>
              Services
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-surface rounded-xl p-6 border border-halloween-purple/20">
          <CustomerList
            customers={customers}
            loading={customersLoading}
            error={error}
            onCreateCustomer={createCustomer}
            onUpdateCustomer={updateCustomer}
            onRefetch={refetch}
            createLoading={createLoading}
            updateLoading={updateLoading}
          />
        </div>
      </div>
    </main>
  );
}
