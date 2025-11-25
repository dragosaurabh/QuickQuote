'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  LoadingSpinner,
  StatsCard,
  RecentQuotes,
  QuickActions,
} from '@quickquote/core/components';
import { useAuth, useBusiness, useDashboardStats } from '@quickquote/core/hooks';

/**
 * Dashboard page for Web Designer variant
 * Validates: Requirements 1.3, 2.1, 10.1, 10.2, 10.3, 10.4, 12.1, 12.4
 */
export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { stats, recentQuotes, loading: statsLoading } = useDashboardStats();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Redirect to onboarding if no business profile exists (Requirements 2.1)
  useEffect(() => {
    if (!authLoading && !businessLoading && user && !business) {
      router.push('/onboarding');
    }
  }, [user, authLoading, business, businessLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              <span className="text-halloween-purple">Spooky</span>
              <span className="text-halloween-orange">Quote</span>
              <span className="ml-2">🎃</span>
            </h1>
            <p className="text-text-muted mt-1">Welcome back, {business.name}</p>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Stats Cards - Requirements 10.1, 10.2, 10.3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Quotes This Month"
            value={statsLoading ? '...' : stats.totalQuotesThisMonth}
            icon={<span>📊</span>}
          />
          <StatsCard
            title="Accepted Value"
            value={statsLoading ? '...' : formatCurrency(stats.totalAcceptedValueThisMonth)}
            icon={<span>💰</span>}
          />
          <StatsCard
            title="Pending Amount"
            value={statsLoading ? '...' : formatCurrency(stats.totalPendingAmount)}
            icon={<span>⏳</span>}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Quotes - Requirements 10.4 */}
          <div className="lg:col-span-2">
            <RecentQuotes
              quotes={recentQuotes}
              onViewQuote={(id) => router.push(`/quotes/${id}`)}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <QuickActions
              onCreateQuote={() => router.push('/quotes/new')}
              onViewAllQuotes={() => router.push('/quotes')}
              onManageServices={() => router.push('/services')}
              onManageCustomers={() => router.push('/customers')}
              onSettings={() => router.push('/settings')}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
