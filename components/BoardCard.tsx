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
