import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface EmptyStateProps {
  title: string;
  message: string;
  /** Defaults to 'inbox' — generic catch-all. */
  icon?: FeatherIconName;
}

const ICON_COLOR = '#888888';

/**
 * Generic empty-state primitive. Used for "no trucks scheduled today",
 * "no notifications yet", "no following", etc. — caller passes the copy
 * and (optionally) a different Feather icon. Keeps every empty list in
 * the app visually consistent.
 */
export function EmptyState({ title, message, icon = 'inbox' }: EmptyStateProps) {
  return (
    <View className="items-center justify-center gap-3 px-6 py-12">
      <Feather name={icon} size={40} color={ICON_COLOR} />
      <Text className="text-center font-heading text-2xl tracking-wider text-typography-950">
        {title}
      </Text>
      <Text className="text-center font-body text-base text-typography-500">{message}</Text>
    </View>
  );
}
