import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Images } from 'lucide-react-native';
import { Board } from '@/services/types';
import { cn } from '@/lib/utils';

type BoardCardProps = {
  board: Board;
};

export default function BoardCard({ board }: BoardCardProps) {
  const router = useRouter();
  const coverImages = board.cover_image?.split(',').filter(Boolean) ?? [];
  const displayImages = coverImages.slice(0, 2);

  return (
    <Pressable
      className="flex-1"
      onPress={() => router.push(`/board/${board.id}`)}
      accessibilityLabel={`Open board ${board.title}`}>
      <Card className="h-full overflow-hidden p-0">
        <View className="h-36 flex-row bg-muted/40">
          {displayImages.length > 0 ? (
            displayImages.map((uri, index) => (
              <Image
                key={`${uri}-${index}`}
                source={{ uri: uri.trim() }}
                className={cn('h-full flex-1', displayImages.length === 2 && index === 0 && 'border-r border-border/40')}
                resizeMode="cover"
              />
            ))
          ) : (
            <View className="flex-1 items-center justify-center bg-muted">
              <Icon as={Images} size={28} className="text-muted-foreground" />
            </View>
          )}
        </View>
        <CardHeader className="gap-1 px-4 py-3">
          <CardTitle className="text-base">{board.title}</CardTitle>
          <Text className="text-muted-foreground text-sm">
            {board.item_count || 0} {board.item_count === 1 ? 'item' : 'items'}
          </Text>
        </CardHeader>
        <CardContent className="pb-4" />
      </Card>
    </Pressable>
  );
}
