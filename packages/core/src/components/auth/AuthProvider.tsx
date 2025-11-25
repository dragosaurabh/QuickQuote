'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UseAuthReturn } from '../../hooks/useAuth';

const AuthContext = createContext<UseAuthReturn | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component for authentication context
 * Wraps the application to provide auth state and methods
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuthContext(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
