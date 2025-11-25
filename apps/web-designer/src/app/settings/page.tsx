'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Button, 
  LoadingSpinner, 
  SettingsPage 
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
 * Settings page for managing business profile, services, and quote defaults
 * Validates: Requirements 2.5, 3.1, 3.2, 3.3
 */
export default function SettingsPageRoute() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    business, 
    loading: businessLoading, 
    error: businessError,
    updateBusiness,
    uploadLogo,
    refetch: refetchBusiness
  } = useBusiness();
  const { services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
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
        <LoadingSpinner size="lg" customMessage="Loading your settings..." />
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
            <Button variant="ghost" onClick={() => router.push('/quotes')}>
              Quotes
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Settings Page Component */}
        <SettingsPage
          business={business}
          onUpdateBusiness={updateBusiness}
          onUploadLogo={uploadLogo}
          businessLoading={businessLoading}
          businessError={businessError}
          serviceListProps={{
            services,
            loading: servicesLoading,
            error: servicesError,
            onCreateService: createService,
            onUpdateService: updateService,
            onDeleteService: deleteService,
            onRefetch: refetchServices,
            createLoading,
            updateLoading,
            deleteLoading,
          }}
        />
      </div>
    </main>
  );
}
