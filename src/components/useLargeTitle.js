/**
 * iOS-style large title: as content scrolls up, the big 36pt title shrinks to a compact
 * 22pt title and the header tightens. `scrollY` must be a JS-driven Animated.Value
 * (font size / padding can't use the native driver).
 */
export default function useLargeTitle(scrollY, distance = 56) {
  const range = { inputRange: [0, distance], extrapolate: 'clamp' };
  return {
    titleStyle: {
      fontSize: scrollY.interpolate({ ...range, outputRange: [36, 22] }),
      lineHeight: scrollY.interpolate({ ...range, outputRange: [43, 28] }),
    },
    // Top padding (below the status bar) shrinks with the title.
    padTop: (base) => scrollY.interpolate({ ...range, outputRange: [base + 17, base + 8] }),
    padBottom: (from, to) => scrollY.interpolate({ ...range, outputRange: [from, to] }),
  };
}
