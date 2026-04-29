import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  EmailAlreadyRegisteredError,
  NetworkError,
  UnknownAuthError,
  signIn,
} from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Drive the post-login redirect off the store, not off the signIn
  // promise. signInWithPassword resolves before useAuthSubscription
  // finishes its async hydration (await fetchProfileRoles +
  // ensureRoleForVariant). If we replace('/') immediately on resolve,
  // the gate at / sees a still-null session and bounces back here.
  // Watching session means we navigate exactly when hydration lands —
  // race-proof across cold-start with cached session and fresh login.
  useEffect(() => {
    if (session) {
      router.replace('/');
    }
  }, [session]);

  const handleSubmit = async () => {
    if (busy) return;

    const trimmedEmail = email.trim();
    let valid = true;
    setGlobalError(null);

    if (!trimmedEmail) {
      setEmailError(t('routes.auth.errors.emailRequired'));
      valid = false;
    } else if (!EMAIL_RE.test(trimmedEmail)) {
      setEmailError(t('routes.auth.errors.emailInvalid'));
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError(t('routes.auth.errors.passwordRequired'));
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!valid) return;

    setBusy(true);
    try {
      await signIn({ email: trimmedEmail, password });
      // Navigation is handled by the useEffect above when session
      // hydrates. Keep busy=true on success so the button stays in
      // its SIGNING IN… state until the redirect fires.
    } catch (err) {
      if (err instanceof NetworkError) {
        setGlobalError(t('routes.auth.errors.network'));
      } else if (err instanceof EmailAlreadyRegisteredError) {
        // Shouldn't trip on signIn but the typed error exists; treat
        // as invalid creds so we don't leak account-existence info.
        setGlobalError(t('routes.auth.errors.invalidCredentials'));
      } else if (err instanceof UnknownAuthError) {
        // Supabase returns this for bad-creds among other things.
        setGlobalError(t('routes.auth.errors.invalidCredentials'));
      } else {
        setGlobalError(t('routes.auth.errors.unknown'));
      }
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView
        contentContainerClassName="flex-grow gap-6 px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-2 pb-4 pt-4">
          <Text className="font-heading text-5xl tracking-wider text-primary-400">TRUCKTRACK</Text>
          <Text className="font-heading text-2xl tracking-wider text-typography-950">
            {t('routes.auth.login.title')}
          </Text>
        </View>

        {globalError ? (
          <View className="border border-error-400 bg-background-50 p-4">
            <Text className="font-body text-sm text-error-400">{globalError}</Text>
          </View>
        ) : null}

        <Input
          label={t('routes.auth.emailLabel')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          placeholder={t('routes.auth.emailPlaceholder')}
          error={emailError ?? undefined}
          isDisabled={busy}
        />

        <Input
          label={t('routes.auth.passwordLabel')}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
          textContentType="password"
          placeholder={t('routes.auth.passwordPlaceholder')}
          error={passwordError ?? undefined}
          isDisabled={busy}
        />

        <Button action="primary" size="lg" onPress={handleSubmit} isDisabled={busy}>
          <ButtonText>
            {busy ? t('routes.auth.submittingLabel') : t('routes.auth.submitLabel')}
          </ButtonText>
        </Button>

        <View className="items-center gap-4 pt-2">
          <Link href="/auth/forgot-password">
            <Text className="font-mono text-xs uppercase tracking-[1.5px] text-typography-500">
              {t('routes.auth.forgotPasswordLink')}
            </Text>
          </Link>
          <Link href="/auth/signup">
            <Text className="font-body text-sm text-typography-950">
              {t('routes.auth.signupPrompt')}{' '}
              <Text className="font-body-medium text-primary-400">
                {t('routes.auth.signupLink')}
              </Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
