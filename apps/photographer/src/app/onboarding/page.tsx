'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingWizard, LoadingSpinner } from '@quickquote/core/components';
import { useAuth, useBusiness, useCreateBusiness } from '@quickquote/core/hooks';
import { BusinessFormInput } from '@quickquote/core/types';

/**
 * Onboarding page for new users to set up their business profile
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading, uploadLogo } = useBusiness();
  const { createBusiness, loading: createLoading, error: createError } = useCreateBusiness();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Redirect to dashboard if business already exists
  useEffect(() => {
    if (!businessLoading && business) {
      router.push('/dashboard');
    }
  }, [business, businessLoading, router]);

  const handleComplete = async (data: BusinessFormInput, logoFile?: File) => {
    setError(null);
    
    // Create the business profile
    const newBusiness = await createBusiness(data);
    
    if (!newBusiness) {
      setError(createError?.message || 'Failed to create business profile');
      return;
    }

    // Upload logo if provided
    if (logoFile) {
      const logoUrl = await uploadLogo(logoFile);
      if (!logoUrl) {
        // Logo upload failed but business was created, continue anyway
        console.warn('Logo upload failed, continuing without logo');
      }
    }

    // Redirect to dashboard
    router.push('/dashboard');
  };

  // Show loading while checking auth and business status
  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render if not authenticated or business exists
  if (!user || business) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-halloween-purple">Welcome to Spooky</span>
            <span className="text-halloween-orange">Quote</span>
            <span className="ml-2">📸</span>
          </h1>
          <p className="text-text-muted">
            Let&apos;s set up your photography business profile to get started
          </p>
        </div>

        <OnboardingWizard
          onComplete={handleComplete}
          isLoading={createLoading}
          error={error}
        />
      </div>
    </main>
  );
}
