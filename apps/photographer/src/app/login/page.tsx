'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@quickquote/core/components';
import { useAuth } from '@quickquote/core/hooks';

/**
 * Login/Signup page with Google OAuth and email/password options
 * Validates: Requirements 1.2, 1.3, 1.4, 12.3
 */
export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading, error, clearError, user } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    clearError();
    setLocalError(null);
    await signInWithGoogle();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSignUpSuccess(false);

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (isSignUp) {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }
      const result = await signUpWithEmail(email, password);
      if (!error) {
        setSignUpSuccess(true);
      }
    } else {
      await signInWithEmail(email, password);
      // Redirect will happen via useEffect when user state updates
    }
  };

  const handleRetry = () => {
    clearError();
    setLocalError(null);
  };

  const displayError = localError || error?.message;

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-halloween-purple/10 via-background to-halloween-orange/10" />
      <div className="absolute top-10 left-10 text-6xl opacity-10 animate-pulse">📸</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-10 animate-pulse delay-500">👻</div>

      <Card className="relative w-full max-w-md bg-surface border-halloween-purple/30">
        <CardHeader className="text-center pb-2">
          <div className="text-4xl mb-2">🕸️</div>
          <CardTitle className="text-2xl">
            {isSignUp ? 'Join the Crypt' : 'Enter the Crypt'}
          </CardTitle>
          <p className="text-text-muted text-sm mt-2">
            {isSignUp 
              ? 'Create your account to start crafting spooky quotes' 
              : 'Welcome back, fellow quote conjurer!'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Google Login Button */}
          <Button
            variant="secondary"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 border border-halloween-purple/50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Summoning...' : 'Continue with Google'}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-halloween-purple/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-text-muted">or use email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-background border-halloween-purple/30 focus:border-halloween-purple"
            />
            
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="bg-background border-halloween-purple/30 focus:border-halloween-purple"
            />

            {isSignUp && (
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="bg-background border-halloween-purple/30 focus:border-halloween-purple"
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full bg-gradient-to-r from-halloween-purple to-halloween-orange hover:opacity-90"
            >
              {loading 
                ? 'Casting spell...' 
                : isSignUp 
                  ? 'Create Account' 
                  : 'Sign In'}
            </Button>
          </form>

          {/* Success Message for Sign Up */}
          {signUpSuccess && (
            <div className="bg-halloween-green/10 border border-halloween-green/30 rounded-lg p-4 text-center">
              <p className="text-halloween-green text-sm">
                ✨ Check your email to confirm your account!
              </p>
            </div>
          )}

          {/* Error Display with Retry */}
          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
              <p className="text-red-400 text-sm mb-2">
                👻 {displayError}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="text-red-400 hover:text-red-300"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center text-sm">
            <span className="text-text-muted">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                clearError();
                setLocalError(null);
              }}
              className="ml-2 text-halloween-purple hover:text-halloween-orange transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-text-muted text-sm hover:text-halloween-purple transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
