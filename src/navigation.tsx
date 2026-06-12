/** VitaU — navegação: fluxo de autenticação + abas principais. */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from './auth';
import { AppTabParams, AuthStackParams } from './navTypes';
import AdminScreen from './screens/AdminScreen';
import ChatScreen from './screens/ChatScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import MealsScreen from './screens/MealsScreen';
import MindfulnessScreen from './screens/MindfulnessScreen';
import MoodScreen from './screens/MoodScreen';
import NutritionScreen from './screens/NutritionScreen';
import RegisterScreen from './screens/RegisterScreen';
import SleepAlertsScreen from './screens/SleepAlertsScreen';
import SleepScreen from './screens/SleepScreen';
import StressScreen from './screens/StressScreen';
import WaterScreen from './screens/WaterScreen';
import { colors, font, fonts } from './theme';

export const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    primary: colors.primary,
    card: colors.surface,
    text: colors.ink,
    border: colors.border,
  },
};

const Stack = createNativeStackNavigator<AuthStackParams>();
const Tab = createBottomTabNavigator<AppTabParams>();

function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  // A navegação fica no <AppHeader /> no topo de cada tela — a barra
  // inferior padrão é desativada via tabBar nulo.
  return (
    <Tab.Navigator tabBar={() => null} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Humor" component={MoodScreen} />
      <Tab.Screen name="Estresse" component={StressScreen} />
      <Tab.Screen name="Sono" component={SleepScreen} />
      <Tab.Screen name="AlertasSono" component={SleepAlertsScreen} />
      <Tab.Screen name="Refeicoes" component={MealsScreen} />
      <Tab.Screen name="Agua" component={WaterScreen} />
      <Tab.Screen name="Mindfulness" component={MindfulnessScreen} />
      <Tab.Screen name="Nutricao" component={NutritionScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

/** Tela de abertura, exibida enquanto fontes/sessão carregam. */
export function BrandSplash() {
  return (
    <View style={styles.splash}>
      <View style={[styles.orb, styles.orbA]} />
      <View style={[styles.orb, styles.orbB]} />
      <Text style={styles.splashMark}>VitaU</Text>
      <Text style={styles.splashTag}>saúde integral na vida universitária</Text>
      <ActivityIndicator color={colors.primary} style={{ marginTop: 28 }} />
    </View>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <BrandSplash />;
  if (!user) return <AuthNavigator />;
  if (user.role === 'admin') return <AdminScreen />;
  return <AppNavigator />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    overflow: 'hidden',
  },
  splashMark: {
    fontFamily: fonts.serifBlack,
    fontSize: 52,
    color: colors.primary,
    letterSpacing: -1,
  },
  splashTag: { ...font.small, fontFamily: fonts.serifItalic, fontSize: 14, marginTop: 2 },
  orb: { position: 'absolute', borderRadius: 999 },
  orbA: {
    width: 320,
    height: 320,
    backgroundColor: colors.primarySoft,
    opacity: 0.5,
    top: -120,
    right: -110,
  },
  orbB: {
    width: 240,
    height: 240,
    backgroundColor: colors.claySoft,
    opacity: 0.5,
    bottom: -90,
    left: -90,
  },
});
