'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  LoadingSpinner, 
  ServiceList 
} from '@quickquote/core/components';
import { 
  useAuth, 
  useBusiness, 
  useServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService 
} from '@quickquote/core/hooks';

/**
 * Services management page
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */
export default function ServicesPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { business, loading: businessLoading } = useBusiness();
  const { services, loading: servicesLoading, error, refetch } = useServices();
  const { createService, loading: createLoading } = useCreateService();
  const { updateService, loading: updateLoading } = useUpdateService();
  const { deleteService, loading: deleteLoading } = useDeleteService();
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
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Services List */}
        <div className="bg-surface rounded-xl p-6 border border-halloween-purple/20">
          <ServiceList
            services={services}
            loading={servicesLoading}
            error={error}
            onCreateService={createService}
            onUpdateService={updateService}
            onDeleteService={deleteService}
            onRefetch={refetch}
            createLoading={createLoading}
            updateLoading={updateLoading}
            deleteLoading={deleteLoading}
          />
        </div>
      </div>
    </main>
  );
}
