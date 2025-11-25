'use client';

export const dynamic = 'force-dynamic';

import { Button } from '@quickquote/core/components';
import { useAuth } from '@quickquote/core/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Landing page with hero section, Google login, and feature highlights
 * Validates: Requirements 1.1, 12.1, 12.4
 */
export default function LandingPage() {
  const { user, loading, signInWithGoogle, error } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Spooky background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-halloween-purple/20 via-background to-halloween-green/10" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-pulse">🎃</div>
        <div className="absolute top-40 right-20 text-4xl opacity-20 animate-pulse delay-300">👻</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-20 animate-pulse delay-500">🕷️</div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold mb-6">
              <span className="text-halloween-purple">Spooky</span>
              <span className="text-halloween-orange">Quote</span>
              <span className="ml-3">🎃</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-text-muted mb-4">
              Create hauntingly good quotes for your web design clients
            </p>
            <p className="text-lg text-text-muted/80 mb-12 max-w-2xl mx-auto">
              Professional price quotes that will make your clients scream... with delight! 
              Share instantly via WhatsApp and close deals faster than a ghost through walls.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="min-w-[250px] bg-gradient-to-r from-halloween-purple to-halloween-orange hover:opacity-90 transition-opacity"
              >
                {loading ? 'Summoning portal...' : 'Continue with Google'}
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={() => router.push('/login')}
                className="min-w-[250px] border border-halloween-purple/50 hover:bg-halloween-purple/10"
              >
                Sign in with Email
              </Button>
            </div>

            {error && (
              <p className="mt-4 text-red-400 text-sm">
                Oops! Something spooky happened: {error.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-surface/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            <span className="text-halloween-green">Frighteningly</span> Easy to Use
          </h2>
          <p className="text-text-muted text-center mb-12 max-w-2xl mx-auto">
            No tricks, just treats. Create professional quotes in minutes.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="⚡"
              title="Lightning Fast"
              description="Create quotes in seconds with pre-saved services and customer info."
              color="purple"
            />
            <FeatureCard
              icon="📱"
              title="WhatsApp Ready"
              description="Share quotes instantly via WhatsApp with a single tap."
              color="green"
            />
            <FeatureCard
              icon="📊"
              title="Track Everything"
              description="See all your quotes in one place with our spooky dashboard."
              color="orange"
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-halloween-purple/20 to-halloween-orange/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Create Some <span className="text-halloween-green">Magic</span>?
          </h2>
          <p className="text-text-muted mb-8">
            Join fellow web designers who have already made their quoting process spooktacular!
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="bg-gradient-to-r from-halloween-purple to-halloween-orange hover:opacity-90"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-surface">
        <div className="max-w-6xl mx-auto text-center text-text-muted text-sm">
          <p>SpookyQuote - Making quotes less scary since 2024</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, color }: {
  icon: string;
  title: string;
  description: string;
  color: 'purple' | 'green' | 'orange';
}) {
  const colorClasses = {
    purple: 'border-halloween-purple/20 hover:border-halloween-purple/50 text-halloween-purple',
    green: 'border-halloween-green/20 hover:border-halloween-green/50 text-halloween-green',
    orange: 'border-halloween-orange/20 hover:border-halloween-orange/50 text-halloween-orange',
  };

  return (
    <div className={`bg-surface rounded-xl p-6 border transition-colors ${colorClasses[color]}`}>
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className={`text-xl font-semibold mb-2 ${colorClasses[color].split(' ').pop()}`}>{title}</h3>
      <p className="text-text-muted">{description}</p>
    </div>
  );
}
