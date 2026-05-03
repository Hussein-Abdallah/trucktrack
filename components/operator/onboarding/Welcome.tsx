import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { LanguageToggle } from '@/components/shared/LanguageToggle';
import { Button, ButtonText } from '@/components/ui/button';
import i18n, { type AppLanguage } from '@/lib/i18n';

interface WelcomeStepProps {
  /** Currently-selected language. Source of truth lives in the
   *  parent wizard so a back-and-forward through steps preserves the
   *  user's choice. */
  language: AppLanguage;
  onLanguageChange: (next: AppLanguage) => void;
  onNext: () => void;
}

export function WelcomeStep({ language, onLanguageChange, onNext }: WelcomeStepProps) {
  const { t } = useTranslation();

  const handleLangChange = (next: AppLanguage) => {
    onLanguageChange(next);
    // Flip i18n synchronously so the rest of the wizard re-renders in
    // the chosen language. The parent wizard owns the best-effort
    // profiles.language persist on step 6 — keeping that boundary
    // explicit avoids a network call here that doesn't need to block
    // GET STARTED.
    void i18n.changeLanguage(next);
  };

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="flex-1 items-center justify-center gap-6">
        <Text
          accessibilityRole="header"
          className="font-heading text-5xl tracking-wider text-primary-400"
        >
          {t('routes.onboarding.operatorScreen.welcome.title')}
        </Text>
        <Text className="text-center font-body text-base text-typography-950">
          {t('routes.onboarding.operatorScreen.welcome.subtitle')}
        </Text>
        <View className="mt-8 w-full gap-3">
          <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
            {t('routes.onboarding.operatorScreen.welcome.languageHeading')}
          </Text>
          <LanguageToggle value={language} onChange={handleLangChange} />
        </View>
      </View>

      <Button action="primary" size="lg" onPress={onNext}>
        <ButtonText>{t('routes.onboarding.operatorScreen.welcome.cta')}</ButtonText>
      </Button>
    </View>
  );
}
