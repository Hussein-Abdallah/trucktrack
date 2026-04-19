import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { DMSans_300Light, DMSans_400Regular, DMSans_500Medium } from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import { useTranslation } from 'react-i18next';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { FIRE_ORANGE } from '@/theme/colors';
import '@/lib/i18n';
import '@/global.css';

export default function App() {
  const { t } = useTranslation();
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue: BebasNeue_400Regular,
    DMSans_Light: DMSans_300Light,
    DMSans: DMSans_400Regular,
    DMSans_Medium: DMSans_500Medium,
    DMMono: DMMono_400Regular,
  });

  if (fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-background-0 px-6">
        <Text className="text-typography-950 font-body text-base text-center">
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
    <GluestackUIProvider mode="dark">
      <View className="flex-1 items-center justify-center bg-background-0 gap-6">
        <Text className="text-typography-950 font-heading text-5xl tracking-wider">
          {t('home.title')}
        </Text>
        <Text className="text-typography-500 font-body text-base">{t('home.subtitle')}</Text>
        <Pressable className="bg-primary-400 px-8 py-4 rounded-none active:bg-primary-200">
          <Text className="text-black font-mono text-sm uppercase tracking-widest">
            {t('home.followTruck')}
          </Text>
        </Pressable>
      </View>
      <StatusBar style="light" />
    </GluestackUIProvider>
  );
}
