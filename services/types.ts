export interface Board {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  cover_image?: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface Item {
  id: number;
  list_id: number;
  url: string;
  title?: string;
  description?: string;
  thumbnail_url?: string;
  source_type?: string;
  metadata?: any;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardRequest {
  title: string;
  description?: string;
  isPublic?: boolean;
}

export interface AddItemRequest {
  listId: number;
  url: string;
}

export interface BackendUser {
  id: string;
  email: string;
  display_name?: string | null;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  details?: unknown;
}

export enum FilterType {
  ALL = 'all',
  RECENT = 'recent',
  FAVORITES = 'favorites',
}

export enum ItemFilterType {
  ALL = 'all',
  VIDEOS = 'videos',
  IMAGES = 'images',
  LINKS = 'links',
}
