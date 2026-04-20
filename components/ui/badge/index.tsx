'use client';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';
import { tva, withStyleContext, useStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils';
import type { Svg } from 'react-native-svg';

// Street Fire Badge — pill-shaped status chip.
// `action` is a domain concept for TruckTrack (open / closed / accent /
// muted / moving), not Gluestack's default semantic action set. Each fill
// pairs with a label colour chosen for max contrast per CLAUDE.md.
// Pill shape (rounded-full) is the single brand-sanctioned exception to
// TruckTrack's sharp-corner rule.

const SCOPE = 'BADGE';

const badgeStyle = tva({
  base: 'flex-row items-center justify-center rounded-full px-3 py-1 data-[disabled=true]:opacity-50',
  variants: {
    action: {
      open: 'bg-success-400',
      closed: 'bg-error-400',
      accent: 'bg-tertiary-500',
      muted: 'bg-secondary-100 border border-outline-200',
      moving: 'bg-primary-400',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
});

const badgeTextStyle = tva({
  base: 'font-mono uppercase tracking-[1.5px]',
  parentVariants: {
    action: {
      open: 'text-typography-black',
      closed: 'text-typography-white',
      accent: 'text-typography-black',
      muted: 'text-typography-500',
      moving: 'text-typography-black',
    },
    size: {
      sm: 'text-[9px]',
      md: 'text-[10px]',
      lg: 'text-[11px]',
    },
  },
});

const badgeIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    action: {
      open: 'text-typography-black',
      closed: 'text-typography-white',
      accent: 'text-typography-black',
      muted: 'text-typography-500',
      moving: 'text-typography-black',
    },
    size: {
      sm: 'h-3 w-3',
      md: 'h-3.5 w-3.5',
      lg: 'h-4 w-4',
    },
  },
});

const ContextView = withStyleContext(View, SCOPE);

cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
});

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof ContextView>, VariantProps<typeof badgeStyle> {
  className?: string;
}

// Defensive: callers who write `<Badge>Open</Badge>` instead of
// `<Badge><BadgeText>Open</BadgeText></Badge>` would otherwise hit RN's
// "Text strings must be rendered within a <Text> component" crash. Wrap
// text-like children in BadgeText automatically; pass elements through
// unchanged so composition with BadgeIcon / custom nodes still works.
function wrapBadgeChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      return <BadgeText>{child}</BadgeText>;
    }
    return child;
  });
}

function Badge({ children, action = 'muted', size = 'md', className, ...props }: BadgeProps) {
  const contextValue = useMemo(() => ({ action, size }), [action, size]);

  return (
    <ContextView
      accessibilityRole="text"
      className={badgeStyle({ action, size, class: className })}
      context={contextValue}
      {...props}
    >
      {wrapBadgeChildren(children)}
    </ContextView>
  );
}

export interface BadgeTextProps
  extends React.ComponentPropsWithoutRef<typeof Text>, VariantProps<typeof badgeTextStyle> {}

const BadgeText = React.forwardRef<React.ComponentRef<typeof Text>, BadgeTextProps>(
  function BadgeText(
    { children, className, size, numberOfLines = 1, ellipsizeMode = 'tail', ...props },
    ref,
  ) {
    const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);
    return (
      <Text
        ref={ref}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        className={badgeTextStyle({
          parentVariants: {
            size: parentSize,
            action: parentAction,
          },
          size,
          class: className,
        })}
        {...props}
      >
        {children}
      </Text>
    );
  },
);

// PrimitiveIcon and VariantProps both declare `size` with incompatible
// types — strip it from both parents and redeclare here so the runtime
// `typeof size === 'number'` branch in BadgeIcon stays reachable.
export interface BadgeIconProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof PrimitiveIcon>, 'size'>,
    Omit<VariantProps<typeof badgeIconStyle>, 'size'> {
  size?: 'sm' | 'md' | 'lg' | number;
}

const BadgeIcon = React.forwardRef<React.ComponentRef<typeof Svg>, BadgeIconProps>(
  function BadgeIcon({ className, size, ...props }, ref) {
    const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);
    const parentVariants = { size: parentSize, action: parentAction };

    if (typeof size === 'number') {
      return (
        <UIIcon
          ref={ref}
          {...props}
          className={badgeIconStyle({ parentVariants, class: className })}
          size={size}
        />
      );
    } else if ((props?.height !== undefined || props?.width !== undefined) && size === undefined) {
      return (
        <UIIcon
          ref={ref}
          {...props}
          className={badgeIconStyle({ parentVariants, class: className })}
        />
      );
    }
    return (
      <UIIcon
        ref={ref}
        {...props}
        className={badgeIconStyle({
          parentVariants,
          size,
          class: className,
        })}
      />
    );
  },
);

Badge.displayName = 'Badge';
BadgeText.displayName = 'BadgeText';
BadgeIcon.displayName = 'BadgeIcon';

export { Badge, BadgeIcon, BadgeText };
