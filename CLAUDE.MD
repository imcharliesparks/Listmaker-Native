# React Native App Setup Guide - MVP

Complete step-by-step guide for setting up your Pinterest-style list app frontend with React Native, TypeScript, and Expo.

## Prerequisites

- Node.js installed
- Expo CLI installed (`npm install -g expo-cli`)
- React Native app already initialized with Expo and file-based routing
- Backend server running (from previous setup guide)

## Project Overview

We'll build 3 core screens for the MVP:
1. **Boards Screen** - View all boards in a grid layout
2. **Individual Board Screen** - View items within a board with filtering
3. **Individual Item Screen** - View detailed item information

**Note:** We're skipping authentication for the MVP. We'll hardcode a test user ID for API calls.

## Step 1: Install Dependencies

```bash
# Navigation and routing (if not already installed)
npx expo install expo-router react-native-safe-area-context react-native-screens

# UI Components
npm install @react-navigation/native

# HTTP Client
npm install axios

# Icons
npx expo install @expo/vector-icons

# Image handling
npx expo install expo-image

# Additional utilities
npm install react-native-url-polyfill
```

## Step 2: Project Structure

Your app structure should look like:

```
app/
├── (tabs)/                  # Tab-based navigation (if using tabs)
│   ├── index.tsx           # Boards screen
│   └── _layout.tsx         # Tab layout
├── board/
│   └── [id].tsx            # Individual board screen
├── item/
│   └── [id].tsx            # Individual item screen
├── _layout.tsx             # Root layout
components/
├── BoardCard.tsx           # Board card component
├── ItemCard.tsx            # Item card component
├── FilterTabs.tsx          # Filter tabs component
├── FloatingActionButton.tsx # FAB component
└── EmptyState.tsx          # Empty state component
services/
├── api.ts                  # API service
└── types.ts                # TypeScript types
hooks/
├── useBoards.ts            # Boards data hook
└── useItems.ts             # Items data hook
constants/
├── Colors.ts               # App colors
└── Config.ts               # App configuration
assets/
├── images/
└── fonts/
```

## Step 3: Create Constants

### `constants/Colors.ts`:

```typescript
export const Colors = {
  primary: '#8B5CF6',        // Purple from UI
  primaryDark: '#7C3AED',
  secondary: '#EC4899',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  
  // Light variants
  primaryLight: '#EDE9FE',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
};
```

### `constants/Config.ts`:

```typescript
// Replace with your actual backend URL
export const API_BASE_URL = 'http://localhost:3000/api';

// For testing without auth - replace with actual user ID from your database
export const TEST_USER_ID = 'test-user-123';
```

## Step 4: Create TypeScript Types

### `services/types.ts`:

```typescript
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
```

## Step 5: Create API Service

### `services/api.ts`:

```typescript
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
```

## Step 6: Create Reusable Components

