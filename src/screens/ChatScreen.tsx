/** VitaU — chat com psicólogo parceiro, exclusivo VitaU+ (US14). */
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../auth';
import { AppHeader } from '../components/AppHeader';
import { Button, Card, FadeIn, Screen, SectionTitle } from '../components/ui';
import { Professional, PROFESSIONALS } from '../content';
import * as store from '../storage';
import { colors, font, fonts, gradients, radius, shadow, spacing } from '../theme';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

function dateFromOffset(off: number): string {
  const d = new Date();
  d.setDate(d.getDate() + off);
  return store.todayKey(d);
}

function friendlyDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  return `${WEEKDAYS[wd]}, ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

const PLUS_BENEFITS = [
  'Conversa por chat com psicólogos parceiros',
  'Agendamento de sessões em horários disponíveis',
  'Conteúdos exclusivos de saúde mental',
];

export default function ChatScreen() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<store.Plan>('free');
  const [appointments, setAppointments] = useState<store.Appointment[]>([]);
  const [scheduling, setScheduling] = useState<Professional | null>(null);
  const [chatting, setChatting] = useState<Professional | null>(null);

  const load = useCallback(() => {
    if (!user) return;
    store.getPlan(user.id).then(setPlan);
    store.getAppointments(user.id).then(setAppointments);
  }, [user]);
  useFocusEffect(load);

  async function activatePlus() {
    if (!user) return;
    await store.setPlan(user.id, 'plus');
    setPlan('plus');
  }

  // ---- Gate VitaU+ (plano free) ----
  if (plan !== 'plus') {
    return (
      <Screen header={<AppHeader back title="VitaU+" />}>
        <FadeIn delay={40}>
          <LinearGradient colors={gradients.indigo} style={styles.hero}>
            <View style={styles.plusBadge}>
              <Feather name="star" size={13} color={colors.white} />
              <Text style={styles.plusBadgeText}>VitaU+</Text>
            </View>
            <Text style={styles.heroTitle}>Suporte especializado em saúde mental</Text>
            <Text style={styles.heroSub}>
              Converse com psicólogos parceiros e agende sessões direto pelo app.
            </Text>
          </LinearGradient>
        </FadeIn>

        <FadeIn delay={110}>
          <Card>
            <Text style={font.h3}>O que está incluso</Text>
            {PLUS_BENEFITS.map((b) => (
              <View key={b} style={styles.benefitRow}>
                <Feather name="check-circle" size={16} color={colors.success} />
                <Text style={[font.body, { flex: 1 }]}>{b}</Text>
              </View>
            ))}
            <View style={{ marginTop: spacing.lg }}>
              <Button label="Ativar VitaU+ (demonstração)" icon="star" onPress={activatePlus} />
            </View>
          </Card>
        </FadeIn>

        <FadeIn delay={170}>
          <LgpdNotice />
        </FadeIn>
      </Screen>
    );
  }

  // ---- Plano ativo: profissionais + agendamentos ----
  return (
    <Screen header={<AppHeader back title="VitaU+" />}>
      <FadeIn delay={40}>
        <SectionTitle hint="Agende e converse com psicólogos parceiros do VitaU+.">
          Apoio psicológico
        </SectionTitle>
      </FadeIn>

      {appointments.length > 0 ? (
        <FadeIn delay={90}>
          <Card>
            <Text style={[font.h3, { marginBottom: spacing.sm }]}>Suas sessões</Text>
            {appointments.map((a) => {
              const pro = PROFESSIONALS.find((p) => p.id === a.proId);
              if (!pro) return null;
              return (
                <View key={a.id} style={styles.apptRow}>
                  <View style={styles.apptIcon}>
                    <Feather name="calendar" size={15} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={font.h3}>{pro.name}</Text>
                    <Text style={[font.small, { marginTop: 1 }]}>
                      {friendlyDate(a.date)} · {a.time}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setChatting(pro)}
                    style={({ pressed }) => [styles.chatBtn, pressed && { opacity: 0.7 }]}>
                    <Feather name="message-circle" size={14} color={colors.white} />
                    <Text style={styles.chatBtnText}>Chat</Text>
                  </Pressable>
                </View>
              );
            })}
          </Card>
        </FadeIn>
      ) : null}

      <FadeIn delay={130}>
        <Text style={[font.h2, { marginTop: spacing.xs }]}>Profissionais parceiros</Text>
      </FadeIn>

      {PROFESSIONALS.map((pro, i) => (
        <FadeIn key={pro.id} delay={160 + i * 50}>
          <Card style={styles.proCard}>
            <View style={styles.proTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{pro.name.split(' ')[1]?.[0] ?? 'P'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={font.h3}>{pro.name}</Text>
                <Text style={[font.small, { marginTop: 1 }]}>{pro.specialty}</Text>
                <Text style={styles.crp}>{pro.crp}</Text>
              </View>
            </View>
            <Text style={[font.body, { marginTop: spacing.sm }]}>{pro.bio}</Text>
            <View style={{ marginTop: spacing.md }}>
              <Button label="Agendar sessão" icon="calendar" onPress={() => setScheduling(pro)} />
            </View>
          </Card>
        </FadeIn>
      ))}

      <FadeIn delay={400}>
        <LgpdNotice />
      </FadeIn>

      <Modal
        visible={!!scheduling}
        animationType="slide"
        transparent
        onRequestClose={() => setScheduling(null)}>
        {scheduling ? (
          <ScheduleSheet
            pro={scheduling}
            onClose={() => setScheduling(null)}
            onScheduled={() => {
              setScheduling(null);
              load();
            }}
          />
        ) : null}
      </Modal>

      <Modal visible={!!chatting} animationType="slide" onRequestClose={() => setChatting(null)}>
        {chatting ? <ChatView pro={chatting} onClose={() => setChatting(null)} /> : null}
      </Modal>
    </Screen>
  );
}

function LgpdNotice() {
  return (
    <View style={styles.lgpd}>
      <Feather name="shield" size={15} color={colors.inkSoft} />
      <Text style={styles.lgpdText}>
        Seus dados e conversas são tratados em conformidade com a LGPD e com as diretrizes do
        Conselho Federal de Psicologia (CFP). Em situações de emergência, ligue para o CVV (188).
      </Text>
    </View>
  );
}

function ScheduleSheet({
  pro,
  onClose,
  onScheduled,
}: {
  pro: Professional;
  onClose: () => void;
  onScheduled: () => void;
}) {
  const { user } = useAuth();
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const dates = pro.slotDayOffsets.map(dateFromOffset);

  async function confirm() {
    if (!user || !date || !time) return;
    await store.addAppointment(user.id, pro.id, date, time);
    onScheduled();
  }

  return (
    <View style={styles.sheetBackdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={font.h2}>Agendar com {pro.name.split(' ')[0]}</Text>
        <Text style={[font.small, { marginTop: 2 }]}>{pro.specialty}</Text>

        <Text style={styles.sheetLabel}>Escolha o dia</Text>
        <View style={styles.optRow}>
          {dates.map((d) => {
            const sel = date === d;
            return (
              <Pressable
                key={d}
                onPress={() => setDate(d)}
                style={({ pressed }) => [
                  styles.optChip,
                  sel && styles.optChipActive,
                  pressed && { opacity: 0.7 },
                ]}>
                <Text style={[styles.optText, sel && { color: colors.white }]}>
                  {friendlyDate(d)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sheetLabel}>Escolha o horário</Text>
        <View style={styles.optRow}>
          {pro.times.map((t) => {
            const sel = time === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTime(t)}
                style={({ pressed }) => [
                  styles.optChip,
                  sel && styles.optChipActive,
                  pressed && { opacity: 0.7 },
                ]}>
                <Text style={[styles.optText, sel && { color: colors.white }]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Button
            label="Confirmar agendamento"
            icon="check"
            disabled={!date || !time}
            onPress={confirm}
          />
        </View>
      </View>
    </View>
  );
}

function ChatView({ pro, onClose }: { pro: Professional; onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<store.ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const load = useCallback(() => {
    if (!user) return;
    store.getChat(user.id, pro.id).then((m) => {
      if (m.length === 0) {
        // mensagem de boas-vindas do profissional
        store
          .addChatMessage(
            user.id,
            pro.id,
            'pro',
            `Olá! Sou ${pro.name}. Como posso te ajudar hoje? Pode me contar um pouco sobre o que está sentindo.`,
          )
          .then(setMessages);
      } else {
        setMessages(m);
      }
    });
  }, [user, pro]);
  useFocusEffect(load);

  async function send() {
    if (!user || draft.trim().length === 0) return;
    const text = draft.trim();
    setDraft('');
    const updated = await store.addChatMessage(user.id, pro.id, 'student', text);
    setMessages(updated);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    // resposta simulada do profissional
    setTimeout(async () => {
      const reply = await store.addChatMessage(
        user.id,
        pro.id,
        'pro',
        'Entendo. Obrigado por compartilhar. Vamos conversar sobre isso na nossa sessão — enquanto isso, lembre-se de respirar com calma. 🌿',
      );
      setMessages([...reply]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }, 1200);
  }

  return (
    <Screen scroll={false} header={<HeaderBar pro={pro} onClose={onClose} />}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.sm }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {messages.map((m) => {
            const mine = m.from === 'student';
            return (
              <View key={m.id} style={[styles.bubbleRow, mine && { justifyContent: 'flex-end' }]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubblePro]}>
                  <Text style={[styles.bubbleText, mine && { color: colors.white }]}>{m.text}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Escreva uma mensagem…"
            placeholderTextColor={colors.inkFaint}
            multiline
            style={styles.chatInput}
          />
          <Pressable
            onPress={send}
            disabled={draft.trim().length === 0}
            style={({ pressed }) => [
              styles.sendBtn,
              draft.trim().length === 0 && { opacity: 0.4 },
              pressed && { transform: [{ scale: 0.92 }] },
            ]}>
            <Feather name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function HeaderBar({ pro, onClose }: { pro: Professional; onClose: () => void }) {
  return (
    <View style={styles.chatHeader}>
      <Pressable onPress={onClose} hitSlop={10} style={styles.chatBack}>
        <Feather name="chevron-left" size={22} color={colors.primary} />
      </Pressable>
      <View style={styles.avatarSm}>
        <Text style={styles.avatarSmText}>{pro.name.split(' ')[1]?.[0] ?? 'P'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={font.h3}>{pro.name}</Text>
        <Text style={font.tiny}>{pro.crp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: spacing.xl, ...shadow.card },
  plusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  plusBadgeText: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.white },
  heroTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 23,
    color: colors.white,
    marginTop: spacing.md,
    lineHeight: 30,
  },
  heroSub: { fontFamily: fonts.sans, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 21 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  apptIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  chatBtnText: { fontFamily: fonts.sansBold, fontSize: 12.5, color: colors.white },
  proCard: { padding: spacing.lg },
  proTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.indigoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fonts.serifBold, fontSize: 22, color: colors.indigo },
  crp: { fontFamily: fonts.sansMed, fontSize: 11.5, color: colors.inkFaint, marginTop: 2 },
  lgpd: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSunk,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  lgpdText: { ...font.small, flex: 1 },
  // sheet
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,30,25,0.45)' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetLabel: { ...font.label, color: colors.ink, marginTop: spacing.xl, marginBottom: spacing.sm },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.inkSoft },
  // chat
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    ...shadow.soft,
  },
  chatBack: { padding: 2 },
  avatarSm: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.indigoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmText: { fontFamily: fonts.serifBold, fontSize: 16, color: colors.indigo },
  bubbleRow: { flexDirection: 'row' },
  bubble: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.md },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubblePro: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, ...shadow.soft },
  bubbleText: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.ink, lineHeight: 21 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  chatInput: {
    flex: 1,
    maxHeight: 110,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: fonts.sans,
    fontSize: 14.5,
    color: colors.ink,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
});
