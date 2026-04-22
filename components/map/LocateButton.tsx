import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { CHARCOAL, FIRE_ORANGE, MID, MUTED } from '@/theme/colors';

interface LocateButtonProps {
  /** True when OS permission is denied. Tap routes to Settings via the
   *  caller; the a11y hint surfaces the recovery path. */
  permissionDenied: boolean;
  /** True when permission is granted but the first GPS fix hasn't
   *  arrived yet. Visually dim, no a11y hint about Settings (the user
   *  doesn't need to do anything — wait). */
  isLocating: boolean;
  onPress: () => void;
}

const ICON_SIZE = 25;

// NativeWind className handles size + shape + layout (the StyleSheet
// equivalent silently dropped backgroundColor/borderRadius under iOS
// Fabric when applied via Pressable's function-style prop). Mirrors
// AvatarHeaderButton in (consumer)/_layout.tsx — same proven pattern
// for circular icon-only floating controls.
export function LocateButton({ permissionDenied, isLocating, onPress }: LocateButtonProps) {
  const { t } = useTranslation();
  // Visual treatment is the same for both non-actionable states (denied
  // + locating). The split lives at the semantic layer: a11y hint only
  // fires for denied, since "open Settings" is misleading when the
  // user just needs to wait for GPS to lock.
  const dimmed = permissionDenied || isLocating;

  return (
    <Pressable
      onPress={onPress}
      className={`h-[50px] w-[50px] items-center justify-center rounded-full border active:opacity-70 ${
        dimmed ? 'opacity-60' : ''
      }`}
      style={{ backgroundColor: CHARCOAL, borderColor: MID }}
      accessibilityRole="button"
      accessibilityLabel={t('map.locateButton.label')}
      // Hint conveys the swapped action only when permission is denied
      // (button still triggers Linking.openSettings — it's not actually
      // disabled). We deliberately do NOT set accessibilityState.disabled
      // because that would tell screen readers the control is inert,
      // hiding the recovery path from assistive-tech users.
      accessibilityHint={permissionDenied ? t('map.locateButton.deniedHint') : undefined}
    >
      <Feather name="navigation" size={ICON_SIZE} color={dimmed ? MUTED : FIRE_ORANGE} />
    </Pressable>
  );
}