### `components/BoardCard.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Board } from '../services/types';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/board/${board.id}`);
  };

  // Split cover_image if it contains multiple images (like "image1.jpg,image2.jpg")
  const coverImages = board.cover_image?.split(',') || [];
  const displayImages = coverImages.slice(0, 2); // Show max 2 images

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        {displayImages.length > 0 ? (
          <View style={styles.imagesGrid}>
            {displayImages.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img.trim() }}
                style={[
                  styles.image,
                  displayImages.length === 2 && index === 0 && styles.imageLeft,
                  displayImages.length === 2 && index === 1 && styles.imageRight,
                ]}
                resizeMode="cover"
              />
            ))}
          </View>
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📋</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {board.title}
        </Text>
        <Text style={styles.itemCount}>
          {board.item_count || 0} {board.item_count === 1 ? 'item' : 'items'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.gray100,
  },
  imagesGrid: {
    flex: 1,
    flexDirection: 'row',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLeft: {
    width: '50%',
    borderRightWidth: 1,
    borderRightColor: Colors.surface,
  },
  imageRight: {
    width: '50%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
  },
  placeholderText: {
    fontSize: 48,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
```

### `components/ItemCard.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Item } from '../services/types';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ItemCardProps {
  item: Item;
}

export default function ItemCard({ item }: ItemCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/item/${item.id}`);
  };

  const getSourceIcon = () => {
    switch (item.source_type) {
      case 'youtube':
        return 'logo-youtube';
      case 'twitter':
        return 'logo-twitter';
      case 'instagram':
        return 'logo-instagram';
      case 'amazon':
        return 'cart';
      default:
        return 'link';
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
    >
      {item.thumbnail_url ? (
        <Image
          source={{ uri: item.thumbnail_url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderThumbnail}>
          <Ionicons name={getSourceIcon()} size={32} color={Colors.primary} />
        </View>
      )}

      {item.source_type === 'youtube' && (
        <View style={styles.playButton}>
          <Ionicons name="play-circle" size={40} color="white" />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || 'Untitled'}
        </Text>
        {item.description && (
          <Text style={styles.source} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>

      <Pressable style={styles.bookmarkButton}>
        <Ionicons name="bookmark" size={20} color={Colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.gray100,
  },
  placeholderThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    top: 40,
    left: '50%',
    marginLeft: -20,
  },
  content: {
    padding: 12,
    paddingRight: 40,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  source: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 8,
  },
});
```

### `components/FilterTabs.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';

interface FilterTab {
  id: string;
  label: string;
  icon?: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.activeTab,
              pressed && styles.pressedTab,
            ]}
            onPress={() => onTabChange(tab.id)}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.icon && `${tab.icon} `}
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.gray200,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  pressedTab: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  activeTabText: {
    color: Colors.surface,
  },
});
```

### `components/FloatingActionButton.tsx`:

```typescript
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function FloatingActionButton({ 
  onPress, 
  icon = 'add' 
}: FloatingActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={28} color={Colors.surface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
```

### `components/EmptyState.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function EmptyState({ title, description, icon = '📋' }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
```

## Step 7: Create Custom Hooks

### `hooks/useBoards.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Board, FilterType } from '../services/types';
import { boardsApi } from '../services/api';

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await boardsApi.getBoards();
      setBoards(data);
    } catch (err) {
      setError('Failed to load boards');
      console.error('Error fetching boards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const filteredBoards = boards.filter((board) => {
    if (filter === FilterType.ALL) return true;
    if (filter === FilterType.RECENT) {
      // Show boards from last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(board.created_at) > weekAgo;
    }
    if (filter === FilterType.FAVORITES) {
      // This would require a favorites feature in the backend
      // For now, return empty array
      return false;
    }
    return true;
  });

  return {
    boards: filteredBoards,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchBoards,
  };
}
```

### `hooks/useItems.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Item, ItemFilterType } from '../services/types';
import { itemsApi } from '../services/api';

export function useItems(listId: number) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ItemFilterType>(ItemFilterType.ALL);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await itemsApi.getItems(listId);
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    if (filter === ItemFilterType.ALL) return true;
    if (filter === ItemFilterType.VIDEOS) {
      return item.source_type === 'youtube';
    }
    if (filter === ItemFilterType.IMAGES) {
      return item.source_type === 'image';
    }
    if (filter === ItemFilterType.LINKS) {
      return item.source_type === 'website';
    }
    return true;
  });

  return {
    items: filteredItems,
    loading,
    error,
    filter,
    setFilter,
    refetch: fetchItems,
  };
}
```

## Step 8: Create Screen Components

### `app/(tabs)/index.tsx` - Boards Screen:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { FilterType } from '../../services/types';
import { useBoards } from '../../hooks/useBoards';
import BoardCard from '../../components/BoardCard';
import FilterTabs from '../../components/FilterTabs';
import FloatingActionButton from '../../components/FloatingActionButton';
import EmptyState from '../../components/EmptyState';

const FILTER_TABS = [
  { id: FilterType.ALL, label: 'All Boards' },
  { id: FilterType.RECENT, label: 'Recent' },
  { id: FilterType.FAVORITES, label: 'Favorites', icon: '💜' },
];

export default function BoardsScreen() {
  const router = useRouter();
  const { boards, loading, error, filter, setFilter, refetch } = useBoards();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateBoard = () => {
    // For MVP, show alert - implement modal later
    Alert.alert(
      'Create Board',
      'Board creation modal will be implemented',
      [{ text: 'OK' }]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={Colors.text} />
          </Pressable>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>🎯</Text>
            </View>
            <Text style={styles.title}>Curate</Text>
          </View>
          <Text style={styles.subtitle}>Your Boards</Text>
        </View>

        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="search" size={24} color={Colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterTabs
        tabs={FILTER_TABS}
        activeTab={filter}
        onTabChange={(tabId) => setFilter(tabId as FilterType)}
      />

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <EmptyState
          title="No boards yet"
          description="Create your first board to start organizing your content"
          icon="📋"
        />
      ) : (
        <FlatList
          data={boards}
          renderItem={({ item }) => <BoardCard board={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* FAB */}
      <FloatingActionButton onPress={handleCreateBoard} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flex: 1,
  },
  menuButton: {
    marginBottom: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    gap: 16,
  },
});
```

