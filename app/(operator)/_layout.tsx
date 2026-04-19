import { Feather } from '@expo/vector-icons';
import { Redirect, Tabs, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { useAuthStore } from '@/stores/authStore';
import { MID, WARM_CREAM } from '@/theme/colors';

function SettingsHeaderButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push('/settings')}
      accessibilityRole="button"
      accessibilityLabel={t('routes.operator.settings')}
      className="mr-4 h-9 w-9 items-center justify-center rounded-full border active:opacity-60"
      style={{ borderColor: MID }}
    >
      <Feather name="settings" size={18} color={WARM_CREAM} />
    </Pressable>
  );
}

export default function OperatorLayout() {
  const session = useAuthStore((state) => state.session);
  const { t } = useTranslation();

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (session.role !== 'operator') {
    return <Redirect href="/(consumer)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerTitle: '',
        headerRight: () => <SettingsHeaderButton />,
      }}
    >
      <Tabs.Screen name="today" options={{ title: t('routes.operator.today') }} />
      <Tabs.Screen name="schedule" options={{ title: t('routes.operator.schedule') }} />
      <Tabs.Screen name="analytics" options={{ title: t('routes.operator.analytics') }} />
      <Tabs.Screen name="catering" options={{ title: t('routes.operator.catering') }} />
    </Tabs>
  );
}
