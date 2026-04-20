import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { classNames, isTextLike } from '@/components/ui/_utils';

export type BadgeVariant = 'open' | 'closed' | 'accent' | 'muted' | 'moving';

export interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const baseContainer = 'flex-row items-center justify-center rounded-full px-3 py-1';

const variantContainer: Record<BadgeVariant, string> = {
  open: 'bg-success-400',
  closed: 'bg-error-400',
  accent: 'bg-tertiary-500',
  muted: 'bg-secondary-100 border border-outline-200',
  moving: 'bg-primary-400',
};

const baseLabel = 'font-mono text-[10px] uppercase tracking-[1.5px]';

const variantLabel: Record<BadgeVariant, string> = {
  open: 'text-typography-black',
  closed: 'text-typography-950',
  accent: 'text-typography-black',
  muted: 'text-typography-500',
  moving: 'text-typography-black',
};

export function Badge({ variant, children, className }: BadgeProps) {
  const containerClass = classNames(baseContainer, variantContainer[variant], className);
  const labelClass = classNames(baseLabel, variantLabel[variant]);

  return (
    <View accessibilityRole="text" className={containerClass}>
      {isTextLike(children) ? (
        <Text className={labelClass} numberOfLines={1}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
