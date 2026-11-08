export type AccessAction = 'VIEW_REPORT' | 'EXPORT_PDF'

export interface AccessLogEntry {
  viewerId: string
  viewerName: string
  action: AccessAction
  periodDays: number
  at: string
}

export interface AccessLogGroup {
  day: string
  title: string
  entries: AccessLogEntry[]
}

const pad = (n: number) => String(n).padStart(2, '0')
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function describeAccess(entry: AccessLogEntry): string {
  const what = entry.action === 'EXPORT_PDF' ? 'exportou o relatório em PDF' : 'viu o relatório'
  const period = entry.periodDays === 1 ? 'último dia' : `últimos ${entry.periodDays} dias`
  return `${what} (${period})`
}

export function timeOf(entry: AccessLogEntry): string {
  const d = new Date(entry.at)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function groupAccessByDay(entries: AccessLogEntry[], now: Date = new Date()): AccessLogGroup[] {
  const today = dayKey(now)
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
  const groups = new Map<string, AccessLogEntry[]>()
  for (const entry of [...entries].sort((a, b) => b.at.localeCompare(a.at))) {
    const key = dayKey(new Date(entry.at))
    groups.set(key, [...(groups.get(key) ?? []), entry])
  }
  return [...groups.entries()].map(([day, list]) => {
    const [y, m, d] = day.split('-')
    const title = day === today ? 'Hoje' : day === yesterday ? 'Ontem' : `${d}/${m}/${y}`
    return { day, title, entries: list }
  })
}
