import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { AndroidImportance } from 'expo-notifications'
import type { Reminder, ReminderInsistence } from '../types/domain'

/**
 * Adaptador de notificações locais (RNF2) sobre o expo-notifications.
 * Todo o código nativo fica neste arquivo: trocar de biblioteca não afeta telas.
 * Funciona no build de desenvolvimento; no Expo Go, notificações locais podem
 * não estar disponíveis, então toda chamada falha de forma silenciosa.
 *
 * Insistência = notificações de repetição após a principal:
 *  LOW: nenhuma | MEDIUM: +5 e +10 min | HIGH: +2, +4, +6 e +8 min.
 */

const CHANNEL_ID = 'lembretes'
const FOLLOW_UPS: Record<ReminderInsistence, number[]> = { LOW: [], MEDIUM: [5, 10], HIGH: [2, 4, 6, 8] }

// Com o app aberto, a notificação aparece como banner e toca o som.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
} catch {
  // Sem módulo nativo (ex.: web): segue sem notificações.
}

export async function ensureNotificationSetup(): Promise<boolean> {
  try {
    const current = await Notifications.getPermissionsAsync()
    const status = current.granted ? current : await Notifications.requestPermissionsAsync()
    if (!status.granted) return false
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, { name: 'Lembretes', importance: AndroidImportance.HIGH })
    }
    return true
  } catch {
    return false
  }
}

/** Próximo horário em que `time` ("HH:MM") ocorre, menos a antecedência. */
export function nextFireTime(time: string, leadMinutes: number, now: Date = new Date()): Date {
  const [h, m] = time.split(':').map(Number)
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  let fire = new Date(target.getTime() - leadMinutes * 60_000)
  while (fire.getTime() <= now.getTime()) fire = new Date(fire.getTime() + 24 * 60 * 60_000)
  return fire
}

const idsFor = (r: Reminder) => [0, ...FOLLOW_UPS.HIGH].map((_, i) => `${r.id}:${i}`)

async function cancel(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})))
}

export async function cancelReminder(r: Reminder): Promise<void> {
  await cancel(idsFor(r))
}

/** Gatilho de um disparo: diário/semanal repete no mesmo horário; único dispara uma vez. */
function triggerFor(r: Reminder, at: Date): Notifications.NotificationTriggerInput {
  const base = Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}
  if (r.frequency === 'DAILY') {
    return { ...base, type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: at.getHours(), minute: at.getMinutes() }
  }
  if (r.frequency === 'WEEKLY') {
    // weekday: 1 = domingo ... 7 = sábado
    return { ...base, type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: at.getDay() + 1, hour: at.getHours(), minute: at.getMinutes() }
  }
  return { ...base, type: Notifications.SchedulableTriggerInputTypes.DATE, date: at }
}

export async function scheduleReminder(r: Reminder): Promise<void> {
  await cancelReminder(r)
  if (!r.enabled) return

  const first = nextFireTime(r.time, r.leadMinutes)
  const offsets = [0, ...FOLLOW_UPS[r.insistence]]
  await Promise.all(
    offsets.map((min, i) =>
      Notifications.scheduleNotificationAsync({
        identifier: `${r.id}:${i}`,
        content: {
          title: r.title,
          body: r.leadMinutes > 0 ? `Começa em ${r.leadMinutes} min (${r.time}).` : `É agora (${r.time}).`,
          data: { kind: 'reminder', title: r.title, reminderId: r.id },
        },
        trigger: triggerFor(r, new Date(first.getTime() + min * 60_000)),
      }),
    ),
  )
}

/** Reagenda todos ao abrir o app (cobre reinício do aparelho e lembretes únicos vencidos). */
export async function rescheduleAll(reminders: Reminder[]): Promise<void> {
  await Promise.all(reminders.map((r) => scheduleReminder(r).catch(() => {})))
}

// ---------------------------------------------------------------------------
// Sessão do temporizador, adiar e toque na notificação
// ---------------------------------------------------------------------------
const SESSION_IDS = Array.from({ length: 12 }, (_, i) => `session:${i}`)

async function fireAt(id: string, title: string, body: string, at: number, data: Record<string, string>) {
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body, data },
    trigger: {
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(at),
    },
  })
}

export async function cancelSessionAlerts(): Promise<void> {
  await cancel(SESSION_IDS)
}

/** Aviso de fim da sessão e, se pedido, de beber água a cada 20 min. */
export async function scheduleSessionAlerts(task: string, endsAt: number, water: boolean): Promise<void> {
  await cancelSessionAlerts()
  const now = Date.now()
  if (endsAt <= now) return
  await fireAt('session:0', 'Sessão concluída', task, endsAt, { kind: 'session' })
  if (water) {
    for (let i = 1; i <= 10; i++) {
      const at = now + i * 20 * 60_000
      if (at >= endsAt - 60_000) break
      await fireAt(`session:${i}`, 'Beber água', 'Uma pausa curta para um copo de água.', at, { kind: 'reminder', title: 'Beber água' })
    }
  }
}

/** "Adiar 10 min" da tela de lembrete disparado. */
export async function snoozeReminder(title: string, minutes = 10): Promise<void> {
  await ensureNotificationSetup()
  await fireAt(`snooze:${Date.now()}`, title, `Adiado por ${minutes} min.`, Date.now() + minutes * 60_000, { kind: 'reminder', title })
}

export interface NotificationTap {
  kind: 'reminder' | 'session'
  title: string
  reminderId?: string
}

function toTap(n: Notifications.Notification | null | undefined): NotificationTap | null {
  const content = n?.request.content
  const data = (content?.data ?? {}) as Record<string, unknown>
  const kind = data.kind
  if (kind !== 'reminder' && kind !== 'session') return null
  return { kind, title: String(data.title ?? content?.title ?? 'Lembrete'), reminderId: data.reminderId ? String(data.reminderId) : undefined }
}

/** Toque na notificação com o app aberto. Devolve a função de cancelamento. */
export function listenNotificationTaps(onTap: (t: NotificationTap) => void): () => void {
  try {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const tap = toTap(response.notification)
      if (tap) onTap(tap)
    })
    return () => sub.remove()
  } catch {
    return () => {}
  }
}

/** Toque que abriu o app a partir do fechado. */
export async function getInitialTap(): Promise<NotificationTap | null> {
  try {
    const last = await Notifications.getLastNotificationResponseAsync()
    return toTap(last?.notification)
  } catch {
    return null
  }
}
