import AsyncStorage from '@react-native-async-storage/async-storage';

// Token cache for Clerk using AsyncStorage
// This provides persistent authentication state across app restarts
const tokenCache = {
  async getToken(key: string) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting token from cache:', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error saving token to cache:', error);
    }
  },
};

export { tokenCache };
