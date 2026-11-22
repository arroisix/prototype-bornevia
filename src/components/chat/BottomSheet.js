import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Keyboard, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardInset from './useKeyboardInset';

const SPRING = { tension: 68, friction: 12, useNativeDriver: true };

/**
 * Bottom sheet with an optional "full page" snap point.
 *
 * - Drag the handle/header to move it; release snaps to full / half / closed.
 * - The footer stays pinned to the visible bottom edge in both half and full states.
 * - `header` and `children` may be functions receiving { expanded, setExpanded, close }.
 */
const BottomSheet = forwardRef(function BottomSheet(
  { onClosed, halfRatio = 0.55, expandable = false, startExpanded = false, header, footer, children },
  ref,
) {
  const insets = useSafeAreaInsets();
  const topGap = Math.max(insets.top, 24) + 8;
  const [containerH, setContainerH] = useState(Dimensions.get('window').height);
  const [expanded, setExpandedState] = useState(startExpanded);
  const keyboardInset = useKeyboardInset();

  // Sheet sits on top of the keyboard (edge-to-edge window, no adjustResize).
  const sheetH = containerH - topGap - keyboardInset;
  const halfH = Math.min(sheetH, Math.round(Dimensions.get('window').height * halfRatio));
  const halfOffset = Math.max(sheetH - halfH, 0);
  const closedOffset = sheetH + 40;

  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const currentOffset = useRef(closedOffset);
  const closing = useRef(false);
  const offsets = useRef({ halfOffset, closedOffset });
  offsets.current = { halfOffset, closedOffset };

  const snapTo = useCallback(
    (target, cb) => {
      currentOffset.current = target;
      Animated.spring(translateY, { toValue: target, ...SPRING }).start(cb);
    },
    [translateY],
  );

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Keyboard.dismiss();
    currentOffset.current = offsets.current.closedOffset;
    Animated.timing(translateY, {
      toValue: offsets.current.closedOffset,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClosed && onClosed());
  }, [onClosed, translateY]);

  const setExpanded = useCallback(
    (value) => {
      setExpandedState(value);
      snapTo(value ? 0 : offsets.current.halfOffset);
    },
    [snapTo],
  );

  useImperativeHandle(ref, () => ({ close, setExpanded }), [close, setExpanded]);

  // Open animation.
  useEffect(() => {
    translateY.setValue(Dimensions.get('window').height);
    snapTo(startExpanded ? 0 : offsets.current.halfOffset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep position correct when the container resizes (e.g. keyboard opens).
  useEffect(() => {
    if (closing.current) return;
    const target = expanded ? 0 : halfOffset;
    if (currentOffset.current !== target) snapTo(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [halfOffset]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          translateY.stopAnimation((v) => {
            currentOffset.current = v;
          });
        },
        onPanResponderMove: (_, g) => {
          let next = currentOffset.current + g.dy;
          const min = expandable ? 0 : offsets.current.halfOffset;
          if (next < min) next = min - Math.sqrt(min - next) * 2; // rubber band
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          const pos = currentOffset.current + g.dy;
          const { halfOffset: half } = offsets.current;
          if (g.vy > 1.2 || pos > half + 120) {
            close();
            return;
          }
          if (expandable && (g.vy < -0.8 || pos < half / 2)) {
            setExpandedState(true);
            snapTo(0);
          } else {
            setExpandedState(false);
            snapTo(half);
          }
        },
      }),
    [close, expandable, snapTo, translateY],
  );

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, Math.max(halfOffset, 1), closedOffset],
    outputRange: [0.45, 0.35, 0],
    extrapolate: 'clamp',
  });
  // Footer counter-moves so it sits on the visible bottom edge.
  const footerTranslate = translateY.interpolate({
    inputRange: [0, Math.max(halfOffset, 1), closedOffset + 1],
    outputRange: [0, -halfOffset, -halfOffset],
    extrapolate: 'clamp',
  });
  const radius = translateY.interpolate({
    inputRange: [0, 40],
    outputRange: [0.6, 1],
    extrapolate: 'clamp',
  });

  const api = { expanded, setExpanded, close };

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={(e) => setContainerH(e.nativeEvent.layout.height)}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { top: topGap, bottom: keyboardInset, transform: [{ translateY }] }]}
      >
        <View {...pan.panHandlers}>
          <View style={styles.handleArea}>
            <Animated.View style={[styles.handle, { transform: [{ scaleX: radius }] }]} />
          </View>
          {typeof header === 'function' ? header(api) : header}
        </View>

        <View style={[styles.body, { marginBottom: expanded ? 0 : halfOffset }]}>
          {typeof children === 'function' ? children(api) : children}
        </View>

        {footer ? (
          <Animated.View
            style={[styles.footer, { paddingBottom: keyboardInset ? 12 : Math.max(insets.bottom, 12), transform: [{ translateY: footerTranslate }] }]}
          >
            {typeof footer === 'function' ? footer(api) : footer}
          </Animated.View>
        ) : (
          <View style={{ height: keyboardInset ? 12 : Math.max(insets.bottom, 12) }} />
        )}
      </Animated.View>
    </View>
  );
});

export default BottomSheet;

const styles = StyleSheet.create({
  backdrop: { backgroundColor: '#000000' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 24,
    overflow: 'hidden',
  },
  handleArea: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#DADADA' },
  body: { flex: 1 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(46, 46, 46, 0.08)',
  },
});
