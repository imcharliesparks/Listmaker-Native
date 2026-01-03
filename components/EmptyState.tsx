import React from 'react';
import { View } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Inbox } from 'lucide-react-native';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Card className="w-full max-w-md items-center text-center">
        <CardHeader className="items-center">
          <View className="mb-2 rounded-full bg-muted/60 p-3">
            <Icon as={Inbox} size={24} className="text-muted-foreground" />
          </View>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description ? (
            <Text className="text-muted-foreground text-sm text-center">{description}</Text>
          ) : null}
        </CardHeader>
        <CardContent />
      </Card>
    </View>
  );
}
