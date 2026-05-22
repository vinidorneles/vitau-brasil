/** VitaU — questionário de estresse PSS-10 (US05). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Button, Card, EmptyState, FadeIn, Pill, Screen, SectionTitle } from '../components/ui';
import { classify, LIKERT, QUESTIONS, scorePSS10, TIPS } from '../pss10';
import * as store from '../storage';
import { colors, font, fonts, radius, spacing, stressColors } from '../theme';

type Result = { total: number; level: store.StressLevel };

export default function StressScreen() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<store.StressEntry[]>([]);

  const load = useCallback(() => {
    if (user) store.getStress(user.id).then(setHistory);
  }, [user]);
  useFocusEffect(load);

  const answered = answers.filter((a) => a !== null).length;
  const complete = answered === QUESTIONS.length;
  const progress = answered / QUESTIONS.length;

  function setAnswer(qi: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = value;
      return next;
    });
  }

  async function handleSubmit() {
    if (!user || !complete) return;
    const filled = answers as number[];
    const total = scorePSS10(filled);
    const level = classify(total);
    await store.saveStress(user.id, total, level, filled);
    setResult({ total, level });
    load();
  }

  function reset() {
    setAnswers(Array(QUESTIONS.length).fill(null));
    setResult(null);
  }

  if (result) {
    const tint = stressColors[result.level];
    return (
      <Screen header={<AppHeader />}>
        <FadeIn delay={40}>
          <SectionTitle>Resultado do PSS-10</SectionTitle>
        </FadeIn>
        <FadeIn delay={110}>
          <Card style={{ alignItems: 'center' }}>
            <Text style={font.overline}>Sua pontuação</Text>
            <View
              style={[
                styles.disc,
                { backgroundColor: tint + '1C', borderColor: tint + '55' },
              ]}>
              <Text style={[styles.discScore, { color: tint }]}>{result.total}</Text>
              <Text style={styles.discMax}>de 40</Text>
            </View>
            <Pill text={`Estresse ${result.level}`} color={tint} icon="activity" />
          </Card>
        </FadeIn>
        <FadeIn delay={180}>
          <Card>
            <View style={styles.tipHead}>
              <Feather name="compass" size={16} color={colors.primary} />
              <Text style={font.h3}>Orientação para você</Text>
            </View>
            <Text style={styles.tipText}>{TIPS[result.level]}</Text>
          </Card>
        </FadeIn>
        <FadeIn delay={240}>
          <Button label="Refazer questionário" icon="refresh-cw" variant="soft" onPress={reset} />
        </FadeIn>
        <FadeIn delay={300}>
          <StressHistory history={history} />
        </FadeIn>
      </Screen>
    );
  }

  return (
    <Screen header={<AppHeader />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Escala PSS-10 adaptada à rotina universitária. Responda pensando no último mês.">
          Questionário de estresse
        </SectionTitle>
      </FadeIn>

      <FadeIn delay={100}>
        <Card flat style={styles.progressCard}>
          <View style={styles.progressTop}>
            <Text style={font.label}>Seu progresso</Text>
            <Text style={styles.progressCount}>
              {answered}/{QUESTIONS.length}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(4, progress * 100)}%` }]} />
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={150}>
        <Card style={{ backgroundColor: colors.primaryTint }} flat>
          <Text style={font.h3}>Escala de resposta</Text>
          <View style={styles.legend}>
            {LIKERT.map((l, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={styles.legendChip}>
                  <Text style={styles.legendNum}>{i}</Text>
                </View>
                <Text style={styles.legendLabel}>{l}</Text>
              </View>
            ))}
          </View>
        </Card>
      </FadeIn>

      {QUESTIONS.map((q, qi) => {
        const current = answers[qi];
        return (
          <Card key={qi}>
            <View style={styles.qHead}>
              <View style={styles.qNum}>
                <Text style={styles.qNumText}>{qi + 1}</Text>
              </View>
              <Text style={styles.qText}>No último mês, com que frequência você {q}</Text>
            </View>
            <View style={styles.optionRow}>
              {LIKERT.map((_, value) => {
                const selected = current === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setAnswer(qi, value)}
                    accessibilityRole="button"
                    accessibilityLabel={LIKERT[value]}
                    style={({ pressed }) => [
                      styles.option,
                      selected && styles.optionSelected,
                      pressed && { transform: [{ scale: 0.94 }] },
                    ]}>
                    <Text style={[styles.optionText, selected && { color: colors.white }]}>
                      {value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {current != null ? (
              <Text style={styles.qAnswer}>
                Resposta: <Text style={styles.qAnswerStrong}>{LIKERT[current]}</Text>
              </Text>
            ) : null}
          </Card>
        );
      })}

      <Button
        label={complete ? 'Ver meu resultado' : `Faltam ${QUESTIONS.length - answered} questões`}
        icon="bar-chart-2"
        onPress={handleSubmit}
        disabled={!complete}
      />

      <StressHistory history={history} />
    </Screen>
  );
}

function StressHistory({ history }: { history: store.StressEntry[] }) {
  const last4 = useMemo(() => history.slice(0, 4), [history]);
  return (
    <Card>
      <Text style={[font.h3, { marginBottom: spacing.sm }]}>Últimos resultados</Text>
      {last4.length === 0 ? (
        <EmptyState icon="bar-chart-2" text="Seus últimos resultados aparecerão aqui." />
      ) : (
        last4.map((s, i) => (
          <View key={s.createdAt} style={[styles.histRow, i === 0 && { borderTopWidth: 0 }]}>
            <View style={[styles.histScore, { backgroundColor: stressColors[s.level] + '22' }]}>
              <Text style={[styles.histScoreText, { color: stressColors[s.level] }]}>
                {s.total}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[font.h3, { textTransform: 'capitalize' }]}>{s.level}</Text>
              <Text style={[font.small, { marginTop: 1 }]}>{store.shortDate(s.date)}</Text>
            </View>
            <View style={[styles.histDot, { backgroundColor: stressColors[s.level] }]} />
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  disc: {
    width: 156,
    height: 156,
    borderRadius: 999,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  discScore: { fontFamily: fonts.serifBlack, fontSize: 58, letterSpacing: -1 },
  discMax: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.inkFaint, marginTop: -4 },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  tipText: { ...font.body, fontSize: 14.5, lineHeight: 22 },
  progressCard: { backgroundColor: colors.surface, paddingVertical: spacing.lg },
  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressCount: { fontFamily: fonts.serifBold, fontSize: 16, color: colors.primary },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceSunk,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: colors.primary },
  legend: { marginTop: spacing.md, gap: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legendChip: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendNum: { fontFamily: fonts.sansBold, fontSize: 13, color: colors.primary },
  legendLabel: { ...font.small, color: colors.ink },
  qHead: { flexDirection: 'row', gap: spacing.md },
  qNum: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qNumText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.primary },
  qText: { ...font.body, flex: 1, fontSize: 14.5, lineHeight: 21, paddingTop: 4 },
  optionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  option: {
    flex: 1,
    height: 50,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontFamily: fonts.sansBold, fontSize: 17, color: colors.inkSoft },
  qAnswer: { ...font.small, marginTop: spacing.md },
  qAnswerStrong: { fontFamily: fonts.sansBold, color: colors.primary },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  histScore: {
    width: 46,
    height: 46,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  histScoreText: { fontFamily: fonts.serifBold, fontSize: 18 },
  histDot: { width: 10, height: 10, borderRadius: 5 },
});
