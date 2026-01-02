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
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/Colors';
import { CreateBoardRequest, FilterType } from '../../services/types';
import { useBoards } from '../../hooks/useBoards';
import BoardCard from '../../components/BoardCard';
import FilterTabs from '../../components/FilterTabs';
import FloatingActionButton from '../../components/FloatingActionButton';
import EmptyState from '../../components/EmptyState';
import Header from "@/components/Header";
import {Pages} from "@/constants/Shared";
import { BoardFormModal } from '@/components/BoardFormModal';

const FILTER_TABS = [
  { id: FilterType.ALL, label: 'All Boards' },
  { id: FilterType.RECENT, label: 'Recent' },
  { id: FilterType.FAVORITES, label: 'Favorites', icon: '💜' },
];

export default function BoardsScreen() {
  const { boards, loading, error, filter, setFilter, refetch, createBoard } = useBoards();
  const [refreshing, setRefreshing] = useState(false);
  const [isBoardModalVisible, setBoardModalVisible] = useState(false);
  const [isSubmittingBoard, setSubmittingBoard] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateBoard = () => {
    setBoardModalVisible(true);
  };

  const handleSubmitBoard = async (data: CreateBoardRequest) => {
    setSubmittingBoard(true);
    try {
      await createBoard(data);
      setBoardModalVisible(false);
    } catch (err: any) {
      console.error('Failed to create board', err);
      const message = err?.response?.data?.error || 'Could not create board. Please try again.';
      Alert.alert('Create Board Failed', message);
    } finally {
      setSubmittingBoard(false);
    }
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
      <Header currentPage={Pages.Boards} />

      {/* Filter Tabs */}
      <FilterTabs
        tabs={FILTER_TABS}
        activeTab={filter}
        onTabChange={(tabId) => setFilter(tabId as FilterType)}
      />

      {error && (
          <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={Colors.error}/>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={refetch}>
                  <Text style={styles.retryText}>Retry</Text>
              </Pressable>
          </View>
      )}

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

      <BoardFormModal
        visible={isBoardModalVisible}
        onClose={() => setBoardModalVisible(false)}
        onSubmit={handleSubmitBoard}
        submitting={isSubmittingBoard}
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderColor: Colors.error,
    borderWidth: 1,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 13,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
});
