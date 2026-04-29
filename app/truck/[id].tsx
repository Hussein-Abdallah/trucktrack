import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/shared/EmptyState';
import { TodayScheduleSection } from '@/components/truck/TodayScheduleSection';
import { TruckHero } from '@/components/truck/TruckHero';
import { TruckProfileSkeleton } from '@/components/truck/TruckProfileSkeleton';
import { Button, ButtonText } from '@/components/ui/button';
import { useTruckProfile } from '@/hooks/useTruckProfile';
import { deriveIsOpen } from '@/lib/schedule';
import { APP_BLACK_SCRIM, WARM_CREAM } from '@/theme/colors';

const BACK_BUTTON_SIZE = 40;
const BACK_ICON_SIZE = 22;

export default function TruckProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, refetch } = useTruckProfile(id);

  // canGoBack is false on direct deep-link / cold-start access,
  // where router.back() would silently no-op. Fall back to the
  // consumer map so the user always has a way out.
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(consumer)');
  };

  return (
    <>
      {/* Hero owns the top of the screen — hide the Stack header so the
          image bleeds under the status bar; render a floating back
          chevron below. */}
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-background-0">
        {renderBody({
          isPending,
          isError,
          data,
          onRetry: refetch,
          onBack: handleBack,
        })}
        {/* Floating back chevron is rendered for every state so the user
            always has an exit. Only the loading skeleton hides it (no
            need — it transitions out fast). */}
        {!isPending ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={handleBack}
            style={[styles.backButton, { top: insets.top + 8 }]}
          >
            <Feather name="chevron-left" size={BACK_ICON_SIZE} color={WARM_CREAM} />
          </Pressable>
        ) : null}
      </View>
    </>
  );
}

interface RenderBodyArgs {
  isPending: boolean;
  isError: boolean;
  data: ReturnType<typeof useTruckProfile>['data'];
  onRetry: () => void;
  onBack: () => void;
}

function renderBody({ isPending, isError, data, onRetry, onBack }: RenderBodyArgs) {
  if (isPending) return <TruckProfileSkeleton />;
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (!data) return <NotFoundState onBack={onBack} />;
  // TT-46 ships the visible profile UI. TT-47 will add the concept
  // block + a11y pass and refine the skeleton to match this layout.
  // Pass the first schedule into deriveIsOpen for the hero badge —
  // schedules are sorted by open_time asc, and deriveIsOpen only
  // returns true for the row whose status is 'live' AND clock is in
  // the open/close window, so checking the first row reads correctly
  // across single- and multi-shift days alike.
  const heroIsOpen = deriveIsOpen(data.todaySchedules[0] ?? null);
  return (
    <ScrollView className="flex-1 bg-background-0" contentContainerStyle={styles.scrollContent}>
      <TruckHero truck={data.truck} isOpen={heroIsOpen} />
      <TodayScheduleSection schedules={data.todaySchedules} />
    </ScrollView>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-6 px-6">
      <EmptyState
        icon="wifi-off"
        title={t('truck.profile.error.title')}
        message={t('truck.profile.error.message')}
      />
      <Button action="primary" size="lg" onPress={onRetry}>
        <ButtonText>{t('truck.profile.error.retry')}</ButtonText>
      </Button>
    </View>
  );
}

interface NotFoundStateProps {
  onBack: () => void;
}

function NotFoundState({ onBack }: NotFoundStateProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 items-center justify-center gap-6 px-6">
      <EmptyState
        icon="compass"
        title={t('truck.profile.notFound.title')}
        message={t('truck.profile.notFound.message')}
      />
      <Button action="secondary" size="lg" onPress={onBack}>
        <ButtonText>{t('truck.profile.notFound.back')}</ButtonText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    left: 16,
    width: BACK_BUTTON_SIZE,
    height: BACK_BUTTON_SIZE,
    borderRadius: BACK_BUTTON_SIZE / 2,
    backgroundColor: APP_BLACK_SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },
});
