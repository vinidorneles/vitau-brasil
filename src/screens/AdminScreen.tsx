/** VitaU — painel administrativo (visão agregada do bem-estar dos estudantes). */
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { Bar, BarChart } from '../components/charts';
import { Card, EmptyState, FadeIn, IconName, Pill, Screen, SectionTitle } from '../components/ui';
import { classify } from '../pss10';
import * as store from '../storage';
import {
  colors,
  font,
  fonts,
  gradients,
  moodColors,
  moodEmojis,
  moodLabels,
  radius,
  shadow,
  spacing,
  stressColors,
} from '../theme';

function formatDur(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export default function AdminScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<store.AdminStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setRefreshing(true);
    store.getAdminStats().then((s) => {
      setStats(s);
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen header={<AdminTopBar onSignOut={signOut} />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Visão agregada e anônima do bem-estar dos estudantes acompanhados.">
          Olá, coordenação
        </SectionTitle>
      </FadeIn>

      {!stats ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[font.small, { marginTop: spacing.md }]}>Reunindo os dados…</Text>
        </View>
      ) : (
        <Dashboard stats={stats} refreshing={refreshing} onRefresh={load} />
      )}
    </Screen>
  );
}

function Dashboard({
  stats,
  refreshing,
  onRefresh,
}: {
  stats: store.AdminStats;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const engaged = stats.perStudent.filter((s) => s.moods + s.stress + s.sleep > 0).length;
  const engagedPct = stats.students ? Math.round((engaged / stats.students) * 100) : 0;
  const moodAvgIdx = stats.mood.count ? Math.round(stats.mood.avg) - 1 : -1;
  const stressLevel = stats.stress.count ? classify(Math.round(stats.stress.avg)) : null;

  const moodBars: Bar[] = stats.mood.dist.map((count, i) => ({
    label: moodEmojis[i],
    value: count,
    color: moodColors[i],
    caption: String(count),
  }));

  return (
    <>
      <FadeIn delay={110}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <Text style={styles.heroTitle}>Panorama geral</Text>
            <Pressable
              onPress={onRefresh}
              disabled={refreshing}
              hitSlop={8}
              accessibilityLabel="Atualizar dados"
              accessibilityRole="button"
              style={({ pressed }) => [styles.refresh, pressed && { opacity: 0.6 }]}>
              {refreshing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather name="refresh-cw" size={14} color={colors.white} />
              )}
            </Pressable>
          </View>
          <View style={styles.heroRow}>
            <HeroStat icon="users" value={String(stats.students)} label="Estudantes" />
            <HeroStat icon="file-text" value={String(stats.totalRecords)} label="Registros" />
            <HeroStat icon="trending-up" value={`${engagedPct}%`} label="Engajados" />
          </View>
        </LinearGradient>
      </FadeIn>

      {stats.students === 0 ? (
        <FadeIn delay={170}>
          <Card>
            <EmptyState
              icon="users"
              text="Nenhum estudante cadastrado ainda. Os dados aparecerão aqui conforme o uso."
            />
          </Card>
        </FadeIn>
      ) : (
        <>
          <FadeIn delay={170}>
            <Card>
              <Text style={font.h3}>Engajamento por pilar</Text>
              <Text style={[font.small, { marginTop: 2, marginBottom: spacing.lg }]}>
                Quantos estudantes registraram cada indicador.
              </Text>
              <EngageRow
                icon="smile"
                color={colors.clay}
                label="Humor"
                value={stats.engagement.mood}
                total={stats.students}
              />
              <EngageRow
                icon="activity"
                color={colors.honey}
                label="Estresse"
                value={stats.engagement.stress}
                total={stats.students}
              />
              <EngageRow
                icon="moon"
                color={colors.indigo}
                label="Sono"
                value={stats.engagement.sleep}
                total={stats.students}
              />
            </Card>
          </FadeIn>

          <FadeIn delay={230}>
            <Card>
              <View style={styles.cardHead}>
                <Text style={font.h3}>Humor coletivo</Text>
                <View style={styles.avgChip}>
                  <Text style={styles.avgEmoji}>
                    {moodAvgIdx >= 0 ? moodEmojis[moodAvgIdx] : '—'}
                  </Text>
                  <Text style={styles.avgChipText}>
                    {stats.mood.count ? `${stats.mood.avg.toFixed(1)} de 5` : 'sem dados'}
                  </Text>
                </View>
              </View>
              <Text style={[font.small, { marginTop: 2 }]}>
                {stats.mood.count} registros · média{' '}
                {moodAvgIdx >= 0 ? moodLabels[moodAvgIdx].toLowerCase() : '—'}
              </Text>
              <View style={{ marginTop: spacing.lg }}>
                <BarChart data={moodBars} />
              </View>
            </Card>
          </FadeIn>

          <FadeIn delay={290}>
            <Card>
              <View style={styles.cardHead}>
                <Text style={font.h3}>Estresse coletivo</Text>
                {stressLevel ? (
                  <Pill
                    text={`média ${stressLevel}`}
                    color={stressColors[stressLevel]}
                    icon="activity"
                  />
                ) : null}
              </View>
              <Text style={[font.small, { marginTop: 2, marginBottom: spacing.lg }]}>
                {stats.stress.count} questionários · média{' '}
                {stats.stress.count ? `${Math.round(stats.stress.avg)}/40 pontos` : '—'}
              </Text>
              <StackBar
                segments={[
                  { value: stats.stress.dist.baixo, color: colors.success },
                  { value: stats.stress.dist.moderado, color: colors.honey },
                  { value: stats.stress.dist.alto, color: colors.clay },
                ]}
              />
              <View style={styles.legend}>
                <LegendItem color={colors.success} label="baixo" value={stats.stress.dist.baixo} />
                <LegendItem
                  color={colors.honey}
                  label="moderado"
                  value={stats.stress.dist.moderado}
                />
                <LegendItem color={colors.clay} label="alto" value={stats.stress.dist.alto} />
              </View>
            </Card>
          </FadeIn>

          <FadeIn delay={350}>
            <Card>
              <View style={styles.cardHead}>
                <Text style={font.h3}>Sono coletivo</Text>
                <View style={styles.avgChip}>
                  <Feather name="moon" size={13} color={colors.indigo} />
                  <Text style={styles.avgChipText}>
                    {stats.sleep.count ? `${formatDur(stats.sleep.avgMin)} em média` : 'sem dados'}
                  </Text>
                </View>
              </View>
              <Text style={[font.small, { marginTop: 2, marginBottom: spacing.lg }]}>
                {stats.sleep.count} noites registradas
              </Text>
              <StackBar
                segments={[
                  { value: stats.sleep.dist.insuficiente, color: colors.danger },
                  { value: stats.sleep.dist.adequado, color: colors.success },
                  { value: stats.sleep.dist.otimo, color: colors.indigo },
                ]}
              />
              <View style={styles.legend}>
                <LegendItem
                  color={colors.danger}
                  label="insuficiente"
                  value={stats.sleep.dist.insuficiente}
                />
                <LegendItem
                  color={colors.success}
                  label="adequado"
                  value={stats.sleep.dist.adequado}
                />
                <LegendItem color={colors.indigo} label="ótimo" value={stats.sleep.dist.otimo} />
              </View>
            </Card>
          </FadeIn>

          <FadeIn delay={410}>
            <Card>
              <Text style={[font.h3, { marginBottom: spacing.sm }]}>
                Estudantes ({stats.students})
              </Text>
              {stats.perStudent.map((s, i) => (
                <View key={s.email} style={[styles.studentRow, i === 0 && { borderTopWidth: 0 }]}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials(s.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={font.h3} numberOfLines={1}>
                      {s.name}
                    </Text>
                    <Text style={[font.tiny, { marginTop: 1 }]} numberOfLines={1}>
                      {s.email}
                    </Text>
                  </View>
                  <View style={styles.counts}>
                    <MiniCount icon="smile" n={s.moods} color={colors.clay} />
                    <MiniCount icon="activity" n={s.stress} color={colors.honey} />
                    <MiniCount icon="moon" n={s.sleep} color={colors.indigo} />
                  </View>
                </View>
              ))}
            </Card>
          </FadeIn>
        </>
      )}
    </>
  );
}

function AdminTopBar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <LinearGradient
          colors={gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mark}>
          <Feather name="activity" size={15} color={colors.white} />
        </LinearGradient>
        <Text style={styles.brandText}>VitaU</Text>
        <View style={styles.adminPill}>
          <Feather name="shield" size={10} color={colors.primary} />
          <Text style={styles.adminPillText}>Painel</Text>
        </View>
      </View>
      <Pressable
        onPress={onSignOut}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
        style={({ pressed }) => [styles.logout, pressed && { opacity: 0.6 }]}>
        <Feather name="log-out" size={14} color={colors.inkSoft} />
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

function HeroStat({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View style={styles.heroStat}>
      <View style={styles.heroStatIcon}>
        <Feather name={icon} size={13} color={colors.white} />
      </View>
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

function EngageRow({
  icon,
  color,
  label,
  value,
  total,
}: {
  icon: IconName;
  color: string;
  label: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? value / total : 0;
  return (
    <View style={styles.engRow}>
      <View style={[styles.engIcon, { backgroundColor: color + '22' }]}>
        <Feather name={icon} size={15} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.engTop}>
          <Text style={styles.engLabel}>{label}</Text>
          <Text style={styles.engValue}>
            {value}
            <Text style={styles.engTotal}> / {total}</Text>
          </Text>
        </View>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              { width: `${value > 0 ? Math.max(pct * 100, 7) : 0}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

function StackBar({ segments }: { segments: { value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <View style={styles.stack}>
      {total === 0 ? (
        <View style={styles.stackEmpty} />
      ) : (
        segments
          .filter((s) => s.value > 0)
          .map((s, i) => <View key={i} style={{ flex: s.value, backgroundColor: s.color }} />)
      )}
    </View>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>
        {label} <Text style={styles.legendValue}>{value}</Text>
      </Text>
    </View>
  );
}

function MiniCount({ icon, n, color }: { icon: IconName; n: number; color: string }) {
  return (
    <View style={styles.miniCount}>
      <Feather name={icon} size={12} color={n > 0 ? color : colors.inkFaint} />
      <Text style={[styles.miniCountText, n > 0 && { color: colors.ink }]}>{n}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.soft,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  mark: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  brandText: {
    fontFamily: fonts.serifBlack,
    fontSize: 19,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  adminPillText: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    color: colors.primary,
    letterSpacing: 0.4,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunk,
  },
  logoutText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkSoft },
  loading: { alignItems: 'center', paddingVertical: spacing.huge },
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
    right: -40,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.white },
  refresh: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: { flexDirection: 'row', gap: spacing.sm },
  heroStat: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  heroStatIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroStatValue: { fontFamily: fonts.serifBold, fontSize: 23, color: colors.white },
  heroStatLabel: { fontFamily: fonts.sansSemi, fontSize: 11.5, color: 'rgba(255,255,255,0.78)' },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  avgChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surfaceSunk,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  avgEmoji: { fontSize: 14 },
  avgChipText: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.inkSoft },
  engRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  engIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  engTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  engLabel: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.ink },
  engValue: { fontFamily: fonts.serifBold, fontSize: 16, color: colors.primary },
  engTotal: { fontFamily: fonts.sansMed, fontSize: 12, color: colors.inkFaint },
  meterTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceSunk,
    overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 999 },
  stack: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSunk,
  },
  stackEmpty: { flex: 1 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendText: { fontFamily: fonts.sansMed, fontSize: 12, color: colors.inkSoft },
  legendValue: { fontFamily: fonts.sansBold, color: colors.ink },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.primary },
  counts: { flexDirection: 'row', gap: 6 },
  miniCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSunk,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.xs,
  },
  miniCountText: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.inkFaint },
});
