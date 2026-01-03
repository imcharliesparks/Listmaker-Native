import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Item } from '@/services/types';
import { itemsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { ArrowLeft, ExternalLink, Link as LinkIcon } from 'lucide-react-native';

export default function ItemScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = parseInt(id || '0', 10);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const response = await itemsApi.getItem(itemId);
      setItem(response.data.item);
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSource = () => {
    if (item?.url) {
      Linking.openURL(item.url);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-lg font-semibold">Item not found</Text>
          <Button className="mt-4" onPress={() => router.back()}>
            <Icon as={ArrowLeft} size={16} />
            <Text>Go back</Text>
          </Button>
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
        <Text className="flex-1 px-2 text-lg font-semibold" numberOfLines={1}>
          {item.title || 'Item'}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 48 }}>
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} className="h-48 w-full" resizeMode="cover" />
        ) : null}

        <View className="gap-3 px-4 py-6">
          <Text className="text-xl font-semibold">{item.title || 'Untitled'}</Text>
          {item.description ? (
            <Text className="text-muted-foreground text-base">{item.description}</Text>
          ) : null}

          <View className="flex-row items-center gap-2">
            <Icon as={LinkIcon} size={16} className="text-muted-foreground" />
            <Text className="text-muted-foreground text-sm" numberOfLines={1}>
              {item.url}
            </Text>
          </View>

          <Button variant="secondary" className="w-full" onPress={handleOpenSource}>
            <Icon as={ExternalLink} size={16} />
            <Text>Open Source</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
