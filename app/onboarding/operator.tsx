import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmStep } from '@/components/operator/onboarding/Confirm';
import { CoverAndDescriptionStep } from '@/components/operator/onboarding/CoverAndDescription';
import { CuisineStep } from '@/components/operator/onboarding/Cuisine';
import { FirstSavedLocationStep } from '@/components/operator/onboarding/FirstSavedLocation';
import { TruckNameStep } from '@/components/operator/onboarding/TruckName';
import { WelcomeStep } from '@/components/operator/onboarding/Welcome';
import {
  EMPTY_SAVED_LOCATION_FORM,
  validateSavedLocationForm,
  type SavedLocationFormValue,
  type ValidatedSavedLocation,
} from '@/components/operator/SavedLocationForm';
import { useCreateOperatorTruck } from '@/hooks/useCreateOperatorTruck';
import { useOperatorOnboarding } from '@/hooks/useOnboarding';
import { useOperatorTruck } from '@/hooks/useOperatorTruck';
import type { CuisineSlug } from '@/lib/cuisines';
import i18n, { type AppLanguage } from '@/lib/i18n';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';
import { APP_BLACK, FIRE_ORANGE, MID, MUTED, WARM_CREAM } from '@/theme/colors';

const TOTAL_STEPS = 6;
type Step = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Operator onboarding wizard (TT-9). Six paged steps held in internal
 * state — back/continue/skip are local navigation; the route never
 * changes until step 6 succeeds.
 *
 * Step state is in-memory only by design; cold-starting mid-flow
 * restarts at step 1. Persisting partial state to AsyncStorage is
 * over-engineering for the rare close-app-mid-onboarding case
 * (TT-43 follow-up if production data shows otherwise).
 */
