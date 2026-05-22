/** VitaU — registro de humor diário (US04) + histórico (US06). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Bar, BarChart } from '../components/charts';
import { Button, Card, EmptyState, FadeIn, Screen, SectionTitle } from '../components/ui';
import * as store from '../storage';
import { colors, font, fonts, moodColors, moodEmojis, moodLabels, radius, spacing } from '../theme';

const NOTE_MAX = 200;

export default function MoodScreen() {
  const { user } = useAuth();
  const [list, setList] = useState<store.MoodEntry[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    if (!user) return;
    store.getMoods(user.id).then((moods) => {
      setList(moods);
      const today = moods.find((m) => m.date === store.todayKey());
      if (today) {
        setScore(today.score);
        setNote(today.note ?? '');
      }
    });
  }, [user]);

  useFocusEffect(load);

  const todayEntry = list.find((m) => m.date === store.todayKey());

  async function handleSave() {
    if (!user || score == null) return;
    await store.saveMood(user.id, score, note);
    setSaved(true);
    load();
    setTimeout(() => setSaved(false), 2500);
  }

  const weekBars: Bar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = store.todayKey(d);
    const entry = list.find((m) => m.date === key);
    weekBars.push({
      label: store.shortDate(key),
      value: entry ? entry.score : 0,
      color: entry ? moodColors[entry.score - 1] : colors.hairline,
      caption: entry ? moodEmojis[entry.score - 1] : '',
    });
  }

  return (
    <Screen header={<AppHeader />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Acompanhe seu bem-estar emocional ao longo do semestre.">
          Registro de humor
        </SectionTitle>
      </FadeIn>

      <FadeIn delay={110}>
        <Card>
          <Text style={font.h3}>Como você está hoje?</Text>
          <View style={styles.scaleRow}>
            {moodEmojis.map((emoji, i) => {
              const value = i + 1;
              const selected = score === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setScore(value)}
                  accessibilityRole="button"
                  accessibilityLabel={moodLabels[i]}
                  style={({ pressed }) => [
                    styles.moodOption,
                    selected && {
                      borderColor: moodColors[i],
                      backgroundColor: moodColors[i] + '1F',
                    },
                    pressed && { transform: [{ scale: 0.95 }] },
                  ]}>
                  <Text style={[styles.moodEmoji, selected && { transform: [{ scale: 1.12 }] }]}>
                    {emoji}
                  </Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      selected && { color: moodColors[i], fontFamily: fonts.sansBold },
                    ]}>
                    {moodLabels[i]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.noteLabel}>Quer anotar algo? (opcional)</Text>
          <View style={styles.noteBox}>
            <TextInput
              value={note}
              onChangeText={(t) => setNote(t.slice(0, NOTE_MAX))}
              placeholder="O que influenciou seu humor hoje?"
              placeholderTextColor={colors.inkFaint}
              multiline
              style={styles.noteInput}
            />
          </View>
          <Text style={styles.counter}>
            {note.length}/{NOTE_MAX}
          </Text>

          <Button
            label={todayEntry ? 'Atualizar registro de hoje' : 'Salvar registro'}
            icon={todayEntry ? 'refresh-cw' : 'check'}
            onPress={handleSave}
            disabled={score == null}
          />
          {saved ? (
            <View style={styles.savedRow}>
              <Feather name="check-circle" size={15} color={colors.success} />
              <Text style={styles.savedText}>Registro salvo com sucesso!</Text>
            </View>
          ) : todayEntry ? (
            <View style={styles.infoRow}>
              <Feather name="info" size={13} color={colors.inkFaint} />
              <Text style={styles.infoText}>É permitido apenas um registro por dia.</Text>
            </View>
          ) : null}
        </Card>
      </FadeIn>

      <FadeIn delay={180}>
        <Card>
          <Text style={font.h3}>Últimos 7 dias</Text>
          <View style={{ marginTop: spacing.lg }}>
            <BarChart data={weekBars} maxValue={5} />
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={250}>
        <Card>
          <Text style={[font.h3, { marginBottom: spacing.sm }]}>Histórico</Text>
          {list.length === 0 ? (
            <EmptyState icon="calendar" text="Seus registros de humor aparecerão aqui." />
          ) : (
            list.slice(0, 10).map((m, idx) => (
              <View key={m.date} style={[styles.histRow, idx === 0 && { borderTopWidth: 0 }]}>
                <View
                  style={[styles.histEmoji, { backgroundColor: moodColors[m.score - 1] + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{moodEmojis[m.score - 1]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={font.h3}>{moodLabels[m.score - 1]}</Text>
                  <Text style={[font.small, { marginTop: 1 }]} numberOfLines={2}>
                    {store.shortDate(m.date)}
                    {m.note ? ` · ${m.note}` : ''}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scaleRow: { flexDirection: 'row', gap: 6, marginTop: spacing.lg },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: 2,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    gap: 6,
  },
  moodEmoji: { fontSize: 28 },
  moodLabel: {
    fontFamily: fonts.sansMed,
    fontSize: 9.5,
    color: colors.inkFaint,
    textAlign: 'center',
  },
  noteLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: 7,
  },
  noteBox: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingTop: 4,
  },
  noteInput: {
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.ink,
    minHeight: 76,
    paddingVertical: spacing.md,
    textAlignVertical: 'top',
  },
  counter: { ...font.tiny, textAlign: 'right', marginTop: 5, marginBottom: spacing.lg },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  savedText: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.success },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  infoText: { ...font.tiny },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  histEmoji: {
    width: 44,
    height: 44,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
