/** VitaU — alertas de rotina de sono (US10). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Button, Card, FadeIn, Screen, SectionTitle } from '../components/ui';
import {
  ensureNotificationPermission,
  notificationsSupported,
  rescheduleSleepAlerts,
} from '../notifications';
import * as store from '../storage';
import { colors, font, fonts, radius, spacing } from '../theme';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // 0=domingo .. 6=sábado
const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function validTime(value: string): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return false;
  return Number(m[1]) <= 23 && Number(m[2]) <= 59;
}

export default function SleepAlertsScreen() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('23:00');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [permDenied, setPermDenied] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      store.getSleepAlert(user.id).then((cfg) => {
        setEnabled(cfg.enabled);
        setTime(cfg.time);
        setDays(cfg.days);
      });
    }, [user]),
  );

  function toggleDay(d: number) {
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));
  }

  async function handleSave() {
    setError('');
    if (!user) return;
    if (enabled && !validTime(time)) {
      setError('Informe um horário válido no formato 24h (ex.: 23:00).');
      return;
    }
    if (enabled && days.length === 0) {
      setError('Selecione ao menos um dia da semana.');
      return;
    }

    if (enabled && notificationsSupported) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        setPermDenied(true);
        return;
      }
      setPermDenied(false);
    }

    const config: store.SleepAlertConfig = { enabled, time, days };
    await store.saveSleepAlert(user.id, config);
    await rescheduleSleepAlerts(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Screen header={<AppHeader back title="Alertas de sono" />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Receba um lembrete para começar a se preparar para dormir e manter uma rotina regular.">
          Alertas de rotina de sono
        </SectionTitle>
      </FadeIn>

      {!notificationsSupported ? (
        <FadeIn delay={90}>
          <View style={styles.webNotice}>
            <Feather name="info" size={15} color={colors.honey} />
            <Text style={styles.webNoticeText}>
              As notificações funcionam no app no celular (Expo Go / build). No navegador a
              configuração é salva, mas os lembretes não são disparados.
            </Text>
          </View>
        </FadeIn>
      ) : null}

      <FadeIn delay={110}>
        <Card>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={font.h3}>Ativar lembretes</Text>
              <Text style={[font.small, { marginTop: 2 }]}>
                {enabled ? 'Você receberá lembretes nos dias e horário abaixo.' : 'Lembretes desativados.'}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: colors.border, true: colors.primaryBright }}
              thumbColor={colors.white}
            />
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={170}>
        <Card style={enabled ? undefined : styles.disabled}>
          <Text style={font.h3}>Horário desejado para dormir</Text>
          <TextInput
            value={time}
            editable={enabled}
            onChangeText={(t) => setTime(formatTimeInput(t))}
            placeholder="--:--"
            placeholderTextColor={colors.inkFaint}
            keyboardType="number-pad"
            maxLength={5}
            style={styles.timeInput}
          />

          <Text style={[font.h3, { marginTop: spacing.xl }]}>Dias da semana</Text>
          <View style={styles.daysRow}>
            {WEEKDAYS.map((label, d) => {
              const active = days.includes(d);
              return (
                <Pressable
                  key={d}
                  disabled={!enabled}
                  onPress={() => toggleDay(d)}
                  accessibilityRole="button"
                  accessibilityLabel={WEEKDAY_NAMES[d]}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.dayChip,
                    active && styles.dayChipActive,
                    pressed && { transform: [{ scale: 0.92 }] },
                  ]}>
                  <Text style={[styles.dayText, active && { color: colors.white }]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={230}>
        <View style={styles.dndNote}>
          <Feather name="moon" size={14} color={colors.inkSoft} />
          <Text style={styles.dndText}>
            Os lembretes respeitam o modo “não perturbe” e as configurações de notificação do seu
            dispositivo.
          </Text>
        </View>
      </FadeIn>

      {error ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {permDenied ? (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={14} color={colors.danger} />
          <Text style={styles.errorText}>
            Permissão de notificações negada. Habilite nas configurações do dispositivo para receber
            os alertas.
          </Text>
        </View>
      ) : null}

      <FadeIn delay={290}>
        <Button label="Salvar alertas" icon="check" onPress={handleSave} />
      </FadeIn>
      {saved ? (
        <View style={styles.savedRow}>
          <Feather name="check-circle" size={15} color={colors.success} />
          <Text style={styles.savedText}>Configuração salva!</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  disabled: { opacity: 0.55 },
  timeInput: {
    height: 64,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  daysRow: { flexDirection: 'row', gap: 6, marginTop: spacing.md },
  dayChip: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  dayText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.inkSoft },
  dndNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSunk,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  dndText: { ...font.small, flex: 1 },
  webNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.honeySoft,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  webNoticeText: { ...font.small, color: colors.ink, flex: 1 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errorText: { ...font.small, color: colors.danger, flex: 1 },
  savedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  savedText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.success },
});
