/** VitaU — registro de sono (US08) com qualidade percebida opcional. */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Bar, BarChart } from '../components/charts';
import { Button, Card, EmptyState, FadeIn, Pill, Screen, SectionTitle } from '../components/ui';
import * as store from '../storage';
import { colors, font, fonts, radius, spacing } from '../theme';

const QUALITY = ['Péssima', 'Ruim', 'Regular', 'Boa', 'Ótima'];

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseTime(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function durationMinutes(bedtime: string, wake: string): number | null {
  const bed = parseTime(bedtime);
  const w = parseTime(wake);
  if (bed == null || w == null) return null;
  return (w <= bed ? w + 1440 : w) - bed;
}

export function formatDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

/** Classificação conforme US08: insuficiente <6h, adequado 6-8h, ótimo >8h. */
function classifySleep(min: number): { label: string; color: string } {
  if (min < 360) return { label: 'insuficiente', color: colors.danger };
  if (min <= 480) return { label: 'adequado', color: colors.success };
  return { label: 'ótimo', color: colors.indigo };
}

export default function SleepScreen() {
  const { user } = useAuth();
  const [list, setList] = useState<store.SleepEntry[]>([]);
  const [bedtime, setBedtime] = useState('');
  const [wake, setWake] = useState('');
  const [quality, setQuality] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    store.getSleep(user.id).then((entries) => {
      setList(entries);
      const today = entries.find((s) => s.date === store.todayKey());
      if (today) {
        setBedtime(today.bedtime);
        setWake(today.wake);
        setQuality(today.quality);
      }
    });
  }, [user]);
  useFocusEffect(load);

  const todayEntry = list.find((s) => s.date === store.todayKey());
  const duration = durationMinutes(bedtime, wake);
  const klass = duration != null ? classifySleep(duration) : null;

  async function handleSave() {
    setError('');
    const dur = durationMinutes(bedtime, wake);
    if (dur == null) {
      setError('Informe os horários no formato 24h (ex.: 23:30 e 07:00).');
      return;
    }
    if (!user) return;
    await store.saveSleep(user.id, bedtime, wake, dur, quality);
    setSaved(true);
    load();
    setTimeout(() => setSaved(false), 2500);
  }

  const weekBars: Bar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = store.todayKey(d);
    const entry = list.find((s) => s.date === key);
    weekBars.push({
      label: store.shortDate(key),
      value: entry ? entry.durationMin : 0,
      color: entry ? classifySleep(entry.durationMin).color : colors.hairline,
      caption: entry ? formatDur(entry.durationMin) : '',
    });
  }

  return (
    <Screen header={<AppHeader />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Monitore seus horários e identifique padrões de sono prejudiciais.">
          Registro de sono
        </SectionTitle>
      </FadeIn>

      <FadeIn delay={110}>
        <Card>
          <Text style={font.h3}>{todayEntry ? 'Sono de hoje' : 'Registrar sono de hoje'}</Text>

          <View style={styles.timeRow}>
            <TimeField icon="moon" label="Fui dormir" value={bedtime} onChange={setBedtime} />
            <TimeField icon="sunrise" label="Acordei" value={wake} onChange={setWake} />
          </View>

          {duration != null && klass ? (
            <View style={styles.durationBox}>
              <View>
                <Text style={font.overline}>Duração total</Text>
                <Text style={styles.durationValue}>{formatDur(duration)}</Text>
              </View>
              <Pill text={klass.label} color={klass.color} icon="moon" />
            </View>
          ) : null}

          <Text style={styles.qualityLabel}>Qualidade percebida (opcional)</Text>
          <View style={styles.qualityRow}>
            {QUALITY.map((label, i) => {
              const value = i + 1;
              const selected = quality === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setQuality(selected ? null : value)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  style={({ pressed }) => [
                    styles.qualityOption,
                    selected && styles.qualitySelected,
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}>
                  <Text style={[styles.qualityText, selected && { color: colors.white }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginTop: spacing.lg }}>
            <Button
              label={todayEntry ? 'Atualizar registro de hoje' : 'Salvar registro'}
              icon={todayEntry ? 'refresh-cw' : 'check'}
              onPress={handleSave}
            />
          </View>
          {saved ? (
            <View style={styles.savedRow}>
              <Feather name="check-circle" size={15} color={colors.success} />
              <Text style={styles.savedText}>Sono registrado com sucesso!</Text>
            </View>
          ) : null}
        </Card>
      </FadeIn>

      <FadeIn delay={180}>
        <Card>
          <Text style={font.h3}>Última semana</Text>
          <View style={{ marginTop: spacing.lg }}>
            <BarChart data={weekBars} maxValue={600} />
          </View>
          <View style={styles.chartLegend}>
            <LegendDot color={colors.danger} text="insuficiente" />
            <LegendDot color={colors.success} text="adequado" />
            <LegendDot color={colors.indigo} text="ótimo" />
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={250}>
        <Card>
          <Text style={[font.h3, { marginBottom: spacing.sm }]}>Histórico</Text>
          {list.length === 0 ? (
            <EmptyState icon="moon" text="Seus registros de sono aparecerão aqui." />
          ) : (
            list.slice(0, 10).map((s, idx) => {
              const k = classifySleep(s.durationMin);
              return (
                <View key={s.date} style={[styles.histRow, idx === 0 && { borderTopWidth: 0 }]}>
                  <View style={[styles.histDot, { backgroundColor: k.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={font.h3}>{formatDur(s.durationMin)}</Text>
                    <Text style={[font.small, { marginTop: 1 }]}>
                      {store.shortDate(s.date)} · {s.bedtime}–{s.wake}
                      {s.quality ? ` · ${QUALITY[s.quality - 1]}` : ''}
                    </Text>
                  </View>
                  <Pill text={k.label} color={k.color} />
                </View>
              );
            })
          )}
        </Card>
      </FadeIn>
    </Screen>
  );
}

function TimeField({
  icon,
  label,
  value,
  onChange,
}: {
  icon: 'moon' | 'sunrise';
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.timeField}>
      <View style={styles.timeLabelRow}>
        <Feather name={icon} size={14} color={colors.inkSoft} />
        <Text style={styles.timeLabel}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(formatTimeInput(t))}
        placeholder="--:--"
        placeholderTextColor={colors.inkFaint}
        keyboardType="number-pad"
        maxLength={5}
        style={styles.timeInput}
      />
    </View>
  );
}

function LegendDot({ color, text }: { color: string; text: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.histDot, { backgroundColor: color }]} />
      <Text style={font.tiny}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timeRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  timeField: { flex: 1 },
  timeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  timeLabel: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  timeInput: {
    height: 58,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    fontFamily: fonts.serifBold,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSunk,
    borderRadius: radius.sm,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  durationValue: { fontFamily: fonts.serifBold, fontSize: 26, color: colors.ink, marginTop: 2 },
  qualityLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  qualityRow: { flexDirection: 'row', gap: 6 },
  qualityOption: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  qualitySelected: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  qualityText: { fontFamily: fonts.sansSemi, fontSize: 10.5, color: colors.inkSoft },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.lg },
  errorText: { ...font.small, color: colors.danger, flex: 1 },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  savedText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.success },
  chartLegend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  histDot: { width: 11, height: 11, borderRadius: 6 },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
