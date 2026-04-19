import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { RoutePlaceholder } from '@/components/shared/RoutePlaceholder';

export default function OperatorSettingsScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, headerBackTitle: '' }} />
      <RoutePlaceholder title={t('routes.operator.settings')} />
    </>
  );
}
