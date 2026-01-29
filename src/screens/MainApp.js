import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TicketsScreen from './TicketsScreen';
import TeamsScreen from './TeamsScreen';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import NavigationBar from '../components/NavigationBar';

const Tab = createBottomTabNavigator();

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
  return (
    <NavigationContainer>
      <MainAppContent onLogout={onLogout} />
    </NavigationContainer>
  );
}