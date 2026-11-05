export const DEFAULT_API_PORT = '8080'

const TUNNEL_HOSTS = ['.exp.direct', '.ngrok.io', '.ngrok-free.app', '.ngrok.app']

export function apiUrlFromHost(host: string | null | undefined, port: string = DEFAULT_API_PORT): string {
  const hostname = hostnameOf(host)
  if (!hostname || TUNNEL_HOSTS.some((t) => hostname.endsWith(t))) return `http://localhost:${port}`
  return `http://${hostname}:${port}`
}

export function hostnameOf(host: string | null | undefined): string | null {
  if (!host) return null
  const withoutProtocol = host.trim().replace(/^[a-z]+:\/\//i, '')
  const authority = withoutProtocol.split('/')[0]
  const hostname = authority.replace(/:\d+$/, '')
  return hostname || null
}

export function normalizeApiUrl(input: string): string | null {
  const value = input.trim().replace(/\/+$/, '')
  if (!value) return null
  const withProtocol = /^https?:\/\//i.test(value) ? value : `http://${value}`
  const hostname = hostnameOf(withProtocol)
  if (!hostname || /\s/.test(hostname)) return null
  return /:\d+$/.test(withProtocol.split('/').slice(0, 3).join('/')) || /^https:/i.test(withProtocol) ? withProtocol : `${withProtocol}:${DEFAULT_API_PORT}`
}
