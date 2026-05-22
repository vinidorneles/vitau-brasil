/** VitaU — gráfico de barras leve (sem dependências externas). */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';

export type Bar = { label: string; value: number; color: string; caption?: string };

export function BarChart({
  data,
  maxValue,
  height = 150,
}: {
  data: Bar[];
  maxValue?: number;
  height?: number;
}) {
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));
  const trackHeight = height - 38;

  return (
    <View style={[styles.row, { height }]}>
      {data.map((d, i) => {
        const ratio = d.value > 0 ? Math.min(1, d.value / max) : 0;
        const barHeight = ratio > 0 ? Math.max(8, ratio * trackHeight) : 0;
        const filled = d.value > 0;
        return (
          <View key={i} style={styles.col}>
            <Text style={[styles.caption, !filled && { opacity: 0 }]} numberOfLines={1}>
              {d.caption ?? ''}
            </Text>
            <View style={styles.track}>
              {filled ? (
                <View style={[styles.bar, { height: barHeight, backgroundColor: d.color }]}>
                  <View style={styles.barGloss} />
                </View>
              ) : (
                <View style={styles.barEmpty} />
              )}
            </View>
            <Text style={[styles.label, filled && { color: colors.inkSoft }]} numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 7 },
  col: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  track: {
    flex: 1,
    width: '70%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    overflow: 'hidden',
  },
  barGloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  barEmpty: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.hairline,
  },
  caption: { fontFamily: fonts.sansSemi, fontSize: 11, color: colors.inkSoft, marginBottom: 5, height: 15 },
  label: { fontFamily: fonts.sansMed, fontSize: 11, color: colors.inkFaint, marginTop: 7 },
});
