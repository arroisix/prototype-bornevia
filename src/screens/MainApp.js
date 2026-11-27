import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TicketsScreen from './TicketsScreen';
import TeamsScreen from './TeamsScreen';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import TicketDetailScreen from './TicketDetailScreen';
import NewTicketScreen from './NewTicketScreen';
import { initialTickets } from '../data/tickets';
import { BRAND } from '../theme/brand';
import NavigationBar from '../components/NavigationBar';
import { TicketDetailContext } from '../components/TicketDetailContext';

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Toast shown after a ticket is created.
const Toast = ({ toast, onView, onHide }) => {
  const insets = useSafeAreaInsets();
  const anim = React.useRef(new Animated.Value(0)).current;
  const onHideRef = React.useRef(onHide);
  onHideRef.current = onHide;
  React.useEffect(() => {
    anim.setValue(0);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, tension: 120, friction: 12, useNativeDriver: true }),
      Animated.delay(3200),
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => finished && onHideRef.current());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.key]);
  return (
    <Animated.View
      style={[
        styles.toast,
        {
          bottom: Math.max(insets.bottom, 12) + 84,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        },
      ]}
    >
      <View style={styles.toastDot} />
      <Text style={styles.toastText} numberOfLines={1}>{toast.text}</Text>
      <Pressable onPress={onView} hitSlop={8}>
        <Text style={styles.toastAction}>View</Text>
      </Pressable>
    </Animated.View>
  );
};

function MainAppContent({ onLogout }) {
  return (
    <Tab.Navigator
      tabBar={(props) => <NavigationBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onLogout={onLogout} />}
      />
    </Tab.Navigator>
  );
}

export default function MainApp({ onLogout }) {
  const [activeTicket, setActiveTicket] = useState(null);
  const [tickets, setTickets] = useState(initialTickets);
  const [highlightId, setHighlightId] = useState(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const newProgress = useRef(new Animated.Value(0)).current;

  const openNewTicket = useCallback(() => {
    newProgress.setValue(0);
    setNewTicketOpen(true);
    Animated.spring(newProgress, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }).start();
  }, [newProgress]);

  const closeNewTicket = useCallback(
    (cb) => {
      Animated.timing(newProgress, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setNewTicketOpen(false);
        if (typeof cb === 'function') cb();
      });
    },
    [newProgress],
  );

  const onTicketCreated = useCallback(
    (ticket) => {
      closeNewTicket(() => {
        setTickets((list) => [ticket, ...list]);
        setHighlightId(ticket.id);
        setToast({ key: Date.now(), text: `Ticket #${1000 + Number(ticket.id)} created`, ticket });
      });
    },
    [closeNewTicket],
  );
  const progress = useRef(new Animated.Value(0)).current;
  const closingRef = useRef(false);

  const openTicket = useCallback(
    (ticket) => {
      closingRef.current = false;
      progress.setValue(0);
      setActiveTicket(ticket);
      Animated.timing(progress, {
        toValue: 1,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    },
    [progress],
  );

  const closeTicket = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.timing(progress, {
      toValue: 0,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setActiveTicket(null);
      closingRef.current = false;
    });
  }, [progress]);

  const contextValue = useMemo(
    () => ({ openTicket, openNewTicket, tickets, highlightId }),
    [openTicket, openNewTicket, tickets, highlightId],
  );

  // Underlying tabs recede slightly while the detail page slides over them.
  const baseScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const newTranslateY = newProgress.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] });
  const newDim = newProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3], extrapolate: 'clamp' });
  const baseTranslateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_WIDTH * 0.08] });
  const dimOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] });

  const detailTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH * 0.25, 0],
  });
  const detailOpacity = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <TicketDetailContext.Provider value={contextValue}>
      <View style={styles.root}>
        <Animated.View
          style={[styles.flex, { transform: [{ translateX: baseTranslateX }, { scale: baseScale }] }]}
        >
          <NavigationContainer>
            <MainAppContent onLogout={onLogout} />
          </NavigationContainer>
        </Animated.View>

        {activeTicket && (
          <>
            <Animated.View
              pointerEvents="none"
              style={[StyleSheet.absoluteFill, styles.dim, { opacity: dimOpacity }]}
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.detail,
                { opacity: detailOpacity, transform: [{ translateX: detailTranslateX }] },
              ]}
            >
              <TicketDetailScreen
                key={activeTicket.id}
                ticket={activeTicket}
                progress={progress}
                onClose={closeTicket}
              />
            </Animated.View>
          </>
        )}

        {toast && (
          <Toast
            toast={toast}
            onHide={() => setToast(null)}
            onView={() => {
              const t = toast.ticket;
              setToast(null);
              openTicket(t);
            }}
          />
        )}

        {newTicketOpen && (
          <>
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim, { opacity: newDim }]} />
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: newTranslateY }] }]}>
              <NewTicketScreen
                progress={newProgress}
                tickets={tickets}
                nextNumber={tickets.reduce((m, t) => Math.max(m, Number(t.id)), 0) + 1}
                onClose={() => closeNewTicket()}
                onCreated={onTicketCreated}
              />
            </Animated.View>
          </>
        )}
      </View>
    </TicketDetailContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  toastDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3DDC84' },
  toastText: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  toastAction: { color: BRAND, fontSize: 14, fontWeight: '800' },
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  dim: {
    backgroundColor: '#000000',
  },
  detail: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
});
