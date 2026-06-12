/** VitaU — dicas nutricionais para estudantes (US13). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Card, EmptyState, FadeIn, Screen, SectionTitle } from '../components/ui';
import { NUTRITION_CATEGORIES, NUTRITION_TIPS } from '../content';
import * as store from '../storage';
import { colors, font, fonts, radius, spacing } from '../theme';

type Filter = 'Todos' | 'Favoritos' | (typeof NUTRITION_CATEGORIES)[number];

export default function NutritionScreen() {
  const { user } = useAuth();
  const [favs, setFavs] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>('Todos');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    store.getNutritionFavorites(user.id).then(setFavs);
  }, [user]);
  useFocusEffect(load);

  async function toggleFav(id: string) {
    if (!user) return;
    setFavs(await store.toggleNutritionFavorite(user.id, id));
  }

  const filters: Filter[] = ['Todos', ...NUTRITION_CATEGORIES, 'Favoritos'];
  const list = NUTRITION_TIPS.filter((t) => {
    if (filter === 'Todos') return true;
    if (filter === 'Favoritos') return favs.includes(t.id);
    return t.category === filter;
  });

  return (
    <Screen header={<AppHeader back title="Dicas nutricionais" />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Conteúdos sobre alimentação pensados para a rotina universitária.">
          Dicas nutricionais
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
                {f === 'Favoritos' ? (
                  <Feather name="heart" size={11} color={sel ? colors.white : colors.clay} />
                ) : null}
                <Text style={[styles.filterText, sel && { color: colors.white }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>
      </FadeIn>

      {list.length === 0 ? (
        <FadeIn delay={140}>
          <Card>
            <EmptyState
              icon={filter === 'Favoritos' ? 'heart' : 'inbox'}
              text={
                filter === 'Favoritos'
                  ? 'Você ainda não favoritou nenhuma dica. Toque no coração para salvar as suas preferidas.'
                  : 'Nenhum conteúdo disponível nesta categoria por enquanto.'
              }
            />
          </Card>
        </FadeIn>
      ) : (
        list.map((tip, i) => {
          const open = expanded === tip.id;
          const fav = favs.includes(tip.id);
          return (
            <FadeIn key={tip.id} delay={130 + i * 40}>
              <Card style={styles.tipCard}>
                <Pressable
                  onPress={() => setExpanded(open ? null : tip.id)}
                  accessibilityRole="button"
                  style={styles.tipHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={font.h3}>{tip.title}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.metaTag}>
                        <Feather name="tag" size={11} color={colors.inkSoft} />
                        <Text style={styles.metaText}>{tip.category}</Text>
                      </View>
                      <View style={styles.metaTag}>
                        <Feather name="book-open" size={11} color={colors.inkSoft} />
                        <Text style={styles.metaText}>{tip.readMin} min de leitura</Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => toggleFav(tip.id)}
                    hitSlop={10}
                    accessibilityLabel={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}>
                    <Feather
                      name="heart"
                      size={20}
                      color={fav ? colors.clay : colors.inkFaint}
                      style={fav ? styles.favActive : undefined}
                    />
                  </Pressable>
                </Pressable>

                {open ? (
                  <Text style={[font.body, styles.tipBody]}>{tip.body}</Text>
                ) : (
                  <Text style={[font.small, { marginTop: spacing.sm }]} numberOfLines={2}>
                    {tip.body}
                  </Text>
                )}
                <Pressable onPress={() => setExpanded(open ? null : tip.id)} hitSlop={6}>
                  <Text style={styles.readMore}>{open ? 'Mostrar menos' : 'Ler mais'}</Text>
                </Pressable>
              </Card>
            </FadeIn>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.inkSoft },
  tipCard: { padding: spacing.lg },
  tipHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  metaTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontFamily: fonts.sansMed, fontSize: 11.5, color: colors.inkSoft },
  favActive: { textShadowColor: colors.clay, textShadowRadius: 0 },
  tipBody: { marginTop: spacing.md },
  readMore: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.primary, marginTop: spacing.sm },
});
