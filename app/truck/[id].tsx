import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { EmptyState } from '@/components/shared/EmptyState';
import { TruckProfileSkeleton } from '@/components/truck/TruckProfileSkeleton';
import { Button, ButtonText } from '@/components/ui/button';
import { useTruckProfile } from '@/hooks/useTruckProfile';

export default function TruckProfileScreen() {
  const router = useRouter();
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
      <Stack.Screen options={{ headerShown: true, headerBackTitle: '' }} />
      <View className="flex-1 bg-background-0">
        {renderBody({
          isPending,
          isError,
          data,
          onRetry: refetch,
          onBack: handleBack,
        })}
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
  // TT-45 proves the hook end-to-end. TT-46 replaces this with the
  // hero + cuisine + schedule section; TT-47 adds the concept block
  // + a11y pass and refines the skeleton.
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="font-heading text-4xl tracking-wider text-typography-950">
        {data.truck.name}
      </Text>
    </View>
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
