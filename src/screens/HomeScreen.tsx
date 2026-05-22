/** VitaU — dashboard inicial (visão geral do bem-estar). */
import { Feather } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Card, FadeIn, IconBadge, IconName, Pill, Screen } from '../components/ui';
import { AppTabParams } from '../navTypes';
import * as store from '../storage';
import { colors, font, fonts, gradients, moodEmojis, moodLabels, radius, shadow, spacing } from '../theme';

type Props = BottomTabScreenProps<AppTabParams, 'Inicio'>;

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function friendlyToday(): string {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [mood, setMood] = useState<store.MoodEntry[]>([]);
  const [stress, setStress] = useState<store.StressEntry[]>([]);
  const [sleep, setSleep] = useState<store.SleepEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      store.getMoods(user.id).then(setMood);
      store.getStress(user.id).then(setStress);
      store.getSleep(user.id).then(setSleep);
    }, [user]),
  );

  const today = store.todayKey();
  const moodToday = mood.find((m) => m.date === today);
  const lastStress = stress[0];
  const sleepToday = sleep.find((s) => s.date === today);
  const firstName = user?.name.split(' ')[0] ?? 'estudante';
  const doneCount = [!!moodToday, !!sleepToday].filter(Boolean).length;

  return (
    <Screen header={<AppHeader />}>
      <FadeIn delay={40}>
        <Text style={font.overline}>{friendlyToday()}</Text>
        <Text style={[font.h1, { marginTop: 3 }]}>
          {greetingByHour()}, {firstName}
        </Text>
      </FadeIn>

      <FadeIn delay={110}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <Text style={styles.heroTitle}>Resumo de hoje</Text>
            <View style={styles.heroChip}>
              <Feather name="check-circle" size={12} color={colors.white} />
              <Text style={styles.heroChipText}>{doneCount}/2 registros</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <StatTile
              icon="smile"
              label="Humor"
              value={moodToday ? moodEmojis[moodToday.score - 1] : '—'}
              sub={moodToday ? moodLabels[moodToday.score - 1] : 'sem registro'}
            />
            <StatTile
              icon="activity"
              label="Estresse"
              value={lastStress ? String(lastStress.total) : '—'}
              sub={lastStress ? lastStress.level : 'sem registro'}
            />
            <StatTile
              icon="moon"
              label="Sono"
              value={sleepToday ? formatDur(sleepToday.durationMin) : '—'}
              sub={sleepToday ? 'registrado' : 'sem registro'}
            />
          </View>
        </LinearGradient>
      </FadeIn>

      <FadeIn delay={180}>
        <Text style={[font.h2, { marginTop: spacing.xs }]}>Cuide de você</Text>
      </FadeIn>

      <FadeIn delay={230}>
        <PillarCard
          icon="smile"
          color={colors.clay}
          bg={colors.claySoft}
          title="Registrar humor"
          desc={
            moodToday
              ? 'Você já registrou hoje. Toque para revisar.'
              : 'Como você está se sentindo agora?'
          }
          done={!!moodToday}
          onPress={() => navigation.navigate('Humor')}
        />
      </FadeIn>
      <FadeIn delay={280}>
        <PillarCard
          icon="activity"
          color={colors.honey}
          bg={colors.honeySoft}
          title="Questionário de estresse"
          desc={
            lastStress
              ? `Último resultado: ${lastStress.level} · ${lastStress.total}/40 pontos.`
              : 'Avalie seu estresse percebido com a escala PSS-10.'
          }
          onPress={() => navigation.navigate('Estresse')}
        />
      </FadeIn>
      <FadeIn delay={330}>
        <PillarCard
          icon="moon"
          color={colors.indigo}
          bg={colors.indigoSoft}
          title="Registrar sono"
          desc={
            sleepToday
              ? `Você dormiu ${formatDur(sleepToday.durationMin)} na última noite.`
              : 'Acompanhe seus horários e a qualidade do sono.'
          }
          done={!!sleepToday}
          onPress={() => navigation.navigate('Sono')}
        />
      </FadeIn>

      <FadeIn delay={390}>
        <View style={styles.quote}>
          <Feather name="sun" size={16} color={colors.honey} />
          <Text style={styles.quoteText}>
            Pequenos registros diários revelam grandes padrões. Cuide-se com gentileza.
          </Text>
        </View>
      </FadeIn>
    </Screen>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: IconName;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statIcon}>
        <Feather name={icon} size={14} color={colors.white} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub} numberOfLines={1}>
        {sub}
      </Text>
    </View>
  );
}

function PillarCard({
  icon,
  color,
  bg,
  title,
  desc,
  onPress,
  done,
}: {
  icon: IconName;
  color: string;
  bg: string;
  title: string;
  desc: string;
  onPress: () => void;
  done?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.985 }] }]}>
      <Card style={styles.pillar}>
        <IconBadge icon={icon} color={color} bg={bg} />
        <View style={{ flex: 1 }}>
          <View style={styles.pillarTitleRow}>
            <Text style={font.h3}>{title}</Text>
            {done ? <Pill text="Feito" color={colors.success} icon="check" /> : null}
          </View>
          <Text style={[font.small, { marginTop: 3 }]}>{desc}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.inkFaint} />
      </Card>
    </Pressable>
  );
}

function formatDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadow.card,
  },
  heroGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -90,
    right: -50,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.white },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  heroChipText: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: colors.white },
  statRow: { flexDirection: 'row', gap: spacing.sm },
  statTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontFamily: fonts.serifBold, fontSize: 23, color: colors.white },
  statLabel: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.white, marginTop: 2 },
  statSub: {
    fontFamily: fonts.sansMed,
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 1,
    textTransform: 'capitalize',
  },
  pillar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  pillarTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSunk,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.xs,
  },
  quoteText: { fontFamily: fonts.serifItalic, fontSize: 13.5, color: colors.inkSoft, flex: 1, lineHeight: 20 },
});
