import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { CHARCOAL, FIRE_ORANGE, MID, MUTED } from '@/theme/colors';

interface LocateButtonProps {
  /** When true, the icon dims and tap routes to OS Settings instead of
   *  recentering — used when permission is denied or coords aren't
   *  available yet. */
  disabled: boolean;
  onPress: () => void;
}

const ICON_SIZE = 25;

// NativeWind className handles size + shape + layout (the StyleSheet
// equivalent silently dropped backgroundColor/borderRadius under iOS
// Fabric when applied via Pressable's function-style prop). Mirrors
// AvatarHeaderButton in (consumer)/_layout.tsx — same proven pattern
// for circular icon-only floating controls.
export function LocateButton({ disabled, onPress }: LocateButtonProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={onPress}
      className={`h-[50px] w-[50px] items-center justify-center rounded-full border active:opacity-70 ${
        disabled ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: CHARCOAL, borderColor: MID }}
      accessibilityRole="button"
      accessibilityLabel={t('map.locateButton.label')}
      accessibilityHint={disabled ? t('map.locateButton.deniedHint') : undefined}
      accessibilityState={{ disabled }}
    >
      <Feather name="navigation" size={ICON_SIZE} color={disabled ? MUTED : FIRE_ORANGE} />
    </Pressable>
  );
}