### `app/board/[id].tsx` - Individual Board Screen:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ItemFilterType, Board } from '../../services/types';
import { useItems } from '../../hooks/useItems';
import { boardsApi } from '../../services/api';
import ItemCard from '../../components/ItemCard';
import FilterTabs from '../../components/FilterTabs';
import FloatingActionButton from '../../components/FloatingActionButton';
import EmptyState from '../../components/EmptyState';

const ITEM_FILTER_TABS = [
  { id: ItemFilterType.ALL, label: 'All Items' },
  { id: ItemFilterType.VIDEOS, label: 'Videos' },
  { id: ItemFilterType.IMAGES, label: 'Images' },
  { id: ItemFilterType.LINKS, label: 'Links' },
];

export default function BoardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const boardId = parseInt(id || '0');

  const [board, setBoard] = useState<Board | null>(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const { items, loading, filter, setFilter, refetch } = useItems(boardId);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBoard();
  }, [boardId]);

  const loadBoard = async () => {
    try {
      setBoardLoading(true);
      const data = await boardsApi.getBoard(boardId);
      setBoard(data);
    } catch (error) {
      console.error('Error loading board:', error);
      Alert.alert('Error', 'Failed to load board');
    } finally {
      setBoardLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadBoard(), refetch()]);
    setRefreshing(false);
  };

  const handleAddItem = () => {
    // For MVP, show alert - implement modal later
    Alert.alert(
      'Add Item',
      'Item addition modal will be implemented',
      [{ text: 'OK' }]
    );
  };

  if (boardLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!board) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title="Board not found"
          description="This board doesn't exist or was deleted"
          icon="❌"
        />
      </SafeAreaView>
    );
  }

  const coverImages = board.cover_image?.split(',').slice(0, 3) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {board.title}
        </Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="share-outline" size={24} color={Colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
          </Pressable>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={({ item }) => <ItemCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Board Header Image */}
            {coverImages.length > 0 && (
              <View style={styles.boardHeader}>
                <View style={styles.coverImagesContainer}>
                  {coverImages.map((img, index) => (
                    <Image
                      key={index}
                      source={{ uri: img.trim() }}
                      style={[
                        styles.coverImage,
                        index === 0 && styles.coverImageFirst,
                        index === 1 && styles.coverImageMiddle,
                        index === 2 && styles.coverImageLast,
                      ]}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Board Info */}
            <View style={styles.boardInfo}>
              <Text style={styles.itemCount}>
                {items.length} items | {board.is_public ? 'Public' : 'Private'} | Created by You
              </Text>
            </View>

            {/* Filter Tabs */}
            <FilterTabs
              tabs={ITEM_FILTER_TABS}
              activeTab={filter}
              onTabChange={(tabId) => setFilter(tabId as ItemFilterType)}
            />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            title="No items yet"
            description="Add your first item to this board"
            icon="📌"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      />

      <FloatingActionButton onPress={handleAddItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
  boardHeader: {
    height: 200,
    backgroundColor: Colors.gray100,
  },
  coverImagesContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  coverImage: {
    flex: 1,
    height: '100%',
  },
  coverImageFirst: {
    borderTopLeftRadius: 0,
  },
  coverImageMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: Colors.surface,
  },
  coverImageLast: {
    borderTopRightRadius: 0,
  },
  boardInfo: {
    padding: 16,
    backgroundColor: Colors.surface,
  },
  itemCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
});
```

### `app/item/[id].tsx` - Individual Item Screen:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Item } from '../../services/types';
import { itemsApi } from '../../services/api';

export default function ItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = parseInt(id || '0');

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      // Note: You may need to add a getItem endpoint to your backend
      // For now, this will error - you can implement it later
      const data = await itemsApi.getItem(itemId);
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSource = async () => {
    if (item?.url) {
      const supported = await Linking.canOpenURL(item.url);
      if (supported) {
        await Linking.openURL(item.url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    }
  };

  const handleAddNote = () => {
    Alert.alert('Add Note', 'Note feature will be implemented');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Extract tags from metadata if available
  const tags = item.metadata?.tags || ['travel', 'beach', 'resort'];
  const savedDate = new Date(item.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {item.title || 'Untitled'}
        </Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {/* Image */}
        {item.thumbnail_url && (
          <Image
            source={{ uri: item.thumbnail_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Content */}
        <View style={styles.details}>
          <Text style={styles.title}>{item.title || 'Untitled'}</Text>

          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}

          {/* Source */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Source</Text>
            <Pressable style={styles.sourceLink} onPress={handleOpenSource}>
              <Ionicons name="globe-outline" size={16} color={Colors.primary} />
              <Text style={styles.sourceLinkText} numberOfLines={1}>
                {item.url}
              </Text>
            </Pressable>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagsContainer}>
              {tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Saved Info */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Saved to: My Travel Wishlist</Text>
            <Text style={styles.savedDate}>Added on {savedDate}</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={handleAddNote}>
              <Ionicons name="chatbox-outline" size={20} color={Colors.text} />
              <Text style={styles.actionButtonText}>Add Note</Text>
            </Pressable>

            <Pressable style={styles.actionButtonPrimary} onPress={handleOpenSource}>
              <Ionicons name="link" size={20} color={Colors.surface} />
              <Text style={styles.actionButtonTextPrimary}>Open Source</Text>
            </Pressable>
          </View>

          {/* Bookmark */}
          <Pressable style={styles.bookmarkButton}>
            <Ionicons name="bookmark" size={24} color={Colors.text} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginHorizontal: 8,
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.gray100,
  },
  details: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceLinkText: {
    fontSize: 14,
    color: Colors.primary,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  savedDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.gray200,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.surface,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});
```

## Step 9: Configure Root Layout

### `app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="board/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### `app/(tabs)/_layout.tsx`:

```typescript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Boards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## Step 10: Update App Configuration

### `app.json` or `app.config.js`:

Add these configurations:

```json
{
  "expo": {
    "name": "Curate",
    "slug": "curate-app",
    "scheme": "curate",
    "platforms": ["ios", "android"],
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#8B5CF6"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.curate"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#8B5CF6"
      },
      "package": "com.yourcompany.curate"
    }
  }
}
```

## Step 11: Run the App

```bash
# Start the development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on physical device
# Scan the QR code with Expo Go app
```

## Step 12: Testing the App

### Test Flow:

1. **View Boards**: Open the app to see the boards screen
2. **Navigate to Board**: Tap on a board to see its items
3. **View Item Details**: Tap on an item to see full details
4. **Test Filtering**: Use the filter tabs on each screen
5. **Test Refresh**: Pull down to refresh data

## Known Limitations & Next Steps

### Current MVP Limitations:
- No authentication (hardcoded user)
- FAB buttons show alerts instead of modals
- No item creation flow yet
- No image upload
- Missing some API endpoints (single item GET)

### Immediate Next Steps:

1. **Add Item Creation Modal**
   - Create a modal component for adding items
   - Implement URL input and metadata fetching
   - Add to board screen

2. **Add Board Creation Modal**
   - Create modal for new board creation
   - Add to boards screen

3. **Implement Authentication**
   - Add Firebase Auth to React Native
   - Store and use real auth tokens
   - Add login/signup screens

4. **Add Missing API Endpoint**
   - Add `GET /items/:id` to backend
   - Update itemsApi.getItem() to use it

5. **Polish UI**
   - Add loading states
   - Improve error handling
   - Add animations
   - Implement pull-to-refresh animations

6. **Add Features**
   - Search functionality
   - Favorites
   - Item reordering
   - Share functionality
   - Notes on items

## Troubleshooting

### Common Issues:

1. **API Connection Failed**
   - Check backend is running
   - Verify API_BASE_URL in Config.ts
   - For iOS simulator, use `http://localhost:3000`
   - For Android emulator, use `http://10.0.2.2:3000`
   - For physical device, use your computer's local IP

2. **Images Not Loading**
   - Check CORS settings on backend
   - Verify image URLs are valid
   - Check network permissions

3. **Navigation Not Working**
   - Ensure expo-router is properly installed
   - Check file structure matches routing
   - Clear Metro bundler cache: `npx expo start -c`

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

You now have a fully functional React Native MVP! Let me know if you need help with any specific features or want to expand the functionality.