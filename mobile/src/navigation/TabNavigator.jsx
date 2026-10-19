import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import QuestsScreen from '../screens/QuestsScreen';
import CharacterScreen from '../screens/CharacterScreen';
import StatsScreen from '../screens/StatsScreen';

const Tab = createBottomTabNavigator();

const TabIcon = ({ emoji, focused }) => (
  <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d1f',
          borderTopColor: '#1e1b4b',
          borderTopWidth: 1
        },
        tabBarActiveTintColor: '#7c3aed',
        tabBarInactiveTintColor: '#4b5563',
        tabBarLabelStyle: { fontSize: 10, marginTop: 2 }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Főoldal',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogScreen}
        options={{
          tabBarLabel: 'Naplózás',
          tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} />
        }}
      />
      <Tab.Screen
        name="Quests"
        component={QuestsScreen}
        options={{
          tabBarLabel: 'Questek',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" focused={focused} />
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarLabel: 'Statisztika',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />
        }}
      />
      <Tab.Screen
        name="Character"
        component={CharacterScreen}
        options={{
          tabBarLabel: 'Karakter',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚔️" focused={focused} />
        }}
      />
    </Tab.Navigator>
  );
}
