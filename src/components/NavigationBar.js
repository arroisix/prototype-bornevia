import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import { ListIcon, InboxIcon, GraphIcon, UserIcon } from './NavIcons';
import BlurHeader from './BlurHeader';

// Height of the floating bar above the system inset; screens pad their content by this.
export const TAB_BAR_HEIGHT = 92;
const PILL_W = 64;


// Import Lottie animation files
const navAnimations = {
  Tickets: require('../../assets/animations/nav/List.json'),
  Teams: require('../../assets/animations/nav/Inbox.json'),
  Stats: require('../../assets/animations/nav/Graph.json'),
  Profile: require('../../assets/animations/nav/User.json'),
};

const navItems = [
  {
    name: 'Tickets',
    label: 'Tickets',
    Icon: ListIcon,
  },
  {
    name: 'Teams',
    label: 'Teams',
    Icon: InboxIcon,
  },
  {
    name: 'Stats',
    label: 'Stats',
    Icon: GraphIcon,
  },
  {
    name: 'Profile',
    label: 'Profile',
    Icon: UserIcon,
  },
];

const NavIcon = ({ item, focused, onPress, onLongPress }) => {
  const lottieRef = useRef(null);
  const [wasJustFocused, setWasJustFocused] = useState(false);
  const IconComponent = item.Icon;
  const inactiveColor = '#969696';

  useEffect(() => {
    if (focused && !wasJustFocused) {
      setWasJustFocused(true);
      if (lottieRef.current) {
        lottieRef.current.play();
      }
    } else if (!focused && wasJustFocused) {
      setWasJustFocused(false);
    }
  }, [focused, wasJustFocused]);

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
          {focused ? (
            <LottieView
              ref={lottieRef}
              source={navAnimations[item.name]}
              style={styles.lottieIcon}
              autoPlay
              loop={false}
            />
          ) : (
            <IconComponent color={inactiveColor} size={24} />
          )}
        </View>
      </View>
      <Text style={[styles.label, focused && styles.labelActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Bottom navigation for the swipeable tab pager.
 * - `position`: Animated value in page units (0…n-1) that follows the pager while swiping,
 *   so the red pill tracks the finger and stretches slightly mid-transition.
 * - `index`: settled tab (drives the active icon/label); `onTabPress(i)` scrolls the pager.
 */
export default function NavigationBar({ routes, index, position, onTabPress }) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJson, setSelectedJson] = useState(null);
  const [selectedName, setSelectedName] = useState('');

  const [barWidth, setBarWidth] = useState(0);
  const tabW = barWidth / Math.max(routes.length, 1);
  const pages = routes.map((_, i) => i);
  // 1 at each tab, peaks halfway between two tabs → a little stretch while moving.
  const halfSteps = routes.flatMap((_, i) => (i < routes.length - 1 ? [i, i + 0.5] : [i]));
  const stretch = position.interpolate({
    inputRange: halfSteps,
    outputRange: halfSteps.map((v) => (v % 1 ? 1 : 0)),
    extrapolate: 'clamp',
  });

  const handleShowJson = (name) => {
    setSelectedName(name);
    setSelectedJson(navAnimations[name]);
    setModalVisible(true);
  };

  return (
    <BlurHeader position="bottom" variant="frosted" style={{ paddingBottom: insets.bottom }}>
    <View style={styles.container} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
      {barWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            {
              left: (tabW - PILL_W) / 2,
              transform: [
                {
                  translateX: position.interpolate({
                    inputRange: pages,
                    outputRange: pages.map((i) => i * tabW),
                    extrapolate: 'clamp',
                  }),
                },
                { scaleX: stretch.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) },
                { scaleY: stretch.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) },
              ],
            },
          ]}
        />
      )}
      {routes.map((name, i) => {
        const item = navItems.find((nav) => nav.name === name);
        return (
          <NavIcon
            key={name}
            item={item}
            focused={index === i}
            onPress={() => onTabPress(i)}
            onLongPress={() => handleShowJson(name)}
          />
        );
      })}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedName} JSON Data</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.jsonContainer}>
              <Text style={styles.jsonText}>
                {JSON.stringify(selectedJson, null, 2)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
    </BlurHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 16,
  },
  iconWrapper: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconContainerActive: {
    width: 64,
    height: 40,
    borderRadius: 20,
  },
  pill: {
    position: 'absolute',
    top: 12,
    width: PILL_W,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EE4323',
  },
  lottieIcon: {
    width: 28,
    height: 28,
  },
  label: {
    fontSize: 14,
    color: 'rgba(46, 46, 46, 0.5)',
    fontWeight: '400',
  },
  labelActive: {
    color: '#EE4323',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2E2E',
  },
  closeButton: {
    backgroundColor: '#EE4323',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  jsonContainer: {
    padding: 16,
  },
  jsonText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333333',
    lineHeight: 18,
  },
});
