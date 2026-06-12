/** VitaU — conteúdo de mindfulness com player guiado (US07). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Card, FadeIn, Screen, SectionTitle } from '../components/ui';
import { MINDFULNESS, MINDFULNESS_CATEGORIES, MindfulnessExercise } from '../content';
import * as store from '../storage';
import { colors, font, fonts, gradients, radius, shadow, spacing } from '../theme';

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

type Filter = 'Todos' | (typeof MINDFULNESS_CATEGORIES)[number];

export default function MindfulnessScreen() {
  const { user } = useAuth();
  const [done, setDone] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>('Todos');
  const [active, setActive] = useState<MindfulnessExercise | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    store.getMindfulnessDone(user.id).then(setDone);
  }, [user]);
  useFocusEffect(load);

  async function toggleDone(id: string) {
    if (!user) return;
    setDone(await store.toggleMindfulnessDone(user.id, id));
  }

  const list = MINDFULNESS.filter((e) => filter === 'Todos' || e.category === filter);
  const filters: Filter[] = ['Todos', ...MINDFULNESS_CATEGORIES];

  return (
    <Screen header={<AppHeader back title="Mindfulness" />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Exercícios guiados de respiração e meditação para reduzir a ansiedade na rotina acadêmica.">
          Mindfulness
        </SectionTitle>
      </FadeIn>

      <FadeIn delay={90}>
        <View style={styles.filterRow}>
          {filters.map((f) => {
            const sel = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={({ pressed }) => [
                  styles.filterChip,
                  sel && styles.filterChipActive,
                  pressed && { opacity: 0.7 },
                ]}>
                <Text style={[styles.filterText, sel && { color: colors.white }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>
      </FadeIn>

      {list.map((ex, i) => {
        const isDone = done.includes(ex.id);
        return (
          <FadeIn key={ex.id} delay={130 + i * 40}>
            <Pressable
              onPress={() => setActive(ex)}
              accessibilityRole="button"
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.985 }] }]}>
              <Card style={styles.exCard}>
                <View style={styles.playBadge}>
                  <Feather name="play" size={18} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.exTitleRow}>
                    <Text style={font.h3}>{ex.title}</Text>
                    {isDone ? <Feather name="check-circle" size={16} color={colors.success} /> : null}
                  </View>
                  <Text style={[font.small, { marginTop: 2 }]} numberOfLines={2}>
                    {ex.description}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={styles.metaTag}>
                      <Feather name="tag" size={11} color={colors.inkSoft} />
                      <Text style={styles.metaText}>{ex.category}</Text>
                    </View>
                    <View style={styles.metaTag}>
                      <Feather name="clock" size={11} color={colors.inkSoft} />
                      <Text style={styles.metaText}>{fmt(ex.durationSec)} min</Text>
                    </View>
                    {ex.audioUrl ? (
                      <View style={styles.metaTag}>
                        <Feather name="volume-2" size={11} color={colors.inkSoft} />
                        <Text style={styles.metaText}>áudio</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Card>
            </Pressable>
          </FadeIn>
        );
      })}

      <Modal visible={!!active} animationType="slide" onRequestClose={() => setActive(null)}>
        {active ? (
          <Player
            exercise={active}
            done={done.includes(active.id)}
            onToggleDone={() => toggleDone(active.id)}
            onClose={() => setActive(null)}
          />
        ) : null}
      </Modal>
    </Screen>
  );
}

function Player({
  exercise,
  done,
  onToggleDone,
  onClose,
}: {
  exercise: MindfulnessExercise;
  done: boolean;
  onToggleDone: () => void;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = useState(exercise.durationSec);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdOut'>('inhale');
  const scale = useRef(new Animated.Value(0.6)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const closedRef = useRef(false); // evita áudio órfão se fechar durante o carregamento
  const creatingRef = useRef(false); // evita criar dois sons com cliques rápidos

  // Configura áudio para tocar em segundo plano / com a tela bloqueada (US07).
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    }).catch(() => {});
    return () => {
      // Garante que o áudio pare e seja descarregado ao sair do exercício.
      closedRef.current = true;
      const s = soundRef.current;
      soundRef.current = null;
      s?.stopAsync().catch(() => {});
      s?.unloadAsync().catch(() => {});
    };
  }, []);

  // Cronômetro: conta regressivamente enquanto tocando.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Guia de respiração: alterna as fases e anima o círculo.
  useEffect(() => {
    if (!running || !exercise.breathing) return;
    const { inhale, hold, exhale, holdOut = 0 } = exercise.breathing;
    const elapsed = exercise.durationSec - remaining;
    const cycle = inhale + hold + exhale + holdOut;
    const pos = elapsed % cycle;
    let next: typeof phase;
    if (pos < inhale) next = 'inhale';
    else if (pos < inhale + hold) next = 'hold';
    else if (pos < inhale + hold + exhale) next = 'exhale';
    else next = 'holdOut';
    if (next !== phase) setPhase(next);
  }, [remaining, running, exercise, phase]);

  // Anima o círculo conforme a fase atual.
  useEffect(() => {
    if (!running || !exercise.breathing) return;
    const { inhale, exhale } = exercise.breathing;
    if (phase === 'inhale') {
      Animated.timing(scale, {
        toValue: 1,
        duration: inhale * 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (phase === 'exhale') {
      Animated.timing(scale, {
        toValue: 0.6,
        duration: exhale * 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [phase, running, exercise, scale]);

  async function togglePlay() {
    if (finished) {
      // reiniciar
      setRemaining(exercise.durationSec);
      setFinished(false);
    }
    const next = !running;
    setRunning(next);
    if (!exercise.audioUrl) return;

    try {
      if (!next) {
        // pausar
        await soundRef.current?.pauseAsync();
        return;
      }
      if (soundRef.current) {
        await soundRef.current.playAsync();
        return;
      }
      // criar o som apenas uma vez (guarda síncrona contra cliques duplos)
      if (creatingRef.current) return;
      creatingRef.current = true;
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: exercise.audioUrl },
          { shouldPlay: true, isLooping: true },
        );
        // Se já existe um som (corrida) ou o usuário fechou, descarrega este.
        if (soundRef.current || closedRef.current) {
          sound.unloadAsync().catch(() => {});
          return;
        }
        soundRef.current = sound;
      } finally {
        creatingRef.current = false;
      }
    } catch {
      // áudio indisponível — o exercício segue pelo cronômetro/guia visual
    }
  }

  async function handleClose() {
    closedRef.current = true;
    setRunning(false);
    const s = soundRef.current;
    soundRef.current = null;
    if (s) {
      await s.stopAsync().catch(() => {});
      await s.unloadAsync().catch(() => {});
    }
    onClose();
  }

  const phaseLabel = { inhale: 'Inspire', hold: 'Segure', exhale: 'Expire', holdOut: 'Pausa' }[phase];
  const progress = 1 - remaining / exercise.durationSec;

  return (
    <LinearGradient colors={gradients.brandDeep} style={styles.player}>
      <Pressable onPress={handleClose} hitSlop={10} style={styles.playerClose}>
        <Feather name="x" size={24} color="rgba(255,255,255,0.85)" />
      </Pressable>

      <Text style={styles.playerCat}>{exercise.category.toUpperCase()}</Text>
      <Text style={styles.playerTitle}>{exercise.title}</Text>

      <View style={styles.circleArea}>
        <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]} />
        <View style={styles.circleInner}>
          <Text style={styles.timer}>{fmt(remaining)}</Text>
          {exercise.breathing && running ? (
            <Text style={styles.phaseLabel}>{phaseLabel}</Text>
          ) : (
            <Text style={styles.phaseLabel}>{finished ? 'Concluído' : 'pronto'}</Text>
          )}
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {finished ? (
        <View style={styles.finishedBox}>
          <Feather name="check-circle" size={20} color={colors.white} />
          <Text style={styles.finishedText}>Exercício concluído. Como você se sente?</Text>
        </View>
      ) : null}

      <Pressable onPress={togglePlay} style={styles.bigPlay} accessibilityRole="button">
        <Feather name={running ? 'pause' : 'play'} size={30} color={colors.primaryDeep} />
      </Pressable>

      <Pressable onPress={onToggleDone} style={styles.doneToggle} accessibilityRole="button">
        <Feather
          name={done ? 'check-circle' : 'circle'}
          size={18}
          color="rgba(255,255,255,0.9)"
        />
        <Text style={styles.doneToggleText}>
          {done ? 'Marcado como concluído' : 'Marcar como concluído'}
        </Text>
      </Pressable>

      {exercise.steps ? (
        <View style={styles.steps}>
          {exercise.steps.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <Text style={styles.stepNum}>{i + 1}</Text>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkSoft },
  exCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  playBadge: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: fonts.sansMed, fontSize: 11.5, color: colors.inkSoft },
  // player
  player: { flex: 1, alignItems: 'center', paddingTop: 70, paddingHorizontal: spacing.xl },
  playerClose: { position: 'absolute', top: 50, right: 24, padding: 6 },
  playerCat: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.6)',
  },
  playerTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
    color: colors.white,
    textAlign: 'center',
    marginTop: 6,
  },
  circleArea: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  breathCircle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  circleInner: { alignItems: 'center', justifyContent: 'center' },
  timer: { fontFamily: fonts.serifBlack, fontSize: 52, color: colors.white },
  phaseLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.honey, borderRadius: radius.pill },
  finishedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  finishedText: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.white },
  bigPlay: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    ...shadow.lift,
  },
  doneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  doneToggleText: { fontFamily: fonts.sansSemi, fontSize: 13.5, color: colors.white },
  steps: { width: '100%', marginTop: spacing.xl, gap: spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fonts.sansBold,
    fontSize: 12,
    overflow: 'hidden',
  },
  stepText: { flex: 1, fontFamily: fonts.sans, fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
});
