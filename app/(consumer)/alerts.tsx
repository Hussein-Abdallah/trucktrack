import { useTranslation } from 'react-i18next';

import { RoutePlaceholder } from '@/components/shared/RoutePlaceholder';

export default function AlertsScreen() {
  const { t } = useTranslation();
  return <RoutePlaceholder title={t('routes.consumer.alerts')} />;
}
