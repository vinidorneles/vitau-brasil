/**
 * VitaU — agendamento de alertas locais de rotina de sono (US10).
 * Usa notificações locais do expo-notifications. A entrega respeita
 * automaticamente o modo "não perturbe" / configurações do sistema operacional.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { SleepAlertConfig } from './storage';

const TAG = 'vitau-sleep-alert';

/** Agendamento de notificações não é suportado no navegador (web). */
export const notificationsSupported = Platform.OS !== 'web';

// Exibe a notificação mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }) as any,
});

/** Solicita permissão de notificações; retorna se foi concedida. */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

/** Cancela apenas os alertas de sono criados por este app. */
export async function cancelSleepAlerts(): Promise<void> {
  if (!notificationsSupported) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => (n.content.data as any)?.tag === TAG)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

/**
 * Reagenda os alertas conforme a configuração: um lembrete semanal por
 * dia da semana ativo, no horário desejado de dormir.
 */
export async function rescheduleSleepAlerts(config: SleepAlertConfig): Promise<void> {
  if (!notificationsSupported) return;
  await cancelSleepAlerts();
  if (!config.enabled || config.days.length === 0) return;

  const [h, m] = config.time.split(':').map(Number);
  await Promise.all(
    config.days.map((day) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hora de desacelerar 🌙',
          body: 'Mantenha sua rotina de sono — que tal começar a se preparar para dormir?',
          data: { tag: TAG },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: day + 1, // expo: 1=domingo .. 7=sábado (JS getDay: 0..6)
          hour: h,
          minute: m,
        },
      }),
    ),
  );
}
