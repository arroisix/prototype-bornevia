import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import ProgressiveBlur from './ProgressiveBlur';

/**
 * Edge-to-edge bar with a progressive blur behind it: content scrolls underneath
 * (under the status bar / navigation bar too) and is blurred most at the screen edge,
 * fading smoothly to sharp past the bar — no hard divider line.
 *
 * - `position="top"` (default) or `"bottom"`.
 * - `fade`: how far (px) the blur keeps fading beyond the bar's own edge.
 * - `scrollY` (optional): the blur fades in once content starts scrolling underneath.
 */
export default function BlurHeader({ height, children, position = 'top', scrollY, style, fade = 28 }) {
  const isTop = position === 'top';
  const blurOpacity = scrollY
    ? scrollY.interpolate({ inputRange: [0, 20], outputRange: [0.35, 1], extrapolate: 'clamp' })
    : 1;

  return (
    <View pointerEvents="box-none" style={[styles.bar, isTop ? styles.top : styles.bottom, height != null && { height }, style]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.blurArea, isTop ? { top: 0, bottom: -fade } : { bottom: 0, top: -fade }, { opacity: blurOpacity }]}
      >
        <ProgressiveBlur position={position} />
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, overflow: 'visible' },
  top: { top: 0 },
  bottom: { bottom: 0 },
  blurArea: { position: 'absolute', left: 0, right: 0 },
});
