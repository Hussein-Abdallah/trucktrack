import { MarkerView } from '@rnmapbox/maps';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Coord } from '@/lib/types';
import { FIRE_ORANGE, WARM_CREAM } from '@/theme/colors';

interface UserLocationDotProps {
  coords: Coord;
}

const DOT_SIZE = 16;
// Halo expands to 2.5× the dot diameter at the end of each pulse cycle.
const HALO_MAX_SCALE = 2.5;
const PULSE_DURATION_MS = 1500;

export function UserLocationDot({ coords }: UserLocationDotProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    // Loop the pulse forever (-1 = infinite). Falsy reverse keeps it
    // expanding-fade instead of bouncing back, matching the design's
    // "ping" effect.
    scale.value = withRepeat(
      withTiming(HALO_MAX_SCALE, {
        duration: PULSE_DURATION_MS,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false,
    );
  }, [scale]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [1, HALO_MAX_SCALE], [0.5, 0]),
  }));

  return (
    <MarkerView coordinate={[coords.lng, coords.lat]} anchor={{ x: 0.5, y: 0.5 }} allowOverlap>
      <View style={styles.container}>
        <Animated.View style={[styles.halo, haloStyle]} />
        <View style={styles.dot} />
      </View>
    </MarkerView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: FIRE_ORANGE,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: FIRE_ORANGE,
    borderWidth: 2,
    borderColor: WARM_CREAM,
  },
});
