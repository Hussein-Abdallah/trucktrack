import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Deep-link target — see CLAUDE.md app variant pattern. The trucktrack
// scheme is registered for both consumer + operator builds; recovery
// emails land on either app and route to /auth/reset-password.
const REDIRECT_URL = 'trucktrack://auth/reset-password';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (busy) return;

    const trimmedEmail = email.trim();
    setGlobalError(null);

    if (!trimmedEmail) {
      setEmailError(t('routes.auth.errors.emailRequired'));
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setEmailError(t('routes.auth.errors.emailInvalid'));
      return;
    }
    setEmailError(null);

    setBusy(true);
    try {
      // Anti-enumeration: ALWAYS flip to the success view, regardless
      // of outcome. Supabase already responds the same for known and
      // unknown emails; we additionally swallow network/server errors
      // here so an attacker can't replay-and-compare error UI to
      // detect registered addresses. The user re-tries via "Request
      // new link" if the email never arrives.
      await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: REDIRECT_URL,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[forgot-password] resetPasswordForEmail failed:', err);
    } finally {
      setSent(true);
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
            {t('routes.auth.forgotPassword.title')}
          </Text>
        </View>

        {sent ? (
          <View className="gap-6">
            <View className="border border-outline-100 bg-background-50 p-4">
              <Text className="font-body text-base text-typography-950">
                {t('routes.auth.forgotPassword.sentMessage')}
              </Text>
            </View>
            <Link href="/auth/login" asChild>
              <Button action="secondary" size="lg">
                <ButtonText>{t('routes.auth.forgotPassword.backToLogin')}</ButtonText>
              </Button>
            </Link>
          </View>
        ) : (
          <>
            {globalError ? (
              <View className="border border-error-400 bg-background-50 p-4">
                <Text className="font-body text-sm text-error-400">{globalError}</Text>
              </View>
            ) : null}

            <Text className="font-body text-base text-typography-500">
              {t('routes.auth.forgotPassword.body')}
            </Text>

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

            <Button action="primary" size="lg" onPress={handleSubmit} isDisabled={busy}>
              <ButtonText>
                {busy
                  ? t('routes.auth.forgotPassword.submittingLabel')
                  : t('routes.auth.forgotPassword.submitLabel')}
              </ButtonText>
            </Button>

            <View className="items-center pt-2">
              <Link href="/auth/login">
                <Text className="font-mono text-xs uppercase tracking-[1.5px] text-typography-500">
                  {t('routes.auth.forgotPassword.backToLogin')}
                </Text>
              </Link>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
