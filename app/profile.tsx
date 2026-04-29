import { Feather } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Button, ButtonText } from '@/components/ui/button';
import i18n, { type AppLanguage } from '@/lib/i18n';
import { fetchProfile, updateProfileLanguage } from '@/services/profile';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { FIRE_ORANGE, MUTED } from '@/theme/colors';

export default function ConsumerProfileScreen() {
  const { t } = useTranslation();
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);

  const [email, setEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [lang, setLang] = useState<AppLanguage>(
    (i18n.language as AppLanguage | undefined) === 'fr' ? 'fr' : 'en',
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busyLang, setBusyLang] = useState(false);

  // Sign-out redirect: this screen lives at /profile (route root), not
  // under (consumer)/, so the consumer-layout auth gate doesn't cover
  // it. Without this, signing out leaves the user staring at a stale
  // profile screen with a working delete-account row pointing into a
  // post-signout flow. router.replace('/') hands control back to the
  // root gate which routes to /auth/login when session is null.
  useEffect(() => {
    if (!session) {
      router.replace('/');
    }
  }, [session]);

  const userId = session?.userId;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      try {
        // getSession() reads the cached JWT (no network round-trip).
        // We're displaying the user's own already-authed email, not
        // making a privilege decision, so the cached value is safe.
        const [sessionRes, profile] = await Promise.all([
          supabase.auth.getSession(),
          fetchProfile(userId),
        ]);
        if (cancelled) return;
        setEmail(sessionRes.data.session?.user.email ?? null);
        if (profile) {
          setDisplayName(profile.display_name);
          setLang(profile.language);
          if (profile.language !== i18n.language) {
            void i18n.changeLanguage(profile.language);
          }
        }
        setStatus('ready');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[profile] fetch failed:', err);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleLangChange = async (next: AppLanguage) => {
    if (busyLang || !session || next === lang) return;
    setBusyLang(true);
    const previous = lang;
    setLang(next);
    void i18n.changeLanguage(next);
    try {
      await updateProfileLanguage(session.userId, next);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[profile] updateProfileLanguage failed:', err);
      // Roll back so the toggle reflects what's actually persisted.
      setLang(previous);
      void i18n.changeLanguage(previous);
    } finally {
      setBusyLang(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('routes.consumer.profileScreen.signOutConfirmTitle'),
      t('routes.consumer.profileScreen.signOutConfirmMessage'),
      [
        { text: t('routes.consumer.profileScreen.cancel'), style: 'cancel' },
        {
          text: t('routes.auth.signOut'),
          style: 'destructive',
          onPress: () => {
            void signOut();
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    router.push('/auth/delete-account');
  };

  if (status === 'loading') {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: true, headerBackTitle: '', title: t('routes.consumer.profile') }}
        />
        <SafeAreaView className="flex-1 items-center justify-center bg-background-0">
          <ActivityIndicator color={FIRE_ORANGE} size="large" />
        </SafeAreaView>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <Stack.Screen
          options={{ headerShown: true, headerBackTitle: '', title: t('routes.consumer.profile') }}
        />
        <SafeAreaView className="flex-1 bg-background-0 px-6 py-8">
          <Text className="mb-6 font-body text-base text-error-400">
            {t('routes.consumer.profileScreen.loadError')}
          </Text>
          <Button action="primary" size="lg" onPress={handleSignOut}>
            <ButtonText>{t('routes.auth.signOut')}</ButtonText>
          </Button>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, headerBackTitle: '', title: t('routes.consumer.profile') }}
      />
      <SafeAreaView className="flex-1 bg-background-0">
        <ScrollView contentContainerClassName="flex-grow gap-8 px-6 py-8">
          <View className="gap-1 border border-outline-100 bg-background-50 p-4">
            <Text className="font-heading text-2xl tracking-wider text-typography-950">
              {displayName ?? t('routes.consumer.profileScreen.displayNameFallback')}
            </Text>
            <Text className="font-body text-sm text-typography-500">{email ?? '—'}</Text>
          </View>

          <View className="gap-3">
            <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
              {t('onboarding.language.heading')}
            </Text>
            <LanguageToggle value={lang} onChange={handleLangChange} disabled={busyLang} />
          </View>

          <View className="gap-3">
            <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
              {t('routes.consumer.profileScreen.accountHeading')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('routes.consumer.profileScreen.deleteAccount')}
              onPress={handleDeleteAccount}
              className="flex-row items-center justify-between border border-outline-100 bg-background-50 px-4 py-4 active:bg-background-100"
            >
              <Text className="font-body text-base text-typography-950">
                {t('routes.consumer.profileScreen.deleteAccount')}
              </Text>
              <Feather name="chevron-right" size={18} color={MUTED} />
            </Pressable>
          </View>

          <Button action="primary" size="lg" onPress={handleSignOut}>
            <ButtonText>{t('routes.auth.signOut')}</ButtonText>
          </Button>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
