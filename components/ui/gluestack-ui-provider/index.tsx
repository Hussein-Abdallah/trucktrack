/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';
import { useColorScheme } from 'nativewind';

import { config } from './config';

export type ModeType = 'light' | 'dark' | 'system';

interface GluestackUIProviderProps {
  mode?: ModeType;
  children?: React.ReactNode;
  style?: ViewProps['style'];
}

export function GluestackUIProvider({ mode = 'dark', ...props }: GluestackUIProviderProps) {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  return (
    <View
      style={[
        config[colorScheme ?? 'dark'],
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}
    >
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
