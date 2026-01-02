import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { setTokenProvider } from '@/services/tokenProvider';
import type { UserResource } from '@clerk/types';

interface AuthContextType {
  user: UserResource | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut: clerkSignOut, getToken } = useClerkAuth();

  // Set up the token provider for the API service
  useEffect(() => {
    setTokenProvider(async () => {
      try {
        // Get the token from Clerk
        return await getToken();
      } catch (error) {
        console.error('Error getting token from Clerk:', error);
        return null;
      }
    });
  }, [getToken]);

  const signOut = async () => {
    try {
      await clerkSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: !isUserLoaded,
    isAuthenticated: !!user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
