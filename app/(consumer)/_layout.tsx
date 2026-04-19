import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { MID, WARM_CREAM } from '@/theme/colors';

function AvatarHeaderButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel={t('routes.consumer.profile')}
      className="mr-4 h-9 w-9 items-center justify-center rounded-full border active:opacity-60"
      style={{ borderColor: MID }}
    >
      <Feather name="user" size={18} color={WARM_CREAM} />
    </Pressable>
  );
}

export default function ConsumerLayout() {
  const session = useAuthStore((state) => state.session);
  const { t } = useTranslation();

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (session.role !== 'consumer') {
    return <Redirect href="/(operator)/today" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerTitle: '',
        headerRight: () => <AvatarHeaderButton />,
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('routes.consumer.map') }} />
      <Tabs.Screen name="following" options={{ title: t('routes.consumer.following') }} />
      <Tabs.Screen name="stamps" options={{ title: t('routes.consumer.stamps') }} />
      <Tabs.Screen name="alerts" options={{ title: t('routes.consumer.alerts') }} />
    </Tabs>
  );
}
