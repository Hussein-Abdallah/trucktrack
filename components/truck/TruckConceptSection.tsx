import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface TruckConceptSectionProps {
  description: string | null;
}

/**
 * "THE CONCEPT" / "LE CONCEPT" — narrative block beneath the schedule.
 * Returns null when the operator hasn't written a description yet, so
 * the layout collapses cleanly instead of showing an empty heading.
 */
export function TruckConceptSection({ description }: TruckConceptSectionProps) {
  const { t } = useTranslation();
  if (!description || description.trim().length === 0) return null;

  return (
    <View className="px-4 pb-6">
      <Text
        accessibilityRole="header"
        className="mb-3 font-heading text-2xl tracking-wider text-typography-950"
      >
        {t('truck.profile.concept.heading')}
      </Text>
      <Text className="font-body text-sm leading-relaxed text-typography-500">{description}</Text>
    </View>
  );
}
