import axios from 'axios';
import { API_BASE_URL } from '../constants/Config';
import { Board, Item, CreateBoardRequest, AddItemRequest } from './types';
import { auth } from '@/config/firebase';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Firebase token to all requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error('Error getting Firebase token:', error);
    }
  }
  return config;
});

// Handle auth errors (401) by potentially refreshing token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 and haven't retried yet, try refreshing the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const user = auth.currentUser;
      if (user) {
        try {
          // Force refresh the token
          const token = await user.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const boardsApi = {
  // Get all boards for user
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get('/lists');
    return response.data.lists;
  },

  // Get single board
  getBoard: async (id: number): Promise<Board> => {
    const response = await api.get(`/lists/${id}`);
    return response.data.list;
  },

  // Create new board
  createBoard: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await api.post('/lists', data);
    return response.data.list;
  },

  // Update board
  updateBoard: async (id: number, data: Partial<CreateBoardRequest>): Promise<Board> => {
    const response = await api.put(`/lists/${id}`, data);
    return response.data.list;
  },

  // Delete board
  deleteBoard: async (id: number): Promise<void> => {
    await api.delete(`/lists/${id}`);
  },
};

export const itemsApi = {
  // Get items for a board
  getItems: async (listId: number): Promise<Item[]> => {
    const response = await api.get(`/items/list/${listId}`);
    return response.data.items;
  },

  // Get single item
  getItem: async (id: number): Promise<Item> => {
    // Note: You may need to add this endpoint to your backend
    const response = await api.get(`/items/${id}`);
    return response.data.item;
  },

  // Add item to board
  addItem: async (data: AddItemRequest): Promise<Item> => {
    const response = await api.post('/items', data);
    return response.data.item;
  },

  // Delete item
  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};

export default api;
