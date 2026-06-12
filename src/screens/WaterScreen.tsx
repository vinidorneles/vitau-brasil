/** VitaU — monitoramento de ingestão hídrica (US12). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Bar, BarChart } from '../components/charts';
import { Button, Card, FadeIn, Screen, SectionTitle } from '../components/ui';
import * as store from '../storage';
import { colors, font, fonts, radius, spacing } from '../theme';

const CUP = store.WATER_CUP_ML;

export default function WaterScreen() {
  const { user } = useAuth();
  const [today, setToday] = useState(0);
  const [goal, setGoal] = useState(store.DEFAULT_WATER_GOAL);
  const [history, setHistory] = useState<store.WaterDay[]>([]);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState('');

  const load = useCallback(() => {
    if (!user) return;
    store.getWaterToday(user.id).then(setToday);
    store.getWaterGoal(user.id).then(setGoal);
    store.getWaterHistory(user.id).then(setHistory);
  }, [user]);
  useFocusEffect(load);

  async function change(ml: number) {
    if (!user) return;
    const total = await store.addWater(user.id, ml);
    setToday(total);
    store.getWaterHistory(user.id).then(setHistory);
  }

  async function saveGoal() {
    if (!user) return;
    const ml = Number(goalDraft.replace(/\D/g, ''));
    if (ml >= CUP) {
      await store.setWaterGoal(user.id, ml);
      setGoal(Math.round(ml));
    }
    setEditingGoal(false);
  }

  const cups = Math.floor(today / CUP);
  const ratio = goal > 0 ? Math.min(1, today / goal) : 0;
  const reached = today >= goal;

  const weekBars: Bar[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = store.todayKey(d);
    const entry = history.find((w) => w.date === key);
    const ml = entry?.ml ?? 0;
    weekBars.push({
      label: store.shortDate(key),
      value: ml,
      color: ml >= goal && ml > 0 ? colors.success : ml > 0 ? colors.indigo : colors.hairline,
      caption: ml > 0 ? `${(ml / 1000).toFixed(1)}L` : '',
    });
  }

  return (
    <Screen header={<AppHeader back title="Hidratação" />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Acompanhe seu consumo de água e mantenha a hidratação em dia.">
          Ingestão hídrica
        </SectionTitle>
      </FadeIn>

      <FadeIn delay={110}>
        <Card>
          <View style={styles.headerRow}>
            <View>
              <Text style={font.overline}>Consumo de hoje</Text>
              <Text style={styles.bigValue}>
                {today}
                <Text style={styles.bigUnit}> ml</Text>
              </Text>
              <Text style={[font.small, { marginTop: 2 }]}>
                {cups} {cups === 1 ? 'copo' : 'copos'} · meta {goal} ml
              </Text>
            </View>
            <View style={[styles.dropBadge, reached && { backgroundColor: colors.success }]}>
              <Feather name="droplet" size={22} color={colors.white} />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${ratio * 100}%`, backgroundColor: reached ? colors.success : colors.indigo },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {reached ? '🎉 Meta atingida! Mantenha-se assim.' : `${Math.round(ratio * 100)}% da meta diária`}
          </Text>

          <View style={styles.addRow}>
            <AddButton label="+1 copo" sub={`${CUP} ml`} onPress={() => change(CUP)} />
            <AddButton label="+ 500 ml" sub="garrafa" onPress={() => change(500)} />
            <AddButton label="+ 100 ml" sub="gole" onPress={() => change(100)} />
          </View>
          <Pressable
            onPress={() => change(-CUP)}
            disabled={today === 0}
            style={({ pressed }) => [
              styles.undoBtn,
              today === 0 && { opacity: 0.4 },
              pressed && { opacity: 0.6 },
            ]}>
            <Feather name="rotate-ccw" size={14} color={colors.inkSoft} />
            <Text style={styles.undoText}>Remover 1 copo</Text>
          </Pressable>
        </Card>
      </FadeIn>

      <FadeIn delay={170}>
        <Card>
          {editingGoal ? (
            <>
              <Text style={font.h3}>Meta diária (ml)</Text>
              <TextInput
                value={goalDraft}
                onChangeText={setGoalDraft}
                placeholder="2000"
                placeholderTextColor={colors.inkFaint}
                keyboardType="number-pad"
                maxLength={5}
                style={styles.goalInput}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Button label="Salvar meta" icon="check" onPress={saveGoal} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Cancelar" variant="ghost" onPress={() => setEditingGoal(false)} />
                </View>
              </View>
            </>
          ) : (
            <Pressable
              onPress={() => {
                setGoalDraft(String(goal));
                setEditingGoal(true);
              }}
              accessibilityRole="button"
              style={styles.goalRow}>
              <View style={styles.goalIcon}>
                <Feather name="target" size={18} color={colors.honey} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={font.h3}>Meta diária</Text>
                <Text style={[font.small, { marginTop: 2 }]}>{goal} ml por dia · toque para ajustar</Text>
              </View>
              <Feather name="edit-2" size={16} color={colors.inkFaint} />
            </Pressable>
          )}
        </Card>
      </FadeIn>

      <FadeIn delay={230}>
        <Card>
          <Text style={font.h3}>Últimos 7 dias</Text>
          <View style={{ marginTop: spacing.lg }}>
            <BarChart data={weekBars} maxValue={Math.max(goal, ...weekBars.map((b) => b.value))} />
          </View>
        </Card>
      </FadeIn>
    </Screen>
  );
}

function AddButton({ label, sub, onPress }: { label: string; sub: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.addBtn, pressed && { transform: [{ scale: 0.95 }] }]}>
      <Text style={styles.addLabel}>{label}</Text>
      <Text style={styles.addSub}>{sub}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bigValue: { fontFamily: fonts.serifBlack, fontSize: 40, color: colors.ink, marginTop: 2 },
  bigUnit: { fontFamily: fonts.serif, fontSize: 18, color: colors.inkSoft },
  dropBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunk,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill },
  progressLabel: { ...font.small, marginTop: spacing.sm, fontFamily: fonts.sansSemi },
  addRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  addBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.indigoSoft,
    backgroundColor: colors.indigoSoft,
    alignItems: 'center',
  },
  addLabel: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.indigo },
  addSub: { fontFamily: fonts.sansMed, fontSize: 10.5, color: colors.inkSoft, marginTop: 1 },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  undoText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkSoft },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.honeySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInput: {
    height: 58,
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    fontFamily: fonts.serifBold,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
  },
});
