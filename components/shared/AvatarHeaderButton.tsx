import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { MID, WARM_CREAM } from '@/theme/colors';

const ICON_SIZE = 18;

/**
 * Circular avatar button used in the consumer-tab navbar (Following,
 * Stamps, Alerts) and overlaid on the map screen. Pushes /profile.
 *
 * Sized 36×36 so the touch target sits comfortably inside the
 * navigation header without crowding the title — the same dimensions
 * Apple uses for nav-bar trailing buttons. Border-only (no fill) keeps
 * it readable over both APP_BLACK navbars and the map.
 */
export function AvatarHeaderButton() {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel={t('routes.consumer.profile')}
      style={styles.button}
    >
      <Feather name="user" size={ICON_SIZE} color={WARM_CREAM} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MID,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
