import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ButtonText } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAppVariant } from '@/lib/appVariant';
import type { AppLanguage } from '@/lib/i18n';
import {
  EmailAlreadyRegisteredError,
  InvalidRoleError,
  NetworkError,
  UnknownAuthError,
  signUp,
} from '@/services/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;

export default function SignupScreen() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (busy) return;

    const trimmedEmail = email.trim();
    const trimmedDisplayName = displayName.trim();
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
    } else if (password.length < MIN_PASSWORD_LEN) {
      setPasswordError(t('routes.auth.errors.passwordTooShort'));
      valid = false;
    } else {
      setPasswordError(null);
    }

    if (!valid) return;

    setBusy(true);
    try {
      // After signUp succeeds, supabase fires SIGNED_IN through
      // useAuthSubscription (since enable_confirmations = false in
      // dev), which hydrates the store. The route gate in
      // app/index.tsx then takes the user to onboarding.
      await signUp({
        email: trimmedEmail,
        password,
        role: getAppVariant(),
        language: i18n.language as AppLanguage,
        displayName: trimmedDisplayName || undefined,
      });
    } catch (err) {
      if (err instanceof EmailAlreadyRegisteredError) {
        setGlobalError(t('routes.auth.errors.emailAlreadyRegistered'));
      } else if (err instanceof NetworkError) {
        setGlobalError(t('routes.auth.errors.network'));
      } else if (err instanceof InvalidRoleError) {
        setGlobalError(t('routes.auth.errors.unknown'));
      } else if (err instanceof UnknownAuthError) {
        setGlobalError(t('routes.auth.errors.unknown'));
      } else {
        setGlobalError(t('routes.auth.errors.unknown'));
      }
    } finally {
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
            {t('routes.auth.signup.title')}
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
          textContentType="newPassword"
          placeholder={t('routes.auth.passwordPlaceholder')}
          error={passwordError ?? undefined}
          isDisabled={busy}
        />

        <Input
          label={t('routes.auth.signup.displayNameLabel')}
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
          textContentType="name"
          placeholder={t('routes.auth.signup.displayNamePlaceholder')}
          isDisabled={busy}
        />

        <Button action="primary" size="lg" onPress={handleSubmit} isDisabled={busy}>
          <ButtonText>
            {busy ? t('routes.auth.signup.submittingLabel') : t('routes.auth.signup.submitLabel')}
          </ButtonText>
        </Button>

        <View className="items-center pt-2">
          <Link href="/auth/login">
            <Text className="font-body text-sm text-typography-950">
              {t('routes.auth.signup.loginPrompt')}{' '}
              <Text className="font-body-medium text-primary-400">
                {t('routes.auth.signup.loginLink')}
              </Text>
            </Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
