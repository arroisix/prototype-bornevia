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
import TeamDetailScreen from './TeamDetailScreen';
import ReportDetailScreen from './ReportDetailScreen';
import { initialTickets } from '../data/tickets';
import { initialTeams } from '../data/teams';
import { BRAND } from '../theme/brand';
import NavigationBar from '../components/NavigationBar';
import { TicketDetailContext } from '../components/TicketDetailContext';
import { PredictiveBackView } from '../components/predictiveBack';

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TOAST_TONES = { success: '#3DDC84', info: '#58A6FF', danger: '#FF6B5E' };

// App-wide toast: { text, tone?, actionLabel?, onAction? }
const Toast = ({ toast, onHide }) => {
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;
  React.useEffect(() => {
    anim.setValue(0);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1, tension: 120, friction: 12, useNativeDriver: true }),
      Animated.delay(3000),
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(({ finished }) => finished && onHideRef.current());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.key]);
  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.toast,
        {
          bottom: insets.bottom + 104,
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      <View style={[styles.toastDot, { backgroundColor: TOAST_TONES[toast.tone] || TOAST_TONES.success }]} />
      <Text style={styles.toastText} numberOfLines={2}>{toast.text}</Text>
      {toast.actionLabel ? (
        <Pressable
          onPress={() => {
            onHideRef.current();
            toast.onAction && toast.onAction();
          }}
          hitSlop={8}
        >
          <Text style={styles.toastAction}>{toast.actionLabel}</Text>
        </Pressable>
      ) : null}
    </Animated.View>
  );
};

function MainAppContent({ onLogout }) {
  return (
    <Tab.Navigator tabBar={(props) => <NavigationBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Tickets" component={TicketsScreen} />
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" children={() => <ProfileScreen onLogout={onLogout} />} />
    </Tab.Navigator>
  );
}

/** A screen pushed over the tabs from the right (ticket / team / report detail). */
function usePushOverlay() {
  const [item, setItem] = useState(null);
  const progress = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  const open = useCallback(
    (next) => {
      closing.current = false;
      progress.setValue(0);
      setItem(next);
      Animated.timing(progress, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    },
    [progress],
  );

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(progress, { toValue: 0, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setItem(null);
      closing.current = false;
    });
  }, [progress]);

  return { item, progress, open, close };
}

const PushLayer = ({ overlay, children }) => {
  if (!overlay.item) return null;
  const { progress } = overlay;
  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.dim, { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] }) }]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.detail,
          {
            opacity: progress.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
            transform: [{ translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_WIDTH * 0.25, 0] }) }],
          },
        ]}
      >
        <PredictiveBackView>{children}</PredictiveBackView>
      </Animated.View>
    </>
  );
};

export default function MainApp({ onLogout }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [teams, setTeams] = useState(initialTeams);
  const [highlightId, setHighlightId] = useState(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [toast, setToast] = useState(null);
  // Sheets opened from tab screens render here so they sit above the tab bar.
  const [hostSheet, setHostSheet] = useState(null);
  const presentSheet = useCallback((el) => setHostSheet(el), []);
  const newProgress = useRef(new Animated.Value(0)).current;

  const ticketOverlay = usePushOverlay();
  const teamOverlay = usePushOverlay();
  const reportOverlay = usePushOverlay();
  const openTicket = ticketOverlay.open;

  const showToast = useCallback((t) => setToast({ key: Date.now(), ...(typeof t === 'string' ? { text: t } : t) }), []);

  const openNewTicket = useCallback(() => {
    newProgress.setValue(0);
    setNewTicketOpen(true);
    Animated.spring(newProgress, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }).start();
  }, [newProgress]);

  const closeNewTicket = useCallback(
    (cb) => {
      Animated.timing(newProgress, { toValue: 0, duration: 260, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
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
        showToast({
          text: `Ticket #${1000 + Number(ticket.id)} created`,
          actionLabel: 'View',
          onAction: () => openTicket(ticket),
        });
      });
    },
    [closeNewTicket, openTicket, showToast],
  );

  const contextValue = useMemo(
    () => ({
      openTicket,
      openNewTicket,
      openTeam: teamOverlay.open,
      openReport: reportOverlay.open,
      showToast,
      presentSheet,
      tickets,
      setTickets,
      teams,
      setTeams,
      highlightId,
    }),
    [openTicket, openNewTicket, teamOverlay.open, reportOverlay.open, showToast, presentSheet, tickets, teams, highlightId],
  );

  // Underlying tabs recede slightly while any pushed screen is open.
  const pushed = Animated.add(Animated.add(ticketOverlay.progress, teamOverlay.progress), reportOverlay.progress);
  const baseScale = pushed.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96], extrapolate: 'clamp' });
  const baseTranslateX = pushed.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_WIDTH * 0.08], extrapolate: 'clamp' });
  const newTranslateY = newProgress.interpolate({ inputRange: [0, 1], outputRange: [SCREEN_HEIGHT, 0] });
  const newDim = newProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3], extrapolate: 'clamp' });

  return (
    <TicketDetailContext.Provider value={contextValue}>
      <View style={styles.root}>
        <Animated.View style={[styles.flex, { transform: [{ translateX: baseTranslateX }, { scale: baseScale }] }]}>
          <NavigationContainer>
            <MainAppContent onLogout={onLogout} />
          </NavigationContainer>
        </Animated.View>

        <PushLayer overlay={teamOverlay}>
          {teamOverlay.item && (
            <TeamDetailScreen key={teamOverlay.item.id} teamId={teamOverlay.item.id} openAddMember={teamOverlay.item.addMember} progress={teamOverlay.progress} onClose={teamOverlay.close} />
          )}
        </PushLayer>

        <PushLayer overlay={reportOverlay}>
          {reportOverlay.item && (
            <ReportDetailScreen key={reportOverlay.item.key} report={reportOverlay.item} progress={reportOverlay.progress} onClose={reportOverlay.close} />
          )}
        </PushLayer>

        <PushLayer overlay={ticketOverlay}>
          {ticketOverlay.item && (
            <TicketDetailScreen key={ticketOverlay.item.id} ticket={ticketOverlay.item} progress={ticketOverlay.progress} onClose={ticketOverlay.close} />
          )}
        </PushLayer>

        {newTicketOpen && (
          <>
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim, { opacity: newDim }]} />
            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: newTranslateY }] }]}>
              <PredictiveBackView>
                <NewTicketScreen
                  progress={newProgress}
                  tickets={tickets}
                  nextNumber={tickets.reduce((m, t) => Math.max(m, Number(t.id)), 0) + 1}
                  onClose={() => closeNewTicket()}
                  onCreated={onTicketCreated}
                />
              </PredictiveBackView>
            </Animated.View>
          </>
        )}

        {hostSheet && React.cloneElement(hostSheet, { onClosed: () => setHostSheet(null) })}

        {toast && <Toast toast={toast} onHide={() => setToast(null)} />}
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
  toastDot: { width: 8, height: 8, borderRadius: 4 },
  toastText: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  toastAction: { color: BRAND, fontSize: 14, fontWeight: '800' },
  root: { flex: 1, backgroundColor: '#000000' },
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  dim: { backgroundColor: '#000000' },
  detail: {
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
});
