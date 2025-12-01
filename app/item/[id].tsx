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
