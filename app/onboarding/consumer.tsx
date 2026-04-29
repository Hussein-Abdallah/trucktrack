import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Button, ButtonText } from '@/components/ui/button';
import { useConsumerOnboarding } from '@/hooks/useOnboarding';
import i18n, { type AppLanguage } from '@/lib/i18n';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useLocationStore } from '@/stores/locationStore';
import { FIRE_ORANGE, MUTED } from '@/theme/colors';

const ICON_SIZE = 28;

export default function ConsumerOnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const permissionStatus = useLocationStore((state) => state.permissionStatus);
  const requestPermission = useLocationStore((state) => state.requestPermission);
  const { markComplete } = useConsumerOnboarding();

  const [lang, setLang] = useState<AppLanguage>(
    (i18n.language as AppLanguage | undefined) === 'fr' ? 'fr' : 'en',
  );
  const [busy, setBusy] = useState(false);

  const handleLangChange = (next: AppLanguage) => {
    setLang(next);
    void i18n.changeLanguage(next);
  };

  const handleAllowLocation = () => {
    void requestPermission();
  };

  const handleContinue = async () => {
    if (busy) return;
    setBusy(true);
    // Best-effort profile update. Errors here (no real auth session
    // under the dev shortcut, transient network blip, RLS denial) must
    // not trap the user on onboarding — the AsyncStorage flag still
    // gets set so they reach the map. Real signup metadata persists
    // language at signup time (TT-13 trigger), so this update is the
    // "user changed their mind during onboarding" path.
    if (session?.userId) {
      try {
        await supabase.from('profiles').update({ language: lang }).eq('id', session.userId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[onboarding] profiles.language update failed:', err);
      }
    }
    await markComplete();
    router.replace('/(consumer)');
  };

  const locationGranted = permissionStatus === 'granted';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-background-0">
        <ScrollView contentContainerClassName="flex-grow gap-8 px-6 py-8">
          <View className="items-center gap-2">
            <Text
              accessibilityRole="header"
              className="font-heading text-5xl tracking-wider text-primary-400"
            >
              TRUCKTRACK
            </Text>
            <Text className="text-center font-body text-base text-typography-950">
              {t('onboarding.tagline')}
            </Text>
          </View>

          <View className="gap-3">
            <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
              {t('onboarding.language.heading')}
            </Text>
            <LanguageToggle value={lang} onChange={handleLangChange} />
          </View>

          <View className="gap-3">
            <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
              {t('onboarding.location.heading')}
            </Text>
            <View className="border border-outline-100 bg-background-50 p-4">
              <View className="mb-3 flex-row items-center gap-3">
                <Feather
                  name="map-pin"
                  size={ICON_SIZE}
                  color={locationGranted ? FIRE_ORANGE : MUTED}
                />
                <Text className="flex-1 font-body text-sm text-typography-950">
                  {t('onboarding.location.description')}
                </Text>
              </View>
              <Button
                action={locationGranted ? 'secondary' : 'primary'}
                size="md"
                onPress={handleAllowLocation}
                isDisabled={locationGranted}
                accessibilityLabel={
                  locationGranted
                    ? t('onboarding.location.allowed')
                    : t('onboarding.location.allow')
                }
              >
                <ButtonText>
                  {locationGranted
                    ? t('onboarding.location.allowed')
                    : t('onboarding.location.allow')}
                </ButtonText>
              </Button>
            </View>
          </View>
        </ScrollView>

        <View className="px-6 pb-6">
          <Button action="primary" size="lg" onPress={handleContinue} isDisabled={busy}>
            <ButtonText>{t('onboarding.continue')}</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    </>
  );
}
