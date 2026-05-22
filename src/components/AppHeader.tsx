/** VitaU — cabeçalho fixo com marca, navegação entre seções e logout. */
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { AppTabParams } from '../navTypes';
import { colors, fonts, gradients, radius, shadow, spacing } from '../theme';
import { IconName } from './ui';

const NAV: { key: keyof AppTabParams; label: string; icon: IconName }[] = [
  { key: 'Inicio', label: 'Início', icon: 'home' },
  { key: 'Humor', label: 'Humor', icon: 'smile' },
  { key: 'Estresse', label: 'Estresse', icon: 'activity' },
  { key: 'Sono', label: 'Sono', icon: 'moon' },
];

export function AppHeader() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { signOut } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brand}>
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mark}>
            <Feather name="activity" size={15} color={colors.white} />
          </LinearGradient>
          <Text style={styles.brandText}>VitaU</Text>
        </View>
        <Pressable
          onPress={signOut}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.6 }]}>
          <Feather name="log-out" size={14} color={colors.inkSoft} />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.nav}>
        {NAV.map((item) => {
          const active = route.name === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => navigation.navigate(item.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && !active && { opacity: 0.6 },
              ]}>
              <Feather
                name={item.icon}
                size={16}
                color={active ? colors.primary : colors.inkFaint}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    ...shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mark: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: fonts.serifBlack,
    fontSize: 19,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunk,
  },
  logoutText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkSoft },
  nav: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.surfaceSunk,
    borderRadius: radius.md,
    padding: 4,
  },
  navItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  navItemActive: { backgroundColor: colors.surface, ...shadow.soft },
  navLabel: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkFaint },
  navLabelActive: { fontFamily: fonts.sansBold, color: colors.primary },
});
