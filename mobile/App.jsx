import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { GameProvider, useGame } from './src/game/GameContext';
import { colors } from './src/theme';

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.card, primary: colors.primary }
};

function Root() {
  const game = useGame();
  if (!game) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }
  if (!game.state.character) return <OnboardingScreen />;
  return (
    <NavigationContainer theme={navTheme} documentTitle={{ formatter: () => 'Edzi' }}>
      <TabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.outer}>
        <View style={styles.inner}>
          <GameProvider>
            <Root />
          </GameProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: 480 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }
});
