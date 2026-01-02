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
import { ItemFormModal } from '@/components/ItemFormModal';
import { BoardFormModal } from '@/components/BoardFormModal';
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
  const [boardUpdating, setBoardUpdating] = useState(false);
  const [boardModalVisible, setBoardModalVisible] = useState(false);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const { items, allItems, loading, error, filter, setFilter, refetch, addItem, deleteItem } =
    useItems(boardId);
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
    setItemModalVisible(true);
  };
  const handleSubmitItem = async (url: string, _note?: string) => {
    setItemSubmitting(true);
    try {
      await addItem({ listId: boardId, url });
      setBoard((prev) =>
        prev
          ? {
              ...prev,
              item_count: (prev.item_count ?? allItems.length) + 1,
            }
          : prev
      );
      setItemModalVisible(false);
    } catch (err: any) {
      console.error('Failed to add item', err);
      const message = err?.response?.data?.error || 'Could not save this item. Please try again.';
      Alert.alert('Add Item Failed', message);
      await refetch();
    } finally {
      setItemSubmitting(false);
    }
  };
  const handleDeleteItem = (itemId: number) => {
    Alert.alert('Delete item', 'Remove this item from your board?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem(itemId);
            setBoard((prev) =>
              prev
                ? { ...prev, item_count: Math.max((prev.item_count ?? allItems.length) - 1, 0) }
                : prev
            );
          } catch (err) {
            console.error('Failed to delete item', err);
            Alert.alert('Delete Failed', 'Could not delete this item. Please try again.');
            refetch();
          }
        },
      },
    ]);
  };
  const openBoardOptions = () => {
    Alert.alert('Board actions', 'What would you like to do?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Edit board',
        onPress: () => setBoardModalVisible(true),
      },
      {
        text: 'Delete board',
        style: 'destructive',
        onPress: handleDeleteBoard,
      },
    ]);
  };
  const handleUpdateBoard = async (data: { title: string; description?: string; isPublic?: boolean }) => {
    if (!board) return;
    setBoardUpdating(true);
    try {
      const updated = await boardsApi.updateBoard(board.id, {
        title: data.title ?? board.title,
        description: data.description,
        isPublic: data.isPublic ?? board.is_public,
      });
      setBoard(updated);
      setBoardModalVisible(false);
    } catch (err: any) {
      console.error('Failed to update board', err);
      const message = err?.response?.data?.error || 'Could not update board. Please try again.';
      Alert.alert('Update Failed', message);
    } finally {
      setBoardUpdating(false);
    }
  };
  const handleDeleteBoard = async () => {
    if (!board) return;
    Alert.alert('Delete board', 'This will remove the board and all its items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBoardUpdating(true);
          try {
            await boardsApi.deleteBoard(board.id);
            router.back();
          } catch (err) {
            console.error('Failed to delete board', err);
            Alert.alert('Delete Failed', 'Could not delete this board. Please try again.');
          } finally {
            setBoardUpdating(false);
          }
        },
      },
    ]);
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
  const itemCount = board.item_count ?? allItems.length;
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
          <Pressable style={styles.iconButton} onPress={openBoardOptions} disabled={boardUpdating}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onDelete={() => handleDeleteItem(item.id)}
          />
        )}
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
                {itemCount} {itemCount === 1 ? 'item' : 'items'} |{' '}
                {board.is_public ? 'Public' : 'Private'} | Created by you
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
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <EmptyState
              title={error ? 'Unable to load items' : 'No items yet'}
              description={
                error ? 'Pull to refresh or try again.' : 'Add your first item to this board'
              }
              icon="📌"
            />
          )
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
      <ItemFormModal
        visible={itemModalVisible}
        onClose={() => setItemModalVisible(false)}
        onSubmit={handleSubmitItem}
        submitting={itemSubmitting}
      />
      <BoardFormModal
        visible={boardModalVisible}
        onClose={() => setBoardModalVisible(false)}
        onSubmit={({ title, description, isPublic }) =>
          handleUpdateBoard({ title, description, isPublic })
        }
        initialBoard={board}
        submitting={boardUpdating}
      />
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
