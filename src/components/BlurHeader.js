import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { EdgeTint } from './ProgressiveBlur';

/**
 * Transparent edge-to-edge bar (header or bottom bar). The blur itself comes from the
 * screen's <ProgressiveBlurContainer>, which blurs content progressively as it scrolls
 * under this bar; the bar adds a soft white fade (extending `fade` px past its edge) so
 * its own titles and icons stay legible. No hard divider line.
 */
export default function BlurHeader({ height, children, position = 'top', scrollY, style, fade = 24 }) {
  const isTop = position === 'top';
  const tintOpacity = scrollY
    ? scrollY.interpolate({ inputRange: [0, 20], outputRange: [0, 1], extrapolate: 'clamp' })
    : 1;

  return (
    <View pointerEvents="box-none" style={[styles.bar, isTop ? styles.top : styles.bottom, height != null && { height }, style]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.tint, isTop ? { top: 0, bottom: -fade } : { bottom: 0, top: -fade }, { opacity: tintOpacity }]}
      >
        <EdgeTint position={position} />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, overflow: 'visible' },
  top: { top: 0 },
  bottom: { bottom: 0 },
  tint: { position: 'absolute', left: 0, right: 0 },
});
