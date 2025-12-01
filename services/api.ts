import axios from 'axios';
import { API_BASE_URL, TEST_USER_ID } from '../constants/Config';
import { Board, Item, CreateBoardRequest, AddItemRequest } from './types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For MVP without auth, we'll skip the Authorization header
// When you add auth, uncomment and modify:
// api.interceptors.request.use((config) => {
//   const token = await getFirebaseToken(); // Get from Firebase
//   config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

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
