import React, { useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterType } from '@/services/types';
import { useBoards } from '@/hooks/useBoards';
import BoardCard from '@/components/BoardCard';
import FilterTabs from '@/components/FilterTabs';
import FloatingActionButton from '@/components/FloatingActionButton';
import EmptyState from '@/components/EmptyState';
import Header from '@/components/Header';
import { Pages } from '@/constants/Shared';

const FILTER_TABS = [
  { id: FilterType.ALL, label: 'All Boards' },
  { id: FilterType.RECENT, label: 'Recent' },
  { id: FilterType.FAVORITES, label: 'Favorites' },
];

export default function BoardsScreen() {
  const { boards, loading, filter, setFilter, refetch } = useBoards();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateBoard = () => {
    Alert.alert('Create Board', 'Board creation modal will be implemented', [{ text: 'OK' }]);
  };

  if (loading && !refreshing) {
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
      <Header currentPage={Pages.Boards} />

      <FilterTabs
        tabs={FILTER_TABS}
        activeTab={filter}
        onTabChange={(tabId) => setFilter(tabId as FilterType)}
      />

      {boards.length === 0 ? (
        <EmptyState
          title="No boards yet"
          description="Create your first board to start organizing your content"
        />
      ) : (
        <FlatList
          data={boards}
          renderItem={({ item }) => <BoardCard board={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 120, rowGap: 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />
          }
        />
      )}

      <FloatingActionButton onPress={handleCreateBoard} />
    </SafeAreaView>
  );
}
