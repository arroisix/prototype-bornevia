import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/**
 * Progressive (variable) blur: strongest at the screen edge, fading to no blur.
 *
 * Native blur views only take a single radius, so the gradient is built from stacked
 * bands: each band starts at the edge, is shorter than the previous one and uses a
 * larger radius. Blur views don't blur each other, so every point shows the radius of
 * the shortest band covering it → blur steps up gradually towards the edge. A soft
 * white gradient on top hides the band boundaries and keeps bar content legible.
 *
 * position: 'top' | 'bottom' (which edge is strongest)
 */
export default function ProgressiveBlur({ position = 'top', steps = 5, maxBlur = 24, tintOpacity = 0.75, style }) {
  const fromTop = position === 'top';
  const bands = Array.from({ length: steps }, (_, i) => ({
    extent: `${Math.round(100 * (1 - i / steps))}%`,
    amount: Math.max(1, Math.round((maxBlur * (i + 1)) / steps)),
  }));
  const gid = `pb-${position}`;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      {bands.map((b, i) => (
        <BlurView
          key={i}
          style={[styles.band, fromTop ? { top: 0 } : { bottom: 0 }, { height: b.extent }]}
          blurType="light"
          blurAmount={b.amount}
          overlayColor="transparent"
          reducedTransparencyFallbackColor="rgba(255,255,255,0.9)"
        />
      ))}
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={gid} x1="0" y1={fromTop ? '0' : '1'} x2="0" y2={fromTop ? '1' : '0'}>
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={tintOpacity} />
            <Stop offset="0.55" stopColor="#FFFFFF" stopOpacity={tintOpacity * 0.45} />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gid})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', left: 0, right: 0 },
});
