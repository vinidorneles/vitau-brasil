/** VitaU — tela de login (US02). */
import { Feather, Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { Button, Card, FadeIn, IconName, Screen, TextField } from '../components/ui';
import { AuthStackParams } from '../navTypes';
import { DEMO_LOGIN } from '../storage';
import { colors, font, fonts, gradients, radius, shadow, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParams, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { signIn, signInWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleProvider(provider: 'Google' | 'Apple') {
    setError('');
    setLoading(true);
    try {
      await signInWithProvider(provider);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha no login social.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setError('');
    setEmail(DEMO_LOGIN.email);
    setPassword(DEMO_LOGIN.password);
  }

  return (
    <Screen
      decor={
        <>
          <View style={[styles.orb, styles.orbA]} />
          <View style={[styles.orb, styles.orbB]} />
        </>
      }>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FadeIn delay={60} style={styles.hero}>
          <LinearGradient
            colors={gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.mark}>
            <Feather name="activity" size={30} color={colors.white} />
          </LinearGradient>
          <Text style={styles.wordmark}>VitaU</Text>
          <Text style={styles.tagline}>sua saúde integral na vida universitária</Text>
        </FadeIn>

        <FadeIn delay={150}>
          <Card>
            <Text style={font.h2}>Bem-vindo de volta</Text>
            <Text style={[font.small, { marginTop: 3, marginBottom: spacing.xl }]}>
              Entre para continuar cuidando de você.
            </Text>

            <TextField
              label="E-mail"
              icon="mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
            <TextField
              label="Senha"
              icon="lock"
              value={password}
              onChangeText={setPassword}
              placeholder="Sua senha"
              autoComplete="password"
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button label="Entrar" icon="arrow-right" onPress={handleLogin} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>ou continue com</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
              <SocialButton
                label="Google"
                onPress={() => handleProvider('Google')}
                disabled={loading}
              />
              <SocialButton
                label="Apple"
                ionicon="logo-apple"
                onPress={() => handleProvider('Apple')}
                disabled={loading}
              />
            </View>
          </Card>
        </FadeIn>

        <FadeIn delay={240}>
          <Pressable
            onPress={fillDemo}
            accessibilityRole="button"
            accessibilityLabel="Preencher conta de demonstração"
            style={({ pressed }) => [styles.demo, pressed && { opacity: 0.85 }]}>
            <View style={styles.demoIcon}>
              <Feather name="gift" size={16} color={colors.honey} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.demoTitle}>Conta de demonstração</Text>
              <Text style={styles.demoCreds}>
                {DEMO_LOGIN.email} · {DEMO_LOGIN.password}
              </Text>
            </View>
            <Text style={styles.demoAction}>Preencher</Text>
          </Pressable>
        </FadeIn>

        <FadeIn delay={300}>
          <Pressable
            style={styles.footer}
            onPress={() => navigation.navigate('Register')}
            hitSlop={8}>
            <Text style={font.small}>
              Ainda não tem conta? <Text style={styles.link}>Criar conta</Text>
            </Text>
          </Pressable>
        </FadeIn>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SocialButton({
  label,
  ionicon = 'logo-google',
  onPress,
  disabled,
}: {
  label: string;
  ionicon?: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.social,
        pressed && !disabled && { transform: [{ scale: 0.975 }] },
        disabled && { opacity: 0.5 },
      ]}>
      <Ionicons name={ionicon} size={18} color={colors.ink} />
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', borderRadius: 999 },
  orbA: {
    width: 300,
    height: 300,
    backgroundColor: colors.primarySoft,
    opacity: 0.55,
    top: -150,
    right: -120,
  },
  orbB: {
    width: 220,
    height: 220,
    backgroundColor: colors.claySoft,
    opacity: 0.5,
    top: 230,
    left: -130,
  },
  hero: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  mark: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadow.lift,
  },
  wordmark: { fontFamily: fonts.serifBlack, fontSize: 46, color: colors.primary, letterSpacing: -1.5 },
  tagline: { fontFamily: fonts.serifItalic, fontSize: 14.5, color: colors.inkSoft, marginTop: 2 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.danger + '14',
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: { ...font.small, color: colors.danger, flex: 1 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.hairline },
  dividerText: { ...font.tiny },
  socialRow: { flexDirection: 'row', gap: spacing.md },
  social: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  socialText: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.honeySoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  demoIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitle: { fontFamily: fonts.sansBold, fontSize: 13, color: '#7A5A1E' },
  demoCreds: { fontFamily: fonts.sansMed, fontSize: 12, color: '#9A7A35', marginTop: 1 },
  demoAction: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.primary },
  footer: { alignItems: 'center', marginTop: spacing.xl },
  link: { fontFamily: fonts.sansBold, color: colors.primary },
});
