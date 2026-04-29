import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { useAuthStore } from '@/stores/authStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;
// Watchdog: if useAuthSubscription's hydration fails silently (e.g.
// the on-signup profile trigger didn't fire and ensureRoleForVariant
// throws into setSession(null)), `session` never becomes truthy and
// the button would stay in CREATING… forever. Release busy after this
// bound and surface a generic error so the user can retry.
const HYDRATION_TIMEOUT_MS = 6000;

export default function SignupScreen() {
  const { t, i18n } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const hydrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hydrationTimerRef.current) clearTimeout(hydrationTimerRef.current);
    };
  }, []);

  // Drive the post-signup redirect off the store, not off the signUp
  // promise. signUp resolves before useAuthSubscription finishes its
  // async hydration; navigating immediately can race the gate at /
  // and bounce back here.
  //
  // Gate on roles.length > 0 so a malformed empty-roles session can't
  // loop between / and /auth/signup.
  useEffect(() => {
    if (session && session.roles.length > 0) {
      // Cancel the watchdog before navigating so the timer can't fire
      // in the brief window between replace and unmount-cleanup.
      if (hydrationTimerRef.current) {
        clearTimeout(hydrationTimerRef.current);
        hydrationTimerRef.current = null;
      }
      router.replace('/');
    }
  }, [session]);

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
      await signUp({
        email: trimmedEmail,
        password,
        role: getAppVariant(),
        language: i18n.language as AppLanguage,
        displayName: trimmedDisplayName || undefined,
      });
      // Navigation is handled by the useEffect above when session
      // hydrates. Keep busy=true on success so the button stays in
      // its CREATING… state until the redirect fires — but arm a
      // watchdog so a silently-failing trigger / hydration doesn't
      // freeze the button forever.
      hydrationTimerRef.current = setTimeout(() => {
        setGlobalError(t('routes.auth.errors.unknown'));
        setBusy(false);
      }, HYDRATION_TIMEOUT_MS);
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
