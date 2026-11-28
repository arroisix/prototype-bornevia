import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { EdgeTint } from './ProgressiveBlur';

/**
 * Transparent edge-to-edge bar (header or bottom bar) over a <ProgressiveBlurContainer>.
 *
 * variant="progressive" (default): the content blurs progressively towards the edge; the
 *   bar adds a soft white fade (extending `fade` px past its edge) for legibility.
 * variant="frosted": a regular blur bar — pair with `topFlat` / `bottomFlat` on the
 *   container. Translucent white fill + hairline divider, no fade.
 */
export default function BlurHeader({ height, children, position = 'top', scrollY, style, fade = 24, variant = 'progressive' }) {
  const isTop = position === 'top';
  const frosted = variant === 'frosted';
  const tintOpacity = scrollY
    ? scrollY.interpolate({ inputRange: [0, 20], outputRange: [0, 1], extrapolate: 'clamp' })
    : 1;

  return (
    <View pointerEvents="box-none" style={[styles.bar, isTop ? styles.top : styles.bottom, height != null && { height }, style]}>
      {frosted ? (
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.frosted, isTop ? styles.dividerBottom : styles.dividerTop, { opacity: tintOpacity }]}
        />
      ) : (
        <Animated.View
          pointerEvents="none"
          style={[styles.tint, isTop ? { top: 0, bottom: -fade } : { bottom: 0, top: -fade }, { opacity: tintOpacity }]}
        >
          <EdgeTint position={position} />
        </Animated.View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, overflow: 'visible' },
  top: { top: 0 },
  bottom: { bottom: 0 },
  tint: { position: 'absolute', left: 0, right: 0 },
  frosted: { backgroundColor: 'rgba(255,255,255,0.72)' },
  dividerBottom: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.10)' },
  dividerTop: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(0,0,0,0.10)' },
});
