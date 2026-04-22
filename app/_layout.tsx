import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';
import { DMSans_300Light, DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import '@/lib/i18n';
import { queryClient } from '@/services/queryClient';
import { APP_BLACK, FIRE_ORANGE, WARM_CREAM } from '@/theme/colors';

export default function RootLayout() {
  const { t } = useTranslation();
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    DMSans_Light: DMSans_300Light,
    DMSans: DMSans_400Regular,
    DMSans_Medium: DMSans_500Medium,
    DMMono: DMMono_400Regular,
    DMMono_Medium: DMMono_500Medium,
  });

  if (fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-background-0 px-6">
        <Text className="text-center font-body text-base text-typography-950">
          {t('fonts.loadError')}
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background-0">
        <ActivityIndicator color={FIRE_ORANGE} size="large" />
      </View>
    );
  }

  return (
    // GestureHandlerRootView wraps the entire app so @gorhom/bottom-sheet
    // (and any future gesture-driven UI) can install pan responders. RN
    // gesture-handler 2.x requires this at the root or gestures silently
    // fail to fire on Android — iOS is more forgiving but inconsistent.
    <GestureHandlerRootView style={rootStyle}>
      <QueryClientProvider client={queryClient}>
        <GluestackUIProvider mode="dark">
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: APP_BLACK },
              headerStyle: { backgroundColor: APP_BLACK },
              headerTintColor: WARM_CREAM,
              headerTitleStyle: { color: WARM_CREAM },
              headerShadowVisible: false,
              headerTitle: '',
            }}
          />
          <StatusBar style="light" />
        </GluestackUIProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const rootStyle = { flex: 1 };
