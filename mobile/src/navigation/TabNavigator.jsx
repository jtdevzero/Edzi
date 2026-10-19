import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import LogScreen from '../screens/LogScreen';
import QuestsScreen from '../screens/QuestsScreen';
import CharacterScreen from '../screens/CharacterScreen';
import StatsScreen from '../screens/StatsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
function TabIcon({ emoji, focused, primary = false }) {
  return (
    <View style={{
      width: primary ? 49 : 40, height: primary ? 49 : 38,
      alignItems: 'center', justifyContent: 'center', borderRadius: primary ? 17 : 13,
      backgroundColor: primary ? colors.primary : (focused ? '#22365C' : 'transparent'),
      borderColor: primary ? '#A79BFF' : 'transparent', borderWidth: primary ? 1 : 0,
      marginTop: primary ? -9 : 0
    }}>
      <Text style={{ fontSize: primary ? 24 : 20, opacity: focused || primary ? 1 : .7 }}>{emoji}</Text>
    </View>
  );
}
export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface, borderTopColor: '#2A3B61', borderTopWidth: 1,
          height: 72, paddingTop: 8, paddingBottom: 7,
          shadowColor: '#000', shadowOpacity: .34, shadowRadius: 18, elevation: 12
        },
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800', letterSpacing: .3, marginTop: 2 },
        tabBarItemStyle: { minHeight: 52 }
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{
        tabBarLabel: 'Főoldal', tabBarIcon: ({ focused }) => <TabIcon emoji="⌂" focused={focused} />
      }} />
      <Tab.Screen name="Log" component={LogScreen} options={{
        tabBarLabel: 'Naplózás', tabBarIcon: ({ focused }) => <TabIcon emoji="＋" focused={focused} primary />
      }} />
      <Tab.Screen name="Quests" component={QuestsScreen} options={{
        tabBarLabel: 'Questek', tabBarIcon: ({ focused }) => <TabIcon emoji="⚡" focused={focused} />
      }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{
        tabBarLabel: 'Statisztika', tabBarIcon: ({ focused }) => <TabIcon emoji="▥" focused={focused} />
      }} />
      <Tab.Screen name="Character" component={CharacterScreen} options={{
        tabBarLabel: 'Karakter', tabBarIcon: ({ focused }) => <TabIcon emoji="♜" focused={focused} />
      }} />
    </Tab.Navigator>
  );
}
