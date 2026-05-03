import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ButtonText } from '@/components/ui/button';
import type { CuisineSlug } from '@/lib/cuisines';
import type { ValidatedSavedLocation } from '@/components/operator/SavedLocationForm';
import { CHARCOAL, MID } from '@/theme/colors';

interface ConfirmStepProps {
  truckName: string;
  cuisines: CuisineSlug[];
  description: string;
  coverUrl: string | null;
  /** Already validated by the FirstSavedLocation step, or null if
   *  skipped. */
  firstLocation: ValidatedSavedLocation | null;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: () => void;
}

export function ConfirmStep({
  truckName,
  cuisines,
  description,
  coverUrl,
  firstLocation,
  isSubmitting,
  errorMessage,
  onSubmit,
}: ConfirmStepProps) {
  const { t } = useTranslation();

  const cuisinesDisplay =
    cuisines.length > 0
      ? cuisines.map((slug) => t(`cuisines.${slug}`)).join(', ')
      : t('routes.onboarding.operatorScreen.confirm.noneSelected');

  const descriptionDisplay =
    description.trim().length > 0
      ? description
      : t('routes.onboarding.operatorScreen.confirm.noneSelected');

  const locationDisplay = firstLocation
    ? `${firstLocation.name} — ${firstLocation.locationLabel}`
    : t('routes.onboarding.operatorScreen.confirm.noneSelected');

  return (
    <View className="flex-1 justify-between px-6 py-8">
      <View className="flex-1 gap-6">
        <View className="gap-2">
          <Text
            accessibilityRole="header"
            className="font-heading text-4xl tracking-wider text-typography-950"
          >
            {t('routes.onboarding.operatorScreen.confirm.title')}
          </Text>
          <Text className="font-body text-base text-typography-500">
            {t('routes.onboarding.operatorScreen.confirm.subtitle')}
          </Text>
        </View>

        <ScrollView contentContainerClassName="gap-4 pb-4">
          {coverUrl ? (
            <Image
              source={{ uri: coverUrl }}
              style={styles.cover}
              accessibilityIgnoresInvertColors
            />
          ) : null}

          <Row label={t('routes.onboarding.operatorScreen.confirm.nameLabel')} value={truckName} />
          <Row
            label={t('routes.onboarding.operatorScreen.confirm.cuisinesLabel')}
            value={cuisinesDisplay}
          />
          <Row
            label={t('routes.onboarding.operatorScreen.confirm.descriptionLabel')}
            value={descriptionDisplay}
          />
          <Row
            label={t('routes.onboarding.operatorScreen.confirm.locationLabel')}
            value={locationDisplay}
          />
        </ScrollView>

        {errorMessage ? (
          <View className="border border-error-400 p-3">
            <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-error-400">
              {t('routes.onboarding.operatorScreen.confirm.errorTitle')}
            </Text>
            <Text className="mt-1 font-body text-sm text-typography-950">{errorMessage}</Text>
          </View>
        ) : null}
      </View>

      <Button action="primary" size="lg" onPress={onSubmit} isDisabled={isSubmitting}>
        <ButtonText>{ctaLabel(t, isSubmitting, errorMessage)}</ButtonText>
      </Button>
    </View>
  );
}

function ctaLabel(
  t: (key: string) => string,
  isSubmitting: boolean,
  errorMessage: string | null,
): string {
  if (isSubmitting) return t('routes.onboarding.operatorScreen.confirm.creating');
  if (errorMessage) return t('routes.onboarding.operatorScreen.confirm.retry');
  return t('routes.onboarding.operatorScreen.confirm.cta');
}

interface RowProps {
  label: string;
  value: string;
}

function Row({ label, value }: RowProps) {
  return (
    <View style={styles.row}>
      <Text className="font-mono text-[10px] uppercase tracking-[1.5px] text-typography-500">
        {label}
      </Text>
      <Text className="font-body text-sm text-typography-950">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    width: '100%',
    height: 160,
    backgroundColor: CHARCOAL,
  },
  row: {
    backgroundColor: CHARCOAL,
    borderColor: MID,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
});
