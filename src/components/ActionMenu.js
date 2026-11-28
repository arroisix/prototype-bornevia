import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/**
 * Three-dot (or custom) trigger that opens an anchored popover menu.
 *
 * items: [{ key, label, icon?: Component, onPress, destructive?, checked?, hint?, section? }]
 *  - `section: 'Title'` renders a small section label instead of an action.
 *  - `checked: true|false` renders a radio/check column (for sort / filter choices).
 */

export const MoreDotsIcon = ({ color = '#000000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={5} cy={12} r={2} fill={color} />
    <Circle cx={12} cy={12} r={2} fill={color} />
    <Circle cx={19} cy={12} r={2} fill={color} />
  </Svg>
);

const CheckIcon = ({ color }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.5L10 17L19 7" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MENU_WIDTH = 240;

function MenuPopover({ anchor, items, onClose, accent }) {
  const anim = useRef(new Animated.Value(0)).current;
  const { width: W, height: H } = Dimensions.get('window');
  const [menuH, setMenuH] = useState(0);

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 170, friction: 17, useNativeDriver: true }).start();
  }, [anim]);

  const close = (after) => {
    Animated.timing(anim, { toValue: 0, duration: 140, useNativeDriver: true }).start(() => {
      onClose();
      if (after) after();
    });
  };

  // Right-align to the trigger; open upwards if there's no room below.
  const left = Math.min(Math.max(anchor.x + anchor.width - MENU_WIDTH, 12), W - MENU_WIDTH - 12);
  const below = anchor.y + anchor.height + 6;
  const openUp = menuH && below + menuH > H - 24;
  const top = openUp ? Math.max(anchor.y - menuH - 6, 24) : below;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => close()} />
      <Animated.View
        onLayout={(e) => setMenuH(e.nativeEvent.layout.height)}
        style={[
          styles.menu,
          {
            left,
            top,
            opacity: anim,
            transform: [
              { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [MENU_WIDTH * 0.12, 0] }) },
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [openUp ? 14 : -14, 0] }) },
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
            ],
          },
        ]}
      >
        {items.map((item, i) => {
          if (item.section) {
            return (
              <Text key={`s${i}`} style={[styles.section, i > 0 && styles.sectionGap]}>
                {item.section}
              </Text>
            );
          }
          const start = Math.min(0.15 + i * 0.06, 0.7);
          const color = item.destructive ? '#D93025' : '#292929';
          return (
            <Animated.View
              key={item.key || item.label}
              style={{
                opacity: anim.interpolate({ inputRange: [0, start, 1], outputRange: [0, 0, 1], extrapolate: 'clamp' }),
              }}
            >
              {item.divider && <View style={styles.divider} />}
              <Pressable
                onPress={() => close(item.onPress)}
                style={({ pressed }) => [styles.item, pressed && { backgroundColor: item.destructive ? '#FDECEA' : '#F4F4F4' }]}
              >
                {item.icon && (
                  <View style={styles.itemIcon}>
                    <item.icon size={18} color={color} />
                  </View>
                )}
                <View style={styles.flex}>
                  <Text style={[styles.itemText, { color }, item.checked && { color: accent, fontWeight: '700' }]}>{item.label}</Text>
                  {item.hint ? <Text style={styles.itemHint}>{item.hint}</Text> : null}
                </View>
                {item.checked !== undefined && (
                  <View style={styles.checkCol}>{item.checked ? <CheckIcon color={accent} /> : null}</View>
                )}
              </Pressable>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

export default function ActionMenu({ items, accent = '#EE4323', children, style, hitSlop = 8, accessibilityLabel = 'More options', iconColor }) {
  const ref = useRef(null);
  const [anchor, setAnchor] = useState(null);

  const open = () => {
    ref.current?.measureInWindow((x, y, width, height) => setAnchor({ x, y, width, height }));
  };

  return (
    <>
      <TouchableOpacity ref={ref} onPress={open} style={style} hitSlop={hitSlop} accessibilityLabel={accessibilityLabel} activeOpacity={0.6}>
        {children || <MoreDotsIcon color={iconColor} />}
      </TouchableOpacity>
      <Modal visible={!!anchor} transparent animationType="none" statusBarTranslucent onRequestClose={() => setAnchor(null)}>
        {anchor && <MenuPopover anchor={anchor} items={typeof items === 'function' ? items() : items} accent={accent} onClose={() => setAnchor(null)} />}
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 16,
  },
  section: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(93,92,93,0.6)',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionGap: { marginTop: 4, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 4, marginHorizontal: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginHorizontal: 6,
    borderRadius: 12,
  },
  itemIcon: { width: 20, alignItems: 'center' },
  itemText: { fontSize: 15, fontWeight: '500' },
  itemHint: { fontSize: 12, color: 'rgba(93,92,93,0.65)', marginTop: 1 },
  checkCol: { width: 18, alignItems: 'flex-end' },
});
