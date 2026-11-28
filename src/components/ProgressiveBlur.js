import React from 'react';
import * as RN from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

const { Platform, StyleSheet, UIManager, View } = RN;

/**
 * Progressive blur ("scroll edge effect").
 *
 * <ProgressiveBlurContainer top={..} bottom={..}> wraps a screen's scrolling content.
 * On Android 13+ the native ProgressiveBlurView blurs that content on the GPU with a
 * radius that grows towards the top/bottom edge, so whatever scrolls under a header or
 * bottom bar fades smoothly into blur. Headers and buttons rendered *outside* the
 * container stay sharp. Older Android / iOS render the content unblurred (the EdgeTint
 * fade still applies).
 */

const NativeProgressiveBlur =
  Platform.OS === 'android' && UIManager.getViewManagerConfig?.('ProgressiveBlurView')
    ? RN.requireNativeComponent('ProgressiveBlurView')
    : null;

// Progressive strength (toned down 5% from 14dp for readability).
export const PROGRESSIVE_RADIUS = 13.3;
// Uniform "frosted" blur used under the bottom navigation and the ticket header.
export const FROSTED_RADIUS = 16;

/**
 * topFlat / bottomFlat: that edge gets a uniform frosted blur over its whole height
 * (regular blur bar) instead of the progressive ramp.
 */
export function ProgressiveBlurContainer({
  top = 0,
  bottom = 0,
  radius = PROGRESSIVE_RADIUS,
  topFlat = false,
  bottomFlat = false,
  flatRadius = FROSTED_RADIUS,
  style,
  children,
}) {
  if (NativeProgressiveBlur) {
    return (
      <NativeProgressiveBlur
        style={[styles.fill, style]}
        topHeight={top}
        bottomHeight={bottom}
        maxRadius={radius}
        topFlat={topFlat}
        bottomFlat={bottomFlat}
        flatRadius={flatRadius}
        collapsable={false}
      >
        {children}
      </NativeProgressiveBlur>
    );
  }
  if (Platform.OS === 'web') {
    // Preview only: approximate with stacked backdrop-filter bands.
    return (
      <View style={[styles.fill, style]}>
        {children}
        <WebBands edge="top" size={top} radius={topFlat ? flatRadius : radius} flat={topFlat} />
        <WebBands edge="bottom" size={bottom} radius={bottomFlat ? flatRadius : radius} flat={bottomFlat} />
      </View>
    );
  }
  return <View style={[styles.fill, style]}>{children}</View>;
}

const WebBands = ({ edge, size, radius, flat }) => {
  if (!size) return null;
  if (flat) {
    return (
      <View
        pointerEvents="none"
        style={{ position: 'absolute', left: 0, right: 0, [edge]: 0, height: size, backdropFilter: `blur(${radius * 0.6}px)` }}
      />
    );
  }
  const steps = 8;
  return Array.from({ length: steps }, (_, i) => {
    const t = (steps - i) / steps; // 1 → near edge
    const r = radius * t * t * (3 - 2 * t);
    return (
      <View
        key={`${edge}${i}`}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          [edge]: 0,
          height: size * t,
          backdropFilter: `blur(${(r / steps) * 1.6}px)`,
        }}
      />
    );
  });
};

/** Soft white fade at a bar's edge so titles/icons stay legible over blurred content. */
export function EdgeTint({ position = 'top', opacity = 0.85, style }) {
  const fromTop = position === 'top';
  const gid = `edge-${position}`;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gid} x1="0" y1={fromTop ? '0' : '1'} x2="0" y2={fromTop ? '1' : '0'}>
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={opacity} />
            <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity={opacity * 0.55} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gid})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
