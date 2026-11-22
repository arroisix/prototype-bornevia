import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TicketsScreen from './TicketsScreen';
import TeamsScreen from './TeamsScreen';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import TicketDetailScreen from './TicketDetailScreen';
import NavigationBar from '../components/NavigationBar';
import { TicketDetailContext } from '../components/TicketDetailContext';

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

  const contextValue = useMemo(() => ({ openTicket }), [openTicket]);

  // Underlying tabs recede slightly while the detail page slides over them.
  const baseScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
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
      </View>
    </TicketDetailContext.Provider>
  );
}

const styles = StyleSheet.create({
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
