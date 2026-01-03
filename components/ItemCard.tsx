import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Bookmark, Link as LinkIcon, Play, Image as ImageIcon } from 'lucide-react-native';
import { Item } from '@/services/types';
import { cn } from '@/lib/utils';

type ItemCardProps = {
  item: Item;
};

const sourceIconMap: Record<string, React.ComponentType<any>> = {
  youtube: Play,
  twitter: LinkIcon,
  instagram: LinkIcon,
  amazon: LinkIcon,
};

export default function ItemCard({ item }: ItemCardProps) {
  const router = useRouter();
  const SourceIcon = sourceIconMap[item.source_type || ''] || LinkIcon;

  return (
    <Pressable
      className="flex-1"
      onPress={() => router.push(`/item/${item.id}`)}
      accessibilityLabel={`Open item ${item.title || 'Untitled'}`}>
      <Card className="overflow-hidden p-0">
        <View className="h-32 bg-muted/40">
          {item.thumbnail_url ? (
            <Image source={{ uri: item.thumbnail_url }} className="h-full w-full" resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center bg-muted">
              <Icon as={ImageIcon} size={24} className="text-muted-foreground" />
            </View>
          )}
        </View>
        {item.source_type === 'youtube' ? (
          <View className="absolute left-1/2 top-1/2 -ml-5 -mt-5 rounded-full bg-background/80 p-2">
            <Icon as={Play} size={24} />
          </View>
        ) : null}
        <CardContent className="gap-2 px-4 py-3">
          <Text className="text-sm font-semibold" numberOfLines={2}>
            {item.title || 'Untitled'}
          </Text>
          {item.description ? (
            <Text className="text-muted-foreground text-xs" numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          <View className="mt-1 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Icon as={SourceIcon} size={16} className="text-muted-foreground" />
              <Text className="text-muted-foreground text-xs capitalize">{item.source_type || 'link'}</Text>
            </View>
            <Icon as={Bookmark} size={16} className="text-muted-foreground" />
          </View>
        </CardContent>
      </Card>
    </Pressable>
  );
}
