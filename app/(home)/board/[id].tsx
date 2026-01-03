import React, { useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ItemFilterType, Board } from '@/services/types';
import { useItems } from '@/hooks/useItems';
import { boardsApi } from '@/services/api';
import ItemCard from '@/components/ItemCard';
import FilterTabs from '@/components/FilterTabs';
import FloatingActionButton from '@/components/FloatingActionButton';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, MoreHorizontal, Share } from 'lucide-react-native';

const ITEM_FILTER_TABS = [
  { id: ItemFilterType.ALL, label: 'All Items' },
  { id: ItemFilterType.VIDEOS, label: 'Videos' },
  { id: ItemFilterType.IMAGES, label: 'Images' },
  { id: ItemFilterType.LINKS, label: 'Links' },
];

export default function BoardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const boardId = parseInt(id || '0', 10);

  const [board, setBoard] = useState<Board | null>(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const { items, loading, filter, setFilter, refetch } = useItems(boardId);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchBoard(), refetch()]);
    setRefreshing(false);
  };

  const fetchBoard = async () => {
    try {
      setBoardLoading(true);
      const response = await boardsApi.getBoard(boardId);
      setBoard(response.data.list);
    } catch (error) {
      Alert.alert('Error', 'Failed to load board');
    } finally {
      setBoardLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  const handleAddItem = () => {
    Alert.alert('Add Item', 'Item creation modal will be implemented');
  };

  if (boardLoading && !board) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-border flex-row items-center justify-between border-b px-4 py-3">
        <Button variant="ghost" size="icon" className="h-10 w-10" onPress={() => router.back()}>
          <Icon as={ArrowLeft} size={18} />
        </Button>
        <View className="flex-1 px-2">
          <Text className="text-lg font-semibold" numberOfLines={1}>
            {board?.title || 'Board'}
          </Text>
          <Text className="text-muted-foreground text-xs">
            {board?.item_count || 0} items
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Icon as={Share} size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Icon as={MoreHorizontal} size={18} />
          </Button>
        </View>
      </View>

      {board?.cover_image ? (
        <View className="h-36 w-full bg-muted/40">
          <Image source={{ uri: board.cover_image }} className="h-full w-full" resizeMode="cover" />
        </View>
      ) : null}

      <FilterTabs
        tabs={ITEM_FILTER_TABS}
        activeTab={filter}
        onTabChange={(tabId) => setFilter(tabId as ItemFilterType)}
      />

      {loading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="No items yet"
          description="Add items to this board to get started"
        />
      ) : (
        <FlatList
          data={items}
          renderItem={({ item }) => <ItemCard item={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 120, rowGap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fff"
            />
          }
        />
      )}

      <FloatingActionButton onPress={handleAddItem} />
    </SafeAreaView>
  );
}
