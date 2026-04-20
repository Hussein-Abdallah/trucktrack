import type { ReactNode } from 'react';
import type { PressableProps } from 'react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { CTA_WHITE } from '@/theme/colors';

export type ButtonAction = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<
  PressableProps,
  'style' | 'children' | 'disabled' | 'accessibilityRole' | 'accessibilityState'
> {
  action?: ButtonAction;
  size?: ButtonSize;
  isDisabled?: boolean;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

const baseContainer = 'flex-row items-center justify-center rounded-none';

const actionContainer: Record<ButtonAction, string> = {
  primary: 'bg-primary-400 active:bg-primary-200',
  secondary: 'bg-secondary-50 border border-outline-200 active:bg-secondary-100',
  ghost: 'bg-transparent active:bg-secondary-100',
  danger: 'bg-error-400 active:bg-error-300',
  success: 'bg-success-400 active:bg-success-300',
};

const sizeContainer: Record<ButtonSize, string> = {
  sm: 'h-8 px-3',
  md: 'h-11 px-4',
  lg: 'h-[52px] px-6',
};

const baseLabel = 'font-mono-medium uppercase tracking-[1px] text-typography-white';

const sizeLabel: Record<ButtonSize, string> = {
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-[12px]',
};

function classNames(...parts: (string | false | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

// Children like `{foo} {bar}` arrive as an array of strings/numbers, not a
// single string. Wrap any all-text-like children in <Text> so React Native
// doesn't throw "Text strings must be rendered within a <Text> component".
// null / undefined / boolean are treated as text-like because React renders
// them as nothing — keeps arrays like `['Save', condition && ' now']` safe.
function isTextLike(node: ReactNode): boolean {
  if (node === null || node === undefined || typeof node === 'boolean') return true;
  if (typeof node === 'string' || typeof node === 'number') return true;
  if (Array.isArray(node)) return node.every(isTextLike);
  return false;
}

function stringifyTextLike(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(stringifyTextLike).join('');
  return '';
}

export function Button({
  action = 'primary',
  size = 'md',
  isDisabled = false,
  isLoading = false,
  children,
  className,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const interactionDisabled = isDisabled || isLoading;

  const containerClass = classNames(
    baseContainer,
    actionContainer[action],
    sizeContainer[size],
    interactionDisabled && 'opacity-50',
    className,
  );

  const labelClass = classNames(baseLabel, sizeLabel[size]);
  const renderText = isTextLike(children);

  const labelNode = renderText ? <Text className={labelClass}>{children}</Text> : children;

  const derivedA11yLabel =
    accessibilityLabel ?? (renderText ? stringifyTextLike(children) || undefined : undefined);

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={derivedA11yLabel}
      accessibilityState={{ disabled: interactionDisabled, busy: isLoading }}
      disabled={interactionDisabled}
      className={containerClass}
    >
      <View className="relative flex-row items-center justify-center">
        <View className={isLoading ? 'opacity-0' : undefined}>{labelNode}</View>
        {isLoading ? (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="small" color={CTA_WHITE} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
