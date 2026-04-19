import { useTranslation } from 'react-i18next';

import { RoutePlaceholder } from '@/components/shared/RoutePlaceholder';

export default function SignupScreen() {
  const { t } = useTranslation();
  return <RoutePlaceholder title={t('routes.auth.signup')} />;
}
