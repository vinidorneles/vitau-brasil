/** VitaU — registro de refeições por categoria (US11). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Button, Card, EmptyState, FadeIn, Screen, SectionTitle } from '../components/ui';
import { MEAL_LABELS } from '../content';
import * as store from '../storage';
import { colors, font, fonts, radius, spacing } from '../theme';

const CATEGORIES: store.MealCategory[] = ['cafe', 'almoco', 'jantar', 'lanche'];

function nowTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function validTime(value: string): boolean {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  return !!m && Number(m[1]) <= 23 && Number(m[2]) <= 59;
}

export default function MealsScreen() {
  const { user } = useAuth();
  const [all, setAll] = useState<store.MealEntry[]>([]);
  const [category, setCategory] = useState<store.MealCategory>('cafe');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(nowTime());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!user) return;
    store.getMeals(user.id).then(setAll);
  }, [user]);
  useFocusEffect(load);

  const today = store.todayKey();
  const todayMeals = useMemo(() => all.filter((m) => m.date === today), [all, today]);
  const previousDays = useMemo(() => {
    const groups: Record<string, store.MealEntry[]> = {};
    for (const m of all) {
      if (m.date === today) continue;
      (groups[m.date] ??= []).push(m);
    }
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [all, today]);

  function resetForm() {
    setCategory('cafe');
    setDescription('');
    setTime(nowTime());
    setEditingId(null);
    setError('');
  }

  async function handleSubmit() {
    setError('');
    if (!user) return;
    if (description.trim().length < 2) {
      setError('Descreva a refeição (ex.: pão integral com ovo).');
      return;
    }
    if (!validTime(time)) {
      setError('Informe um horário válido (ex.: 12:30).');
      return;
    }
    if (editingId) {
      await store.updateMeal(user.id, editingId, { category, description, time });
    } else {
      await store.addMeal(user.id, category, description, time);
    }
    resetForm();
    load();
  }

  function startEdit(meal: store.MealEntry) {
    setEditingId(meal.id);
    setCategory(meal.category);
    setDescription(meal.description);
    setTime(meal.time);
    setError('');
  }

  async function handleDelete(id: string) {
    if (!user) return;
    if (editingId === id) resetForm();
    await store.deleteMeal(user.id, id);
    load();
  }

  return (
    <Screen header={<AppHeader back title="Refeições" />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Acompanhe seus hábitos alimentares registrando as refeições do dia.">
          Registro de refeições
        </SectionTitle>
      </FadeIn>

      <FadeIn delay={110}>
        <Card>
          <Text style={font.h3}>{editingId ? 'Editar refeição' : 'Nova refeição'}</Text>

          <Text style={styles.fieldLabel}>Categoria</Text>
          <View style={styles.catRow}>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.catChip,
                    active && styles.catChipActive,
                    pressed && { transform: [{ scale: 0.96 }] },
                  ]}>
                  <Feather
                    name={MEAL_LABELS[cat].icon as any}
                    size={14}
                    color={active ? colors.white : colors.inkSoft}
                  />
                  <Text style={[styles.catText, active && { color: colors.white }]}>
                    {MEAL_LABELS[cat].label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Descrição</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="O que você comeu?"
            placeholderTextColor={colors.inkFaint}
            multiline
            style={styles.descInput}
          />

          <Text style={styles.fieldLabel}>Horário</Text>
          <View style={styles.timeWrap}>
            <Feather name="clock" size={16} color={colors.inkSoft} />
            <TextInput
              value={time}
              onChangeText={(t) => setTime(formatTimeInput(t))}
              placeholder="--:--"
              placeholderTextColor={colors.inkFaint}
              keyboardType="number-pad"
              maxLength={5}
              style={styles.timeInput}
            />
            <Pressable onPress={() => setTime(nowTime())} hitSlop={8}>
              <Text style={styles.nowBtn}>agora</Text>
            </Pressable>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Feather name="alert-circle" size={14} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            <Button
              label={editingId ? 'Salvar alteração' : 'Adicionar refeição'}
              icon={editingId ? 'check' : 'plus'}
              onPress={handleSubmit}
            />
            {editingId ? <Button label="Cancelar" variant="ghost" onPress={resetForm} /> : null}
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={180}>
        <Card>
          <Text style={[font.h3, { marginBottom: spacing.sm }]}>Hoje</Text>
          {todayMeals.length === 0 ? (
            <EmptyState icon="coffee" text="Nenhuma refeição registrada hoje ainda." />
          ) : (
            todayMeals.map((m, idx) => (
              <MealRow
                key={m.id}
                meal={m}
                first={idx === 0}
                onEdit={() => startEdit(m)}
                onDelete={() => handleDelete(m.id)}
              />
            ))
          )}
        </Card>
      </FadeIn>

      {previousDays.length > 0 ? (
        <FadeIn delay={240}>
          <Card>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Dias anteriores</Text>
            {previousDays.map(([date, meals]) => (
              <View key={date} style={styles.dayGroup}>
                <Text style={styles.dayLabel}>{store.shortDate(date)}</Text>
                {meals.map((m, idx) => (
                  <MealRow
                    key={m.id}
                    meal={m}
                    first={idx === 0}
                    onEdit={() => startEdit(m)}
                    onDelete={() => handleDelete(m.id)}
                  />
                ))}
              </View>
            ))}
          </Card>
        </FadeIn>
      ) : null}
    </Screen>
  );
}

function MealRow({
  meal,
  first,
  onEdit,
  onDelete,
}: {
  meal: store.MealEntry;
  first: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.mealRow, first && { borderTopWidth: 0 }]}>
      <View style={styles.mealIcon}>
        <Feather name={MEAL_LABELS[meal.category].icon as any} size={15} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.mealCat}>
          {MEAL_LABELS[meal.category].label} · {meal.time}
        </Text>
        <Text style={[font.body, { marginTop: 1 }]}>{meal.description}</Text>
      </View>
      <Pressable onPress={onEdit} hitSlop={8} accessibilityLabel="Editar refeição">
        <Feather name="edit-2" size={16} color={colors.inkFaint} />
      </Pressable>
      <Pressable onPress={onDelete} hitSlop={8} accessibilityLabel="Remover refeição">
        <Feather name="trash-2" size={16} color={colors.danger} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    ...font.label,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkSoft },
  descInput: {
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  timeInput: {
    flex: 1,
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.ink,
    paddingVertical: 12,
  },
  nowBtn: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.primary },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  errorText: { ...font.small, color: colors.danger, flex: 1 },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  mealIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealCat: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.inkSoft },
  dayGroup: { marginTop: spacing.sm },
  dayLabel: {
    ...font.overline,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
});