export default function OperatorOnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const { markComplete } = useOperatorOnboarding();
  const createMutation = useCreateOperatorTruck();
  const userId = session?.userId;

  // Resilience for dev-seeded operators: an operator who has a trucks
  // row but lacks the AsyncStorage flag (e.g. the SQL-seeded test
  // accounts in supabase/seed.sql) shouldn't be trapped in onboarding.
  // Mark complete + redirect to Today silently. The brief spinner
  // covers the truck fetch on first mount.
  //
  // Set `autoMarkedRef` AFTER markComplete resolves so an AsyncStorage
  // write failure (rare but possible per lib/onboarding.ts comments)
  // doesn't leave the splash spinning forever. On failure we still
  // route to Today — the next launch's gate will route them right
  // back here, where this effect retries; non-blocking and recoverable.
  const truckQuery = useOperatorTruck();
  const autoMarkedRef = useRef(false);
  useEffect(() => {
    if (autoMarkedRef.current) return;
    if (!truckQuery.isSuccess || !truckQuery.data) return;
    void (async () => {
      try {
        await markComplete();
        autoMarkedRef.current = true;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[onboarding] auto-markComplete failed; routing anyway:', err);
      }
      router.replace('/(operator)/today');
    })();
  }, [truckQuery.isSuccess, truckQuery.data, markComplete, router]);

  const [step, setStep] = useState<Step>(1);
  const [language, setLanguage] = useState<AppLanguage>(
    (i18n.language as AppLanguage | undefined) === 'fr' ? 'fr' : 'en',
  );
  const [truckName, setTruckName] = useState('');
  const [cuisines, setCuisines] = useState<CuisineSlug[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [locationForm, setLocationForm] =
    useState<SavedLocationFormValue>(EMPTY_SAVED_LOCATION_FORM);
  /** Validated step-5 result. null = operator skipped step 5; only set
   *  when validateSavedLocationForm passes on Continue from step 5. */
  const [firstLocation, setFirstLocation] = useState<ValidatedSavedLocation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const goBack = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) setStep((step + 1) as Step);
  };

  const handleLocationSkip = () => {
    setFirstLocation(null);
    goNext();
  };

  const handleLocationNext = () => {
    // Step component already validates before calling onNext, but
    // re-validate here so the parent owns the parsed-values commit
    // exactly once.
    const result = validateSavedLocationForm(locationForm, t);
    if (!result.ok) return;
    setFirstLocation(result.values);
    goNext();
  };

  const handleSubmit = () => {
    if (!userId) return;
    setSubmitError(null);

    createMutation.mutate(
      {
        operatorId: userId,
        name: truckName.trim(),
        cuisineTags: cuisines.length > 0 ? [...cuisines] : undefined,
        description: description.trim().length > 0 ? description.trim() : null,
        coverUrl,
        firstLocation: firstLocation
          ? {
              name: firstLocation.name,
              locationLabel: firstLocation.locationLabel,
              lat: firstLocation.lat,
              lng: firstLocation.lng,
              defaultOpenTime: firstLocation.defaultOpenTime,
              defaultCloseTime: firstLocation.defaultCloseTime,
            }
          : undefined,
      },
      {
        onSuccess: async () => {
          // Best-effort persist of the language choice — same pattern
          // as consumer onboarding. Errors must NOT trap the operator
          // here; the AsyncStorage flag still gets set so they reach
          // Today.
          try {
            await supabase.from('profiles').update({ language }).eq('id', userId);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('[onboarding] profiles.language update failed:', err);
          }
          await markComplete();
          router.replace('/(operator)/today');
        },
        onError: () => {
          setSubmitError(t('routes.onboarding.operatorScreen.confirm.errorMessage'));
        },
      },
    );
  };

  // Splash while the truck query resolves on first mount. If the
  // operator already has a truck, the effect above redirects before
  // we render the wizard. If the query is loading we don't want to
  // flash step 1 either.
  if (truckQuery.isLoading || (truckQuery.isSuccess && truckQuery.data)) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.splash}>
          <ActivityIndicator color={FIRE_ORANGE} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
        <View style={styles.header}>
          {step > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('routes.onboarding.operatorScreen.nav.back')}
              onPress={goBack}
              style={styles.backButton}
            >
              <Feather name="chevron-left" size={20} color={WARM_CREAM} />
            </Pressable>
          ) : (
            <View style={styles.backButton} />
          )}
          <Text style={styles.stepLabel}>
            {t('routes.onboarding.operatorScreen.stepLabel', {
              current: step,
              total: TOTAL_STEPS,
            })}
          </Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.body}>{renderStep()}</View>
      </SafeAreaView>
    </>
  );

  function renderStep() {
    switch (step) {
      case 1:
        return <WelcomeStep language={language} onLanguageChange={setLanguage} onNext={goNext} />;
      case 2:
        return <TruckNameStep value={truckName} onChange={setTruckName} onNext={goNext} />;
      case 3:
        return (
          <CuisineStep
            value={cuisines}
            onChange={setCuisines}
            onNext={goNext}
            onSkip={() => {
              setCuisines([]);
              goNext();
            }}
          />
        );
      case 4:
        return userId ? (
          <CoverAndDescriptionStep
            operatorId={userId}
            coverUrl={coverUrl}
            description={description}
            onCoverChange={setCoverUrl}
            onDescriptionChange={setDescription}
            onNext={goNext}
            onSkip={() => {
              // Don't clear coverUrl on skip — operator may have
              // already uploaded; skipping here means "advance" not
              // "discard upload". They can revisit from settings later.
              goNext();
            }}
          />
        ) : null;
      case 5:
        return (
          <FirstSavedLocationStep
            value={locationForm}
            onChange={setLocationForm}
            onNext={handleLocationNext}
            onSkip={handleLocationSkip}
          />
        );
      case 6:
        return (
          <ConfirmStep
            truckName={truckName.trim()}
            cuisines={cuisines}
            description={description.trim()}
            coverUrl={coverUrl}
            firstLocation={firstLocation}
            isSubmitting={createMutation.isPending}
            errorMessage={submitError}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: APP_BLACK,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: MID,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    fontFamily: 'DMMono',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: MUTED,
  },
  body: {
    flex: 1,
  },
});
