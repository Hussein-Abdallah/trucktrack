import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/shared/EmptyState';
import { Button, ButtonText } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase';

const MIN_PASSWORD_LEN = 8;

// Supabase's reset-password emails redirect to a URL with a hash
// fragment carrying access_token + refresh_token. Our supabase client
// has detectSessionInUrl: false (RN-safe default), so we parse the
// fragment manually, push the session into the client, and let the
// user call updateUser inside that recovery-authed session.
function parseTokenFragment(url: string): { accessToken: string; refreshToken: string } | null {
  const hashIndex = url.indexOf('#');
  if (hashIndex === -1) return null;
  const params = new URLSearchParams(url.slice(hashIndex + 1));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const type = params.get('type');
  if (!accessToken || !refreshToken || type !== 'recovery') return null;
  return { accessToken, refreshToken };
}

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const [tokenStatus, setTokenStatus] = useState<'pending' | 'valid' | 'expired'>('pending');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const url = await Linking.getInitialURL();
      if (cancelled) return;
      const parsed = url ? parseTokenFragment(url) : null;
      if (!parsed) {
        // Also tolerate a session that may already be hydrated (e.g.
        // if the user was navigated here from another in-app surface).
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        setTokenStatus(data.session ? 'valid' : 'expired');
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
      });
      if (cancelled) return;
      setTokenStatus(error ? 'expired' : 'valid');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (busy) return;

    let valid = true;
    setGlobalError(null);

    if (!password || password.length < MIN_PASSWORD_LEN) {
      setPasswordError(t('routes.auth.errors.passwordTooShort'));
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (password !== confirmPassword) {
      setConfirmError(t('routes.auth.errors.passwordsMismatch'));
      valid = false;
    } else {
      setConfirmError(null);
    }

    if (!valid) return;

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setGlobalError(t('routes.auth.errors.unknown'));
        return;
      }
      // Sign out of the recovery session so the user is forced to log
      // in again with their new password — defensive against leaving
      // a recovery-scoped session hanging around.
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/auth/login');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[reset-password] updateUser failed:', err);
      setGlobalError(t('routes.auth.errors.network'));
    } finally {
      setBusy(false);
    }
  };

  if (tokenStatus === 'pending') {
    return <SafeAreaView className="flex-1 bg-background-0" />;
  }

  if (tokenStatus === 'expired') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background-0 px-6">
        <View className="gap-6">
          <EmptyState
            icon="alert-triangle"
            title={t('routes.auth.resetPassword.expiredTitle')}
            message={t('routes.auth.resetPassword.expiredMessage')}
          />
          <Button
            action="primary"
            size="lg"
            onPress={() => router.replace('/auth/forgot-password')}
          >
            <ButtonText>{t('routes.auth.resetPassword.requestNew')}</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <ScrollView
        contentContainerClassName="flex-grow gap-6 px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center gap-2 pb-4 pt-4">
          <Text className="font-heading text-5xl tracking-wider text-primary-400">TRUCKTRACK</Text>
          <Text className="font-heading text-2xl tracking-wider text-typography-950">
            {t('routes.auth.resetPassword.title')}
          </Text>
        </View>

        {globalError ? (
          <View className="border border-error-400 bg-background-50 p-4">
            <Text className="font-body text-sm text-error-400">{globalError}</Text>
          </View>
        ) : null}

        <Input
          label={t('routes.auth.resetPassword.newPasswordLabel')}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
          textContentType="newPassword"
          placeholder={t('routes.auth.passwordPlaceholder')}
          error={passwordError ?? undefined}
          isDisabled={busy}
        />

        <Input
          label={t('routes.auth.resetPassword.confirmPasswordLabel')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          secureTextEntry
          textContentType="newPassword"
          placeholder={t('routes.auth.passwordPlaceholder')}
          error={confirmError ?? undefined}
          isDisabled={busy}
        />

        <Button action="primary" size="lg" onPress={handleSubmit} isDisabled={busy}>
          <ButtonText>
            {busy
              ? t('routes.auth.resetPassword.submittingLabel')
              : t('routes.auth.resetPassword.submitLabel')}
          </ButtonText>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
