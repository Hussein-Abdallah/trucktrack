import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { RoutePlaceholder } from '@/components/shared/RoutePlaceholder';

// Placeholder until TT-54 ships the real account-deletion confirmation
// flow. TT-52 lands the entry point on the consumer profile screen so
// the nav target needs to exist; the screen itself is owned by TT-54.
export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerBackTitle: '', title: '' }} />
      <RoutePlaceholder title={t('routes.consumer.profileScreen.deleteAccount')} />
    </>
  );
}
