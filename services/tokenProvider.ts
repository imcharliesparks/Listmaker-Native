/**
 * Token Provider Utility
 *
 * This module provides a way to access Clerk authentication tokens from
 * non-React contexts (like Axios interceptors) without directly importing
 * React hooks or creating circular dependencies.
 *
 * The AuthContext sets the token provider function, and the API service
 * can then call getToken() to retrieve the current user's token.
 */

type TokenProviderFunction = () => Promise<string | null>;

let tokenProviderFn: TokenProviderFunction | null = null;

/**
 * Set the token provider function
 * This should be called from the AuthContext when it initializes
 * @param fn Function that returns a promise resolving to the token or null
 */
export const setTokenProvider = (fn: TokenProviderFunction): void => {
  tokenProviderFn = fn;
};

/**
 * Get the current authentication token
 * @returns Promise resolving to the token string or null if not authenticated
 */
export const getToken = async (): Promise<string | null> => {
  if (!tokenProviderFn) {
    console.warn('Token provider not initialized. Call setTokenProvider first.');
    return null;
  }

  try {
    return await tokenProviderFn();
  } catch (error) {
    console.error('Error getting token from provider:', error);
    return null;
  }
};

/**
 * Clear the token provider
 * Useful for cleanup or testing
 */
export const clearTokenProvider = (): void => {
  tokenProviderFn = null;
};
