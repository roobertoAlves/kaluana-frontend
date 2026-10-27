import { Platform } from 'react-native'
import type { TimestampTrigger } from '@notifee/react-native'
import type { Reminder, ReminderInsistence } from '../types/domain'

/**
 * Adaptador de notificações locais (RNF2). Usa Notifee, como na Seção 2.4.
 * Todo o código nativo fica neste arquivo: trocar de biblioteca não afeta telas.
 * Requer dev build (expo-dev-client); não roda no Expo Go.
 *
 * Insistência = notificações de repetição após a principal:
 *  LOW: nenhuma | MEDIUM: +5 e +10 min | HIGH: +2, +4, +6 e +8 min.
 */
type NotifeeModule = typeof import('@notifee/react-native')

/**
 * Carregamento tardio: no Expo Go (sem código nativo do Notifee) o app abre
 * normalmente e só o agendamento falha, com erro tratado pelas telas.
 */
function loadNotifee(): NotifeeModule | null {
  try {
    return require('@notifee/react-native') as NotifeeModule
  } catch {
    return null
  }
}

function needNotifee(): NotifeeModule {
  const m = loadNotifee()
  if (!m) throw new Error('NOTIFEE_UNAVAILABLE')
  return m
}

const CHANNEL_ID = 'lembretes'
const FOLLOW_UPS: Record<ReminderInsistence, number[]> = { LOW: [], MEDIUM: [5, 10], HIGH: [2, 4, 6, 8] }

export async function ensureNotificationSetup(): Promise<boolean> {
  const { default: notifee, AndroidImportance } = needNotifee()
  const settings = await notifee.requestPermission()
  // authorizationStatus: 0 negado, 1 autorizado, 2 provisório
  if (settings.authorizationStatus === 0) return false
  if (Platform.OS === 'android') {
    await notifee.createChannel({ id: CHANNEL_ID, name: 'Lembretes', importance: AndroidImportance.HIGH })
  }
  return true
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

export async function cancelReminder(r: Reminder): Promise<void> {
  const m = loadNotifee()
  if (!m) return
  const notifee = m.default
  await Promise.all(idsFor(r).map((id) => notifee.cancelTriggerNotification(id)))
}

export async function scheduleReminder(r: Reminder): Promise<void> {
  const { default: notifee, RepeatFrequency, TriggerType } = needNotifee()
  await cancelReminder(r)
  if (!r.enabled) return

  const first = nextFireTime(r.time, r.leadMinutes)
  const offsets = [0, ...FOLLOW_UPS[r.insistence]]
  const repeat =
    r.frequency === 'DAILY' ? RepeatFrequency.DAILY : r.frequency === 'WEEKLY' ? RepeatFrequency.WEEKLY : undefined

  await Promise.all(
    offsets.map((min, i) => {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: first.getTime() + min * 60_000,
        repeatFrequency: repeat,
        alarmManager: { allowWhileIdle: true },
      }
      return notifee.createTriggerNotification(
        {
          id: `${r.id}:${i}`,
          title: r.title,
          body: r.leadMinutes > 0 ? `Começa em ${r.leadMinutes} min (${r.time}).` : `É agora (${r.time}).`,
          data: { kind: 'reminder', title: r.title, reminderId: r.id },
          android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } },
        },
        trigger,
      )
    }),
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
  const { default: notifee, TriggerType } = needNotifee()
  await notifee.createTriggerNotification(
    { id, title, body, data, android: { channelId: CHANNEL_ID, pressAction: { id: 'default' } } },
    { type: TriggerType.TIMESTAMP, timestamp: at, alarmManager: { allowWhileIdle: true } },
  )
}

export async function cancelSessionAlerts(): Promise<void> {
  const m = loadNotifee()
  if (!m) return
  await Promise.all(SESSION_IDS.map((id) => m.default.cancelTriggerNotification(id)))
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

function toTap(n: { title?: string; data?: Record<string, unknown> } | undefined | null): NotificationTap | null {
  const kind = n?.data?.kind
  if (kind !== 'reminder' && kind !== 'session') return null
  return { kind, title: String(n?.data?.title ?? n?.title ?? 'Lembrete'), reminderId: n?.data?.reminderId ? String(n.data.reminderId) : undefined }
}

/** Toque na notificação com o app aberto. Devolve a função de cancelamento. */
export function listenNotificationTaps(onTap: (t: NotificationTap) => void): () => void {
  const m = loadNotifee()
  if (!m) return () => {}
  return m.default.onForegroundEvent(({ type, detail }) => {
    if (type !== m.EventType.PRESS) return
    const tap = toTap(detail.notification)
    if (tap) onTap(tap)
  })
}

/** Toque que abriu o app a partir do fechado. */
export async function getInitialTap(): Promise<NotificationTap | null> {
  const m = loadNotifee()
  if (!m) return null
  try {
    const initial = await m.default.getInitialNotification()
    return toTap(initial?.notification)
  } catch {
    return null
  }
}
