import { Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useConsumerOnboarding, useOperatorOnboarding } from '@/hooks/useOnboarding';
import { getAppVariant } from '@/lib/appVariant';
import { useAuthStore } from '@/stores/authStore';
import { FIRE_ORANGE } from '@/theme/colors';

export default function Index() {
  const session = useAuthStore((state) => state.session);
  const isResolving = useAuthStore((state) => state.isResolving);
  const signOut = useAuthStore((state) => state.signOut);
  // Both onboarding flags resolve from AsyncStorage; the splash
  // spinner waits on the variant-relevant one. Calling both hooks
  // unconditionally keeps the hook order stable across re-renders;
  // the flag we don't care about for the current variant just
  // resolves quietly in the background.
  const { resolved: consumerOnbResolved, complete: consumerOnbComplete } = useConsumerOnboarding();
  const { resolved: operatorOnbResolved, complete: operatorOnbComplete } = useOperatorOnboarding();
  const { t } = useTranslation();
  const variant = getAppVariant();

  const onbResolved = variant === 'operator' ? operatorOnbResolved : consumerOnbResolved;

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
    // First-launch operator flow: route through TT-9's wizard once.
    // The wizard's CREATE TRUCK step lands the AsyncStorage flag, so
    // subsequent launches skip this branch.
    if (!operatorOnbComplete) {
      return <Redirect href="/onboarding/operator" />;
    }
    return <Redirect href="/(operator)/today" />;
  }

  // Consumer first-launch flow: route through onboarding once. After
  // markComplete() lands the flag, subsequent launches skip this branch.
  if (!consumerOnbComplete) {
    return <Redirect href="/onboarding/consumer" />;
  }

  return <Redirect href="/(consumer)" />;
}
