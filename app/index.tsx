import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useConsumerOnboarding } from '@/hooks/useOnboarding';
import { getAppVariant } from '@/lib/appVariant';
import { useAuthStore } from '@/stores/authStore';
import { FIRE_ORANGE } from '@/theme/colors';

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const isResolving = useAuthStore((state) => state.isResolving);
  const signOut = useAuthStore((state) => state.signOut);
  // Onboarding flag lives in AsyncStorage; resolve it in parallel with
  // the auth store so the splash spinner covers both reads in one shot.
  const { resolved: onbResolved, complete: onbComplete } = useConsumerOnboarding();
  const { t } = useTranslation();
  const variant = getAppVariant();

  if (isResolving || !onbResolved) {
    return (
      <View className="flex-1 items-center justify-center bg-background-0">
        <ActivityIndicator color={FIRE_ORANGE} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/auth/login" />;
  }

  // profiles.roles is CHECK-constrained to be non-empty at the DB level
  // (TT-13 migration), but TypeScript sees Profile['roles'] as a plain
  // array. Treat any empty-roles session as broken and force re-auth
  // rather than risking an undefined role downstream.
  if (session.roles.length === 0) {
    return <Redirect href="/auth/login" />;
  }

  if (!session.roles.includes(variant)) {
    const signedInRole = session.roles[0];
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background-0 px-6">
        <Text className="font-heading text-4xl tracking-wider text-typography-950">
          {t('routes.auth.wrongApp.title')}
        </Text>
        <Text className="text-center font-body text-base text-typography-500">
          {t('routes.auth.wrongApp.message', {
            variant: t(`routes.auth.wrongApp.variant.${variant}`),
            role: t(`routes.auth.wrongApp.role.${signedInRole}`),
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
    // Operator-side onboarding is TT-9 — until then the operator goes
    // straight to /today on every launch, matching today's behaviour.
    return <Redirect href="/(operator)/today" />;
  }

  // Consumer first-launch flow: route through onboarding once. After
  // markComplete() lands the flag, subsequent launches skip this branch.
  if (!onbComplete) {
    return <Redirect href="/onboarding/consumer" />;
  }

  return <Redirect href="/(consumer)" />;
}
