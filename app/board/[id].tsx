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
