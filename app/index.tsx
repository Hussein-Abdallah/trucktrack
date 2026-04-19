import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { getAppVariant } from '@/lib/appVariant';
import { useAuthStore } from '@/stores/authStore';
import { FIRE_ORANGE } from '@/theme/colors';

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const isResolving = useAuthStore((state) => state.isResolving);
  const signOut = useAuthStore((state) => state.signOut);
  const { t } = useTranslation();
  const variant = getAppVariant();

  if (isResolving) {
    return (
      <View className="flex-1 items-center justify-center bg-background-0">
        <ActivityIndicator color={FIRE_ORANGE} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  if (session.role !== variant) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background-0 px-6">
        <Text className="font-heading text-4xl tracking-wider text-typography-950">
          {t('routes.auth.wrongApp.title')}
        </Text>
        <Text className="text-center font-body text-base text-typography-500">
          {t('routes.auth.wrongApp.message', {
            variant: t(`routes.auth.wrongApp.variant.${variant}`),
            role: t(`routes.auth.wrongApp.role.${session.role}`),
          })}
        </Text>
        <Pressable
          className="rounded-none bg-primary-400 px-8 py-4 active:bg-primary-200"
          onPress={signOut}
        >
          <Text className="font-mono text-sm uppercase tracking-widest text-typography-950">
            {t('routes.auth.signOut')}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (variant === 'operator') {
    return <Redirect href="/(operator)/today" />;
  }

  return <Redirect href="/(consumer)" />;
}
