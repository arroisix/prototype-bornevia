import { useEffect, useState } from 'react';
import { Keyboard, LayoutAnimation, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Space (in dp) the software keyboard covers at the bottom of the screen.
 *
 * MainActivity runs edge-to-edge (setDecorFitsSystemWindows(false)), which disables
 * Android's adjustResize, so screens must make room for the keyboard themselves.
 * On Android (API 30+) RN reports the IME height minus the navigation bar, so the
 * nav bar inset is added back to get the full covered area.
 */
export default function useKeyboardInset() {
  const insets = useSafeAreaInsets();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const ios = Platform.OS === 'ios';
    const showEvt = ios ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = ios ? 'keyboardWillHide' : 'keyboardDidHide';
    const animate = (duration) =>
      LayoutAnimation.configureNext(LayoutAnimation.create(duration || 220, 'easeInEaseOut', 'opacity'));

    const onShow = (e) => {
      const kb = e.endCoordinates.height + (ios ? 0 : insets.bottom);
      animate(e.duration);
      setHeight(kb);
    };
    const onHide = (e) => {
      animate(e?.duration);
      setHeight(0);
    };
    const s1 = Keyboard.addListener(showEvt, onShow);
    const s2 = Keyboard.addListener(hideEvt, onHide);
    return () => {
      s1.remove();
      s2.remove();
    };
  }, [insets.bottom]);

  return height;
}
