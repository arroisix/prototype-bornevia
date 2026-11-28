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

export default function NavigationBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJson, setSelectedJson] = useState(null);
  const [selectedName, setSelectedName] = useState('');

  // One red pill shared by all tabs: it slides (with a little stretch) to the active tab.
  const [barWidth, setBarWidth] = useState(0);
  const pillX = useRef(new Animated.Value(state.index)).current;
  const pillStretch = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillX, { toValue: state.index, tension: 140, friction: 14, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(pillStretch, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.spring(pillStretch, { toValue: 0, tension: 160, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, [state.index, pillX, pillStretch]);
  const tabW = barWidth / Math.max(state.routes.length, 1);


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
                  translateX: pillX.interpolate({
                    inputRange: state.routes.map((_, i) => i),
                    outputRange: state.routes.map((_, i) => i * tabW),
                  }),
                },
                { scaleX: pillStretch.interpolate({ inputRange: [0, 1], outputRange: [1, 1.22] }) },
                { scaleY: pillStretch.interpolate({ inputRange: [0, 1], outputRange: [1, 0.9] }) },
              ],
            },
          ]}
        />
      )}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const item = navItems.find(nav => nav.name === route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          handleShowJson(route.name);
        };

        return (
          <NavIcon
            key={route.key}
            item={item}
            focused={isFocused}
            onPress={onPress}
            onLongPress={onLongPress}
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
