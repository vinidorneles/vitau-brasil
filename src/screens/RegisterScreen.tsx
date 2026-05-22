/** VitaU — tela de cadastro (US01). */
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { Button, Card, FadeIn, Screen, TextField } from '../components/ui';
import { AuthStackParams } from '../navTypes';
import { colors, font, fonts, radius, shadow, spacing } from '../theme';

type Props = NativeStackScreenProps<AuthStackParams, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      await signUp(name, email, password, confirm);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen decor={<View style={[styles.orb, styles.orbA]} />}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FadeIn delay={50} style={styles.topRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar"
            accessibilityRole="button"
            style={({ pressed }) => [styles.back, pressed && { opacity: 0.7 }]}>
            <Feather name="arrow-left" size={20} color={colors.ink} />
          </Pressable>
          <Text style={styles.brand}>VitaU</Text>
          <View style={{ width: 44 }} />
        </FadeIn>

        <FadeIn delay={130}>
          <Card>
            <Text style={font.h1}>Criar sua conta</Text>
            <Text style={[font.small, { marginTop: 4, marginBottom: spacing.xl }]}>
              Comece a cuidar do seu bem-estar acadêmico — leva menos de um minuto.
            </Text>

            <TextField
              label="Nome completo"
              icon="user"
              value={name}
              onChangeText={setName}
              placeholder="Como podemos te chamar?"
            />
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
              placeholder="Mínimo 8 caracteres"
              autoComplete="password-new"
              secureTextEntry
            />
            <TextField
              label="Confirmar senha"
              icon="lock"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repita a senha"
              autoComplete="password-new"
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={15} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label="Criar conta"
              icon="arrow-right"
              onPress={handleRegister}
              loading={loading}
            />
          </Card>
        </FadeIn>

        <FadeIn delay={210}>
          <Pressable style={styles.footer} onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={font.small}>
              Já tem uma conta? <Text style={styles.link}>Entrar</Text>
            </Text>
          </Pressable>
        </FadeIn>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', borderRadius: 999 },
  orbA: {
    width: 280,
    height: 280,
    backgroundColor: colors.primarySoft,
    opacity: 0.5,
    top: -160,
    left: -110,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  brand: { fontFamily: fonts.serifBlack, fontSize: 22, color: colors.primary, letterSpacing: -0.5 },
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
  footer: { alignItems: 'center', marginTop: spacing.xl },
  link: { fontFamily: fonts.sansBold, color: colors.primary },
});
