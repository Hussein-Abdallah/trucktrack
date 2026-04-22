import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { CHARCOAL, FIRE_ORANGE, MID, MUTED } from '@/theme/colors';

interface LocateButtonProps {
  /** When true, the icon dims and tap routes to OS Settings instead of
   *  recentering — used when permission is denied or coords aren't
   *  available yet. */
  disabled: boolean;
  onPress: () => void;
}

const SIZE = 40;
const ICON_SIZE = 20;

export function LocateButton({ disabled, onPress }: LocateButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={t('map.locateButton.label')}
      accessibilityHint={disabled ? t('map.locateButton.deniedHint') : undefined}
      accessibilityState={{ disabled }}
    >
      <Feather name="navigation" size={ICON_SIZE} color={disabled ? MUTED : FIRE_ORANGE} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Sized box only — positioning is handled by the parent flex overlay
  // in app/(consumer)/index.tsx (alignItems flex-end + paddingTop). This
  // separation works around an iOS Fabric quirk where position:absolute
  // on a Pressable nested inside an absolute-fill wrapper collapses the
  // top/right offsets to 0/0.
  button: {
    width: SIZE,
    height: SIZE,
    backgroundColor: CHARCOAL,
    borderWidth: 1,
    borderColor: MID,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.7,
  },
});
