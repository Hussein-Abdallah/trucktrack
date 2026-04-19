import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { RoutePlaceholder } from '@/components/shared/RoutePlaceholder';

export default function ConsumerProfileScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerTitle: '', headerBackTitle: '' }} />
      <RoutePlaceholder title={t('routes.consumer.profile')} />
    </>
  );
}
