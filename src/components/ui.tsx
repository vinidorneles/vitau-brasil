/**
 * VitaU — componentes de interface reutilizáveis.
 * Estilo "Bem-estar Acolhedor": creme quente, verde-pinheiro, cantos generosos.
 */
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, gradients, radius, shadow, spacing } from '../theme';

export type IconName = React.ComponentProps<typeof Feather>['name'];

/**
 * Container de tela: fundo creme + coluna central de largura máxima
 * (mantém o layout de app no celular e evita o "esticado" na web).
 */
export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  decor,
  header,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom')[];
  decor?: React.ReactNode;
  header?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {decor ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          {decor}
        </View>
      ) : null}
      <View style={styles.column}>
        {header}
        {scroll ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.scrollContent, styles.fill]}>{children}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

/** Revela o conteúdo com fade + leve subida ao montar. */
export function FadeIn({
  children,
  delay = 0,
  offset = 16,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  offset?: number;
  style?: ViewStyle;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduced) => {
        if (cancelled) return;
        if (reduced) {
          a.setValue(1);
          return;
        }
        Animated.timing(a, {
          toValue: 1,
          duration: 540,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      })
      .catch(() => a.setValue(1));
    return () => {
      cancelled = true;
    };
  }, [a, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: a,
          transform: [
            { translateY: a.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) },
          ],
        },
      ]}>
      {children}
    </Animated.View>
  );
}

/** Cartão branco com cantos generosos e sombra quente. */
export function Card({
  children,
  style,
  flat = false,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  flat?: boolean;
}) {
  return <View style={[styles.card, flat ? null : shadow.card, style]}>{children}</View>;
}

/** Selo redondo com ícone vetorial colorido. */
export function IconBadge({
  icon,
  color,
  bg,
  size = 48,
}: {
  icon: IconName;
  color: string;
  bg: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 3,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Feather name={icon} size={size * 0.46} color={color} />
    </View>
  );
}

/** Cabeçalho de seção. */
export function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <View style={{ marginBottom: spacing.xs }}>
      <Text style={font.h1}>{children}</Text>
      {hint ? <Text style={[font.small, { marginTop: 4 }]}>{hint}</Text> : null}
    </View>
  );
}

/** Botão principal — primário usa gradiente da marca. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'soft' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  const isDisabled = disabled || loading;
  const isGradient = variant === 'primary' || variant === 'danger';
  const tint =
    variant === 'soft' ? colors.primary : variant === 'ghost' ? colors.primary : colors.white;

  const inner = loading ? (
    <ActivityIndicator color={tint} />
  ) : (
    <View style={styles.btnRow}>
      {icon ? <Feather name={icon} size={18} color={tint} /> : null}
      <Text style={[styles.btnText, { color: tint }]}>{label}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        variant === 'soft' && styles.btnSoft,
        variant === 'ghost' && styles.btnGhost,
        isGradient && shadow.lift,
        pressed && !isDisabled && { transform: [{ scale: 0.975 }] },
        isDisabled && { opacity: 0.45 },
      ]}>
      {isGradient ? (
        <LinearGradient
          colors={variant === 'danger' ? gradients.clay : gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnFill}>
          {inner}
        </LinearGradient>
      ) : (
        <View style={styles.btnFill}>{inner}</View>
      )}
    </Pressable>
  );
}

/** Campo de texto com rótulo, ícone, foco e alternância de senha. */
export function TextField({
  label,
  error,
  icon,
  ...props
}: { label: string; error?: string; icon?: IconName } & TextInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!props.secureTextEntry);
  const isPassword = !!props.secureTextEntry;

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocus,
          !!error && styles.inputWrapError,
        ]}>
        {icon ? (
          <Feather
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.inkFaint}
            style={{ marginRight: spacing.sm }}
          />
        ) : null}
        <TextInput
          placeholderTextColor={colors.inkFaint}
          {...props}
          secureTextEntry={isPassword ? hidden : false}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={styles.input}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}>
            <Feather name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.inkFaint} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={styles.fieldErrorRow}>
          <Feather name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.fieldError}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Etiqueta colorida (badge). */
export function Pill({ text, color, icon }: { text: string; color: string; icon?: IconName }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22' }]}>
      {icon ? <Feather name={icon} size={12} color={color} /> : null}
      <Text style={[styles.pillText, { color }]}>{text}</Text>
    </View>
  );
}

/** Estado vazio amigável. */
export function EmptyState({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Feather name={icon} size={22} color={colors.inkFaint} />
      </View>
      <Text style={[font.small, { textAlign: 'center', maxWidth: 240 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, overflow: 'hidden' },
  column: { flex: 1, width: '100%', maxWidth: 460, alignSelf: 'center' },
  fill: { flex: 1 },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.huge,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  btn: {
    height: 56,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  btnFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  btnSoft: { backgroundColor: colors.primarySoft },
  btnGhost: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btnText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 15.5, letterSpacing: 0.1 },
  fieldLabel: {
    ...font.label,
    color: colors.ink,
    marginBottom: 7,
    marginLeft: 2,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  inputWrapFocus: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  inputWrapError: { borderColor: colors.danger, backgroundColor: colors.surface },
  input: {
    flex: 1,
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 14,
  },
  fieldErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, marginLeft: 2 },
  fieldError: { ...font.small, color: colors.danger },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 12 },
  empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSunk,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
