import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Menu, Search } from 'lucide-react-native';
import { Pages } from '@/constants/Shared';

type HeaderProps = {
  currentPage: Pages;
};

export default function Header({ currentPage }: HeaderProps) {
  return (
    <View className="border-border bg-background flex-row items-center justify-between border-b px-4 py-3">
      <View className="flex-1 gap-1.5">
        <View className="flex-row items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10" accessibilityLabel="Menu">
            <Icon as={Menu} size={18} />
          </Button>
          <Text className="text-xl font-semibold">Curate</Text>
        </View>
        {currentPage === Pages.Boards ? (
          <Text className="text-muted-foreground text-sm">Your Boards</Text>
        ) : null}
      </View>

      <View className="flex-row items-center gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10" accessibilityLabel="Search">
          <Icon as={Search} size={18} />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarFallback>😊</AvatarFallback>
        </Avatar>
      </View>
    </View>
  );
}
