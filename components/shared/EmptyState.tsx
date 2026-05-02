import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { MUTED } from '@/theme/colors';

type FeatherIconName = ComponentProps<typeof Feather>['name'];

interface EmptyStateProps {
  title: string;
  message: string;
  /** Defaults to 'inbox' — generic catch-all. */
  icon?: FeatherIconName;
  /** Optional CTA pair. Both must be provided to render the button. */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Generic empty-state primitive. Used for "no trucks scheduled today",
 * "no notifications yet", "no following", etc. — caller passes the copy
 * and (optionally) a different Feather icon. Keeps every empty list in
 * the app visually consistent.
 *
 * Pass `actionLabel` + `onAction` together to render a primary-orange
 * CTA below the message (e.g. "EXPLORE MAP" on the empty follow feed).
 * Both must be set or the button is suppressed.
 */
export function EmptyState({
  title,
  message,
  icon = 'inbox',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const showAction = actionLabel !== undefined && onAction !== undefined;
  return (
    <View className="items-center justify-center gap-3 px-6 py-12">
      <Feather name={icon} size={40} color={MUTED} />
      <Text className="text-center font-heading text-2xl tracking-wider text-typography-950">
        {title}
      </Text>
      <Text className="text-center font-body text-base text-typography-500">{message}</Text>
      {showAction ? (
        <View className="mt-4 w-full max-w-xs">
          <Button action="primary" size="lg" onPress={onAction}>
            <ButtonText>{actionLabel}</ButtonText>
          </Button>
        </View>
      ) : null}
    </View>
  );
}
