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
