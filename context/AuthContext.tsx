import React, { createContext, useContext, useEffect, ReactNode, useState, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { setTokenProvider } from '@/services/tokenProvider';
import { authApi } from '@/services/api';
import { BackendUser } from '@/services/types';
import type { UserResource } from '@clerk/types';

interface AuthContextType {
  user: UserResource | null | undefined;
  backendUser: BackendUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  backendError: string | null;
  refreshProfile: (options?: {
    displayName?: string | null;
    photoUrl?: string | null;
    force?: boolean;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut: clerkSignOut, getToken } = useClerkAuth();
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

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

  const refreshProfile = useCallback(
    async (options?: { displayName?: string | null; photoUrl?: string | null; force?: boolean }) => {
      if (!user && !options?.force) {
        setBackendUser(null);
        return;
      }

      setIsSyncingProfile(true);
      try {
        await authApi.syncProfile({
          displayName: options?.displayName ?? user?.fullName ?? user?.username ?? null,
          photoUrl: options?.photoUrl ?? user?.imageUrl ?? null,
        });

        const profile = await authApi.getMe();
        setBackendUser(profile);
        setBackendError(null);
      } catch (error) {
        console.error('Error syncing user with backend:', error);
        setBackendError('Unable to sync your profile. Pull to refresh or try again later.');
      } finally {
        setIsSyncingProfile(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!isUserLoaded) return;

    if (!user) {
      setBackendUser(null);
      setBackendError(null);
      return;
    }

    refreshProfile();
  }, [user, isUserLoaded, refreshProfile]);

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
    backendUser,
    backendError,
    isLoading: !isUserLoaded || isSyncingProfile,
    isAuthenticated: !!user,
    refreshProfile,
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
