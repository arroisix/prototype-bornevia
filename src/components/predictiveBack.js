import React, { useEffect, useRef } from 'react';
import { Animated, DeviceEventEmitter, NativeModules, Platform, StyleSheet } from 'react-native';

/**
 * Android predictive back.
 *
 * MainActivity forwards the system back gesture (start / progress / cancel / invoked) as
 * device events while JS has something open. The most recently opened screen or sheet
 * (top of `stack`) previews its exit as the user swipes; releasing the gesture fires the
 * normal BackHandler event, cancelling springs it back.
 */

const stack = [];
let nativeEnabled = false;

const syncNative = () => {
  if (Platform.OS !== 'android') return;
  const on = stack.length > 0;
  if (on === nativeEnabled) return;
  nativeEnabled = on;
  NativeModules.NavigationBarModule?.setPredictiveBackEnabled?.(on);
};

const top = () => stack[stack.length - 1];

DeviceEventEmitter.addListener('predictiveBackStarted', () => top()?.current?.onStart?.());
DeviceEventEmitter.addListener('predictiveBackProgress', (e) =>
  top()?.current?.onProgress?.(e.progress ?? 0, e.swipeEdge ?? 0),
);
DeviceEventEmitter.addListener('predictiveBackCancelled', () => top()?.current?.onCancel?.());
DeviceEventEmitter.addListener('predictiveBackInvoked', () => top()?.current?.onInvoked?.());

/** Register gesture handlers while `active`. Later registrations take priority. */
export function usePredictiveBack(active, handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;
  useEffect(() => {
    if (!active) return undefined;
    stack.push(ref);
    syncNative();
    return () => {
      const i = stack.lastIndexOf(ref);
      if (i >= 0) stack.splice(i, 1);
      syncNative();
    };
  }, [active]);
}

/**
 * Wraps a full screen: while the back gesture is in progress the page shrinks, shifts away
 * from the swiped edge and rounds its corners (Material predictive-back "cross-screen").
 */
export function PredictiveBackView({ active = true, children, style }) {
  const p = useRef(new Animated.Value(0)).current;
  const edge = useRef(new Animated.Value(0)).current; // -1 swipe from right, 1 from left
  const committed = useRef(false);

  usePredictiveBack(active, {
    onStart: () => {
      committed.current = false;
    },
    onProgress: (progress, swipeEdge) => {
      edge.setValue(swipeEdge === 1 ? -1 : 1);
      p.setValue(progress);
    },
    onCancel: () => {
      Animated.spring(p, { toValue: 0, tension: 120, friction: 14, useNativeDriver: false }).start();
    },
    onInvoked: () => {
      committed.current = true; // keep the shrunk pose while the screen animates away
    },
  });

  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] });
  const shift = Animated.multiply(p.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }), edge);
  const radius = p.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 24, 32] });

  return (
    <Animated.View
      style={[
        styles.fill,
        style,
        { borderRadius: radius, transform: [{ translateX: shift }, { scale }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: 'hidden', backgroundColor: '#FFFFFF' },
});

