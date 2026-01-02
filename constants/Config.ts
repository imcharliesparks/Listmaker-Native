const rawBackendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

if (!rawBackendUrl) {
  throw new Error('Missing EXPO_PUBLIC_BACKEND_URL. Set it to your backend API base (e.g. http://192.168.x.x:3001/api)');
}

// Normalize to avoid trailing slash issues
export const API_BASE_URL = rawBackendUrl.replace(/\/$/, '');
