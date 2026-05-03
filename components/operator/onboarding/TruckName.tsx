import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TruckNameStepProps {
  value: string;
  onChange: (next: string) => void;
  onNext: () => void;
}

const MAX_NAME = 80;

export function TruckNameStep({ value, onChange, onNext }: TruckNameStepProps) {
  const { t } = useTranslation();

  const trimmed = value.trim();
  const tooLong = trimmed.length > MAX_NAME;
  const valid = trimmed.length > 0 && !tooLong;

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="flex-1 gap-6">
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            className="font-heading text-4xl tracking-wider text-typography-950"
          >
            {t('routes.onboarding.operatorScreen.truckName.title')}
          </Text>
          <Text className="font-body text-base text-typography-500">
            {t('routes.onboarding.operatorScreen.truckName.subtitle')}
          </Text>
        </View>

        <Input
          label={t('routes.onboarding.operatorScreen.truckName.label')}
          value={value}
          onChangeText={onChange}
          placeholder={t('routes.onboarding.operatorScreen.truckName.placeholder')}
          autoCapitalize="words"
          size="lg"
          error={
            tooLong ? t('routes.onboarding.operatorScreen.truckName.errors.tooLong') : undefined
          }
        />
      </View>

      <Button action="primary" size="lg" onPress={onNext} isDisabled={!valid}>
        <ButtonText>{t('routes.onboarding.operatorScreen.nav.continue')}</ButtonText>
      </Button>
    </View>
  );
}
