import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

/**
 * Edge-to-edge frosted bar. Content scrolls underneath (including under the status bar
 * or navigation bar) and is blurred, like iOS / Material translucent app bars.
 *
 * - `position="top"` (default) or `"bottom"`.
 * - `scrollY` (optional Animated.Value) fades in the hairline divider once content
 *   starts scrolling under the bar.
 */
export default function BlurHeader({ height, children, position = 'top', scrollY, style, tint = 'light' }) {
  const isTop = position === 'top';
  const divider = scrollY
    ? scrollY.interpolate({ inputRange: [0, 24], outputRange: [0, 1], extrapolate: 'clamp' })
    : 1;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.bar, isTop ? styles.top : styles.bottom, height != null && { height }, style]}
    >
      {Platform.OS === 'web' ? (
        <View style={[StyleSheet.absoluteFill, styles.webFallback]} />
      ) : (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType={tint}
          blurAmount={18}
          overlayColor="rgba(255,255,255,0.72)"
          reducedTransparencyFallbackColor="#FFFFFF"
        />
      )}
      <Animated.View
        pointerEvents="none"
        style={[styles.divider, isTop ? styles.dividerBottom : styles.dividerTop, { opacity: divider }]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  top: { top: 0 },
  bottom: { bottom: 0 },
  webFallback: { backgroundColor: 'rgba(255,255,255,0.82)' },
  divider: { position: 'absolute', left: 0, right: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(0,0,0,0.12)' },
  dividerBottom: { bottom: 0 },
  dividerTop: { top: 0 },
});
