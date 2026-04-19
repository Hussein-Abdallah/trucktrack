import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { RoutePlaceholder } from '@/components/shared/RoutePlaceholder';

export default function TruckProfileScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <RoutePlaceholder title={t('routes.truck.profile')} subtitle={t('routes.truck.idLabel', { id })} />
  );
}
