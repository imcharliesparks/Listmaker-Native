import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Plus } from 'lucide-react-native';

type FloatingActionButtonProps = {
  onPress: () => void;
  label?: string;
};

export default function FloatingActionButton({ onPress, label }: FloatingActionButtonProps) {
  return (
    <View className="absolute bottom-6 right-6">
      <Button
        onPress={onPress}
        className="h-14 rounded-full px-5 shadow-lg shadow-black/30"
        aria-label={label || 'Add'}>
        <Icon as={Plus} size={18} />
        {label ? <View className="ml-2" /> : null}
      </Button>
    </View>
  );
}
