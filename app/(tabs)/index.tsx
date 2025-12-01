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
