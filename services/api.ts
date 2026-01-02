import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { API_BASE_URL } from '@/constants/Config';
import {
  ApiErrorPayload,
  BackendUser,
  Board,
  CreateBoardRequest,
  Item,
  AddItemRequest,
} from './types';
import { getToken } from './tokenProvider';

interface RetryableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        const headers: AxiosRequestHeaders = (config.headers || {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${token}`;
        config.headers = headers;
      }
    } catch (error) {
      console.error('Error getting authentication token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = await getToken();
        if (token) {
          const headers: AxiosRequestHeaders = (originalRequest.headers || {}) as AxiosRequestHeaders;
          headers.Authorization = `Bearer ${token}`;
          originalRequest.headers = headers;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  syncProfile: async (data: { displayName?: string | null; photoUrl?: string | null }) => {
    const response = await api.post<{ user: BackendUser }>('/auth/sync', data);
    return response.data.user;
  },
  getMe: async (): Promise<BackendUser> => {
    const response = await api.get<{ user: BackendUser }>('/auth/me');
    return response.data.user;
  },
};

export const boardsApi = {
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get<{ lists: Board[] }>('/lists');
    return response.data.lists;
  },
  getBoard: async (id: number): Promise<Board> => {
    const response = await api.get<{ list: Board }>(`/lists/${id}`);
    return response.data.list;
  },
  createBoard: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await api.post<{ list: Board }>('/lists', data);
    return response.data.list;
  },
  updateBoard: async (id: number, data: Partial<CreateBoardRequest>): Promise<Board> => {
    const response = await api.put<{ list: Board }>(`/lists/${id}`, data);
    return response.data.list;
  },
  deleteBoard: async (id: number): Promise<void> => {
    await api.delete(`/lists/${id}`);
  },
};

export const itemsApi = {
  getItems: async (listId: number): Promise<Item[]> => {
    const response = await api.get<{ items: Item[] }>(`/items/list/${listId}`);
    return response.data.items;
  },
  addItem: async (data: AddItemRequest): Promise<Item> => {
    const response = await api.post<{ item: Item }>('/items', data);
    return response.data.item;
  },
  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
};

export default api;
