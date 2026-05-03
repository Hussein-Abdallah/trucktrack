import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import {
  SavedLocationForm,
  validateSavedLocationForm,
  type SavedLocationFormErrors,
  type SavedLocationFormValue,
} from '@/components/operator/SavedLocationForm';
import { Button, ButtonText } from '@/components/ui/button';

interface FirstSavedLocationStepProps {
  value: SavedLocationFormValue;
  onChange: (next: SavedLocationFormValue) => void;
  onNext: () => void;
  onSkip: () => void;
}

export function FirstSavedLocationStep({
  value,
  onChange,
  onNext,
  onSkip,
}: FirstSavedLocationStepProps) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<SavedLocationFormErrors>({});

  const handleNext = () => {
    const result = validateSavedLocationForm(value, t);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onNext();
  };

  const handleChange = (next: SavedLocationFormValue) => {
    onChange(next);
    setErrors({});
  };

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="flex-1 gap-6">
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            className="font-heading text-4xl tracking-wider text-typography-950"
          >
            {t('routes.onboarding.operatorScreen.firstLocation.title')}
          </Text>
          <Text className="font-body text-base text-typography-500">
            {t('routes.onboarding.operatorScreen.firstLocation.subtitle')}
          </Text>
        </View>

        <ScrollView contentContainerClassName="pb-4" keyboardShouldPersistTaps="handled">
          <SavedLocationForm value={value} errors={errors} onChange={handleChange} />
        </ScrollView>
      </View>

      <View className="gap-3">
        <Button action="primary" size="lg" onPress={handleNext}>
          <ButtonText>{t('routes.onboarding.operatorScreen.nav.continue')}</ButtonText>
        </Button>
        <Button action="ghost" size="md" onPress={onSkip}>
          <ButtonText>{t('routes.onboarding.operatorScreen.firstLocation.skip')}</ButtonText>
        </Button>
      </View>
    </View>
  );
}
