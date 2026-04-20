import React from 'react';
import { createButton } from '@gluestack-ui/core/button/creator';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { CTA_WHITE, FIRE_ORANGE } from '@/theme/colors';

// Street Fire Button — sharp-corner pill alternative. `action` is a domain
// concept (primary / secondary / ghost / danger / success) rather than
// Gluestack's default semantic actions. Pressed state uses a lighter token
// of the same family; labels are `text-typography-white` (CTA white, not
// body Warm Cream) for max contrast on brand fills per CLAUDE.md.

const SCOPE = 'BUTTON';

const Root = withStyleContext(Pressable, SCOPE);

const UIButton = createButton({
  Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: UIIcon,
});

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

const buttonStyle = tva({
  base: 'flex-row items-center justify-center rounded-none gap-2 data-[disabled=true]:opacity-50',
  variants: {
    action: {
      primary: 'bg-primary-400 data-[active=true]:bg-primary-200',
      secondary: 'bg-secondary-50 border border-outline-200 data-[active=true]:bg-secondary-100',
      ghost: 'bg-transparent data-[active=true]:bg-secondary-100',
      danger: 'bg-error-400 data-[active=true]:bg-error-300',
      success: 'bg-success-400 data-[active=true]:bg-success-300',
    },
    size: {
      sm: 'min-h-8 px-3 py-1.5',
      md: 'min-h-11 px-4 py-2',
      lg: 'min-h-[52px] px-6 py-2.5',
    },
  },
});

const buttonTextStyle = tva({
  base: 'shrink text-center font-mono-medium uppercase tracking-[1px]',
  parentVariants: {
    action: {
      primary: 'text-typography-white',
      secondary: 'text-primary-400',
      ghost: 'text-primary-400',
      danger: 'text-typography-white',
      success: 'text-typography-white',
    },
    size: {
      sm: 'text-[10px]',
      md: 'text-[11px]',
      lg: 'text-[12px]',
    },
  },
});

const buttonIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    action: {
      primary: 'text-typography-white',
      secondary: 'text-primary-400',
      ghost: 'text-primary-400',
      danger: 'text-typography-white',
      success: 'text-typography-white',
    },
    size: {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-[18px] w-[18px]',
    },
  },
});

const buttonGroupStyle = tva({
  base: '',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
    },
    isAttached: {
      true: 'gap-0',
    },
    flexDirection: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  },
});

export interface ButtonProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof UIButton>, 'context'>,
    VariantProps<typeof buttonStyle> {
  className?: string;
}

const Button = React.forwardRef<React.ElementRef<typeof UIButton>, ButtonProps>(
  ({ className, size = 'md', action = 'primary', ...props }, ref) => (
    <UIButton
      ref={ref}
      {...props}
      className={buttonStyle({ size, action, class: className })}
      context={{ size, action }}
    />
  ),
);

export interface ButtonTextProps
  extends
    React.ComponentPropsWithoutRef<typeof UIButton.Text>,
    VariantProps<typeof buttonTextStyle> {
  className?: string;
}

const ButtonText = React.forwardRef<React.ElementRef<typeof UIButton.Text>, ButtonTextProps>(
  ({ className, size, ...props }, ref) => {
    const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);
    return (
      <UIButton.Text
        ref={ref}
        {...props}
        className={buttonTextStyle({
          parentVariants: { size: parentSize, action: parentAction },
          size,
          class: className,
        })}
      />
    );
  },
);

const SPINNER_FOREGROUND: Record<string, string> = {
  primary: CTA_WHITE,
  secondary: FIRE_ORANGE,
  ghost: FIRE_ORANGE,
  danger: CTA_WHITE,
  success: CTA_WHITE,
};

export interface ButtonSpinnerProps extends React.ComponentPropsWithoutRef<
  typeof UIButton.Spinner
> {}

const ButtonSpinner = React.forwardRef<
  React.ElementRef<typeof UIButton.Spinner>,
  ButtonSpinnerProps
>(({ color, ...props }, ref) => {
  const { action } = useStyleContext(SCOPE);
  return (
    <UIButton.Spinner
      ref={ref}
      color={color ?? SPINNER_FOREGROUND[action] ?? CTA_WHITE}
      {...props}
    />
  );
});

// ButtonIcon's `size` prop accepts both tva tokens ('sm'|'md'|'lg') AND
// explicit numeric overrides from PrimitiveIcon — the two types conflict
// when extending via `interface`, so strip + redeclare. Same pattern we
// used on BadgeIconProps.
export interface ButtonIconProps
  extends
    Omit<React.ComponentPropsWithoutRef<typeof UIButton.Icon>, 'size'>,
    Omit<VariantProps<typeof buttonIconStyle>, 'size'> {
  className?: string;
  as?: React.ElementType;
  height?: number;
  width?: number;
  size?: 'sm' | 'md' | 'lg' | number;
}

const ButtonIcon = React.forwardRef<React.ElementRef<typeof UIButton.Icon>, ButtonIconProps>(
  ({ className, size, ...props }, ref) => {
    const { size: parentSize, action: parentAction } = useStyleContext(SCOPE);
    const parentVariants = { size: parentSize, action: parentAction };

    if (typeof size === 'number') {
      return (
        <UIButton.Icon
          ref={ref}
          {...props}
          className={buttonIconStyle({ parentVariants, class: className })}
          size={size}
        />
      );
    } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
      return (
        <UIButton.Icon
          ref={ref}
          {...props}
          className={buttonIconStyle({ parentVariants, class: className })}
        />
      );
    }
    return (
      <UIButton.Icon
        ref={ref}
        {...props}
        className={buttonIconStyle({
          parentVariants,
          size,
          class: className,
        })}
      />
    );
  },
);

export interface ButtonGroupProps
  extends
    React.ComponentPropsWithoutRef<typeof UIButton.Group>,
    VariantProps<typeof buttonGroupStyle> {}

const ButtonGroup = React.forwardRef<React.ElementRef<typeof UIButton.Group>, ButtonGroupProps>(
  ({ className, space = 'md', isAttached = false, flexDirection = 'row', ...props }, ref) => (
    <UIButton.Group
      ref={ref}
      {...props}
      className={buttonGroupStyle({
        class: className,
        space,
        isAttached,
        flexDirection,
      })}
    />
  ),
);

Button.displayName = 'Button';
ButtonText.displayName = 'ButtonText';
ButtonSpinner.displayName = 'ButtonSpinner';
ButtonIcon.displayName = 'ButtonIcon';
ButtonGroup.displayName = 'ButtonGroup';

export { Button, ButtonText, ButtonSpinner, ButtonIcon, ButtonGroup };
