import { Stack, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InvalidPasswordError,
  NetworkError,
  RateLimitedError,
  UnknownAccountError,
  deleteAccount,
} from '@/services/account';
import { supabase } from '@/services/supabase';

// Time the post-deletion success state stays up before we navigate
// to /auth/login. Long enough that the user sees confirmation, short
// enough that they don't sit confused.
const SUCCESS_FLASH_MS = 1500;

// Soft-cap on local password attempts. GoTrue rate-limits failed
// signInWithPassword by identity, so once a user fat-fingers enough
// times here we route them to password reset BEFORE GoTrue trips and
// locks them out of their main account too.
const MAX_PASSWORD_ATTEMPTS = 3;

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lockedOut = attemptCount >= MAX_PASSWORD_ATTEMPTS;

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const performDelete = async () => {
    setBusy(true);
    setGlobalError(null);
    setPasswordError(null);
    try {
      await deleteAccount(password);
      // Sign out locally *before* showing the success flash so the
      // user can't end up signed-in-locally-but-deleted-server-side
      // if they background the app during the flash. The flash itself
      // is just a UI delay; the live session is no longer needed.
      //
      // Swallow signOut errors: supabase-js v2 calls getSession() →
      // potentially refreshAccessToken() inside signOut even with
      // scope: 'local', and that hits the network with a now-deleted
      // user. The local AsyncStorage is cleared regardless. The post-
      // deletion auto-refresh timer in supabase-js may also fire one
      // last fetch after this returns; it's caught internally and
      // doesn't affect correctness.
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Expected after admin.deleteUser — the JWT is orphaned.
      }
      setDone(true);
      flashTimerRef.current = setTimeout(() => {
        router.replace('/');
      }, SUCCESS_FLASH_MS);
    } catch (err) {
      if (err instanceof InvalidPasswordError) {
        setAttemptCount((n) => n + 1);
        setPasswordError(t('routes.auth.deleteAccount.errors.invalidPassword'));
      } else if (err instanceof RateLimitedError) {
        setGlobalError(t('routes.auth.deleteAccount.errors.rateLimited'));
      } else if (err instanceof NetworkError) {
        setGlobalError(t('routes.auth.errors.network'));
      } else if (err instanceof UnknownAccountError) {
        setGlobalError(t('routes.auth.errors.unknown'));
      } else {
        setGlobalError(t('routes.auth.errors.unknown'));
      }
      setBusy(false);
    }
  };

  const handleSubmit = () => {
    if (busy || lockedOut) return;
    if (!password) {
      setPasswordError(t('routes.auth.errors.passwordRequired'));
      return;
    }
    Alert.alert(
      t('routes.auth.deleteAccount.confirmTitle'),
      t('routes.auth.deleteAccount.confirmMessage'),
      [
        { text: t('routes.consumer.profileScreen.cancel'), style: 'cancel' },
        {
          text: t('routes.auth.deleteAccount.confirmDelete'),
          style: 'destructive',
          onPress: () => {
            void performDelete();
          },
        },
      ],
    );
  };

  if (done) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView className="flex-1 items-center justify-center bg-background-0 px-6">
          <Text className="text-center font-heading text-3xl tracking-wider text-typography-950">
            {t('routes.auth.deleteAccount.successTitle')}
          </Text>
          <Text className="mt-3 text-center font-body text-base text-typography-500">
            {t('routes.auth.deleteAccount.successMessage')}
          </Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: '',
          title: t('routes.consumer.profileScreen.deleteAccount'),
        }}
      />
      <SafeAreaView className="flex-1 bg-background-0">
        <ScrollView
          contentContainerClassName="flex-grow gap-6 px-6 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="border border-error-400 bg-background-50 p-4">
            <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-error-400">
              {t('routes.auth.deleteAccount.warningHeading')}
            </Text>
            <Text className="mt-2 font-body text-sm text-typography-950">
              {t('routes.auth.deleteAccount.warningBody')}
            </Text>
          </View>

          {globalError ? (
            <View className="border border-error-400 bg-background-50 p-4">
              <Text className="font-body text-sm text-error-400">{globalError}</Text>
            </View>
          ) : null}

          {lockedOut ? (
            <View className="border border-warning-400 bg-background-50 p-4">
              <Text className="font-body text-sm text-typography-950">
                {t('routes.auth.deleteAccount.lockedOutMessage')}
              </Text>
              <View className="mt-3">
                <Button
                  action="secondary"
                  size="md"
                  onPress={() => router.replace('/auth/forgot-password')}
                >
                  <ButtonText>{t('routes.auth.deleteAccount.resetPasswordLink')}</ButtonText>
                </Button>
              </View>
            </View>
          ) : null}

          <Input
            label={t('routes.auth.passwordLabel')}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            secureTextEntry
            textContentType="password"
            placeholder={t('routes.auth.passwordPlaceholder')}
            error={passwordError ?? undefined}
            isDisabled={busy || lockedOut}
          />

          <Button action="danger" size="lg" onPress={handleSubmit} isDisabled={busy || lockedOut}>
            <ButtonText>
              {busy
                ? t('routes.auth.deleteAccount.submittingLabel')
                : t('routes.auth.deleteAccount.submitLabel')}
            </ButtonText>
          </Button>

          <View className="items-center pt-2">
            <Button action="secondary" size="md" onPress={() => router.back()} isDisabled={busy}>
              <ButtonText>{t('routes.auth.deleteAccount.cancel')}</ButtonText>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
