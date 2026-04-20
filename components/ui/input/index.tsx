import React from 'react';
import { createInput } from '@gluestack-ui/core/input/creator';
import { View, Pressable, TextInput, Text, type TextInputProps } from 'react-native';
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils';
import { cssInterop } from 'nativewind';
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator';

const SCOPE = 'INPUT';

const UIInput = createInput({
  Root: withStyleContext(View, SCOPE),
  Icon: UIIcon,
  Slot: Pressable,
  Input: TextInput,
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

const inputStyle = tva({
  base: 'relative flex-row items-center rounded-none bg-secondary-50 border border-outline-200 data-[focus=true]:border-primary-400 data-[invalid=true]:border-error-400 data-[disabled=true]:opacity-50',
  variants: {
    size: {
      md: 'h-11',
      lg: 'h-[52px]',
    },
  },
});

const inputIconStyle = tva({
  base: 'justify-center items-center text-typography-500 fill-none',
  parentVariants: {
    size: {
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
});

const inputSlotStyle = tva({
  base: 'justify-center items-center',
});

const inputFieldStyle = tva({
  base: 'flex-1 text-typography-950 text-[14px] font-body py-0 placeholder:text-typography-500 h-full ios:leading-[0px]',
});

export interface InputProps extends Pick<
  TextInputProps,
  | 'value'
  | 'onChangeText'
  | 'placeholder'
  | 'autoCapitalize'
  | 'keyboardType'
  | 'secureTextEntry'
  | 'textContentType'
  | 'onFocus'
  | 'onBlur'
> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  isDisabled?: boolean;
  size?: 'md' | 'lg';
}

const Input = React.forwardRef<React.ComponentRef<typeof UIInput.Input>, InputProps>(function Input(
  {
    label,
    error,
    leftIcon,
    rightSlot,
    isDisabled = false,
    size = 'md',
    value,
    onChangeText,
    placeholder,
    autoCapitalize,
    keyboardType,
    secureTextEntry,
    textContentType,
    onFocus,
    onBlur,
  },
  ref,
) {
  const paddingLeft = leftIcon ? 'pl-12' : 'pl-4';
  const paddingRight = rightSlot ? 'pr-12' : 'pr-4';

  return (
    <View>
      {label && (
        <Text className="mb-2 font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
          {label}
        </Text>
      )}
      <UIInput
        isDisabled={isDisabled}
        isInvalid={!!error}
        className={inputStyle({ size })}
        context={{ size }}
      >
        <UIInput.Input
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          textContentType={textContentType}
          onFocus={onFocus}
          onBlur={onBlur}
          editable={!isDisabled}
          accessibilityLabel={label}
          accessibilityState={{ disabled: isDisabled }}
          className={inputFieldStyle({ class: `${paddingLeft} ${paddingRight}` })}
        />
        {leftIcon && (
          <View
            className="absolute left-4 top-0 bottom-0 justify-center items-center"
            pointerEvents="none"
          >
            {leftIcon}
          </View>
        )}
        {rightSlot && (
          <View className="absolute right-4 top-0 bottom-0 justify-center items-center">
            {rightSlot}
          </View>
        )}
      </UIInput>
      {error && (
        <Text
          className="mt-2 text-[12px] font-body text-error-400"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {error}
        </Text>
      )}
    </View>
  );
});

export interface InputIconProps
  extends
    Omit<React.ComponentProps<typeof UIInput.Icon>, 'size'>,
    Omit<VariantProps<typeof inputIconStyle>, 'size'> {
  className?: string;
  height?: number;
  width?: number;
  size?: 'md' | 'lg' | number;
}

const InputIcon = React.forwardRef<React.ComponentRef<typeof UIInput.Icon>, InputIconProps>(
  function InputIcon({ className, size, ...props }, ref) {
    const { size: parentSize } = useStyleContext(SCOPE);

    if (typeof size === 'number') {
      return (
        <UIInput.Icon
          ref={ref}
          {...props}
          className={inputIconStyle({ class: className })}
          size={size}
        />
      );
    } else if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
      return <UIInput.Icon ref={ref} {...props} className={inputIconStyle({ class: className })} />;
    }
    return (
      <UIInput.Icon
        ref={ref}
        {...props}
        className={inputIconStyle({
          parentVariants: { size: parentSize },
          class: className,
        })}
      />
    );
  },
);

export interface InputSlotProps
  extends React.ComponentProps<typeof UIInput.Slot>, VariantProps<typeof inputSlotStyle> {
  className?: string;
}

const InputSlot = React.forwardRef<React.ComponentRef<typeof UIInput.Slot>, InputSlotProps>(
  function InputSlot({ className, ...props }, ref) {
    return <UIInput.Slot ref={ref} {...props} className={inputSlotStyle({ class: className })} />;
  },
);

export interface InputFieldProps extends React.ComponentProps<typeof UIInput.Input> {
  className?: string;
}

const InputField = React.forwardRef<React.ComponentRef<typeof UIInput.Input>, InputFieldProps>(
  function InputField({ className, ...props }, ref) {
    return <UIInput.Input ref={ref} {...props} className={inputFieldStyle({ class: className })} />;
  },
);

Input.displayName = 'Input';
InputIcon.displayName = 'InputIcon';
InputSlot.displayName = 'InputSlot';
InputField.displayName = 'InputField';

export { Input, InputField, InputIcon, InputSlot };
