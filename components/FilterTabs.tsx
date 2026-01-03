import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export type FilterTab = {
  id: string;
  label: string;
};

type FilterTabsProps = {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export default function FilterTabs({ tabs, activeTab, onTabChange }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 py-3 gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <View key={tab.id}>
            <Button
              size="sm"
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                'rounded-full px-4',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-muted/40'
              )}
              onPress={() => onTabChange(tab.id)}>
              <Text className={cn('text-sm font-semibold', isActive && 'text-primary-foreground')}>
                {tab.label}
              </Text>
            </Button>
          </View>
        );
      })}
    </ScrollView>
  );
}
