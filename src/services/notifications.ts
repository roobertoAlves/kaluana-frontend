import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { AndroidImportance } from 'expo-notifications'
import { nextFireTime } from '../features/reminders/reminderModel'
import type { Reminder, ReminderInsistence } from '../types/domain'

const CHANNEL_ID = 'lembretes'
const FOLLOW_UPS: Record<ReminderInsistence, number[]> = { LOW: [], MEDIUM: [5, 10], HIGH: [2, 4, 6, 8] }

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
  })
} catch {}

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

export { nextFireTime }

const idsFor = (r: Reminder) => [0, ...FOLLOW_UPS.HIGH].map((_, i) => `${r.id}:${i}`)

async function cancel(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})))
}

export async function cancelReminder(r: Reminder): Promise<void> {
  await cancel(idsFor(r))
}

function triggerFor(r: Reminder, at: Date): Notifications.NotificationTriggerInput {
  const base = Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}
  if (r.frequency === 'DAILY') {
    return { ...base, type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: at.getHours(), minute: at.getMinutes() }
  }
  if (r.frequency === 'WEEKLY') {
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

export async function rescheduleAll(reminders: Reminder[]): Promise<void> {
  await Promise.all(reminders.map((r) => scheduleReminder(r).catch(() => {})))
}

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

export async function getInitialTap(): Promise<NotificationTap | null> {
  try {
    const last = await Notifications.getLastNotificationResponseAsync()
    return toTap(last?.notification)
  } catch {
    return null
  }
}
