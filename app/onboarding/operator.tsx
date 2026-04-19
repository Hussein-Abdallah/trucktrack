import { useTranslation } from 'react-i18next';

import { RoutePlaceholder } from '@/components/shared/RoutePlaceholder';

export default function OperatorOnboardingScreen() {
  const { t } = useTranslation();
  return <RoutePlaceholder title={t('routes.onboarding.operator')} />;
}
