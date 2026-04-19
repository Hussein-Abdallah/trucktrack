import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { getAppVariant } from '@/lib/appVariant';
import { useAuthStore } from '@/stores/authStore';

// TODO(TT-11/TT-13): replace dev role-toggle with real Supabase email/OAuth login.
export default function LoginScreen() {
  const { t } = useTranslation();
  const signInAs = useAuthStore((state) => state.signInAs);
  const variant = getAppVariant();
  const devButtonKey =
    variant === 'operator' ? 'routes.auth.devSignInOperator' : 'routes.auth.devSignInConsumer';

  const handleSignIn = () => {
    signInAs(variant);
    router.replace('/');
  };

  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background-0 px-6">
      <Text className="font-heading text-4xl tracking-wider text-typography-950">
        {t('routes.auth.login')}
      </Text>
      <Text className="font-mono text-xs uppercase tracking-widest text-typography-500">
        {t('routes.auth.devHeader')}
      </Text>
      <Pressable
        className="rounded-none bg-primary-400 px-8 py-4 active:bg-primary-200"
        onPress={handleSignIn}
      >
        <Text className="font-mono text-sm uppercase tracking-widest text-typography-950">
          {t(devButtonKey)}
        </Text>
      </Pressable>
    </View>
  );
}
