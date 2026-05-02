import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { FIRE_ORANGE } from '@/theme/colors';

/**
 * TRUCKTRACK brand wordmark — Bebas Neue 24px, fire-orange. Used as
 * the headerTitle on consumer tabs and in the map screen's edge-to-
 * edge overlay so the brand bar reads identically on both surfaces.
 */
export function WordmarkTitle() {
  const { t } = useTranslation();
  return <Text style={styles.label}>{t('routes.consumer.mapScreen.wordmark')}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    letterSpacing: 2,
    color: FIRE_ORANGE,
  },
});
