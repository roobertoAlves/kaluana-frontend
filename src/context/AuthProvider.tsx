import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthResponse, AuthenticatedUser } from '../types'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'
import { logout, refreshSession } from '../services/api'
import { setSessionRefresher } from '../services/http'

/**
 * Sessão em memória (estado React), não persistida em disco, mesma
 * decisão do projeto web (reduzir superfície de risco). Isso significa
 * que fechar o app completamente exige logar de novo. Se isso passar a
 * incomodar, o upgrade natural é expo-secure-store para o token.
 *
 * RNF4: o token de acesso dura 30 min. Quando a API responde 401, o
 * http.ts pede aqui um token novo (refresh) e repete o pedido, sem a
 * pessoa perceber. Se a renovação falhar, a sessão acaba e onExpired leva
 * para o login.
 */
export function AuthProvider({ children, onExpired }: { children: ReactNode; onExpired?: () => void }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const refreshToken = useRef<string | null>(null)
  // Várias telas podem receber 401 juntas: uma renovação só para todas.
  const inFlight = useRef<Promise<string | null> | null>(null)
  const expiredRef = useRef(onExpired)

  useEffect(() => {
    expiredRef.current = onExpired
  }, [onExpired])

  useEffect(() => {
    function apply(auth: AuthResponse) {
      setUser(auth.user)
      setAccessToken(auth.accessToken)
      refreshToken.current = auth.refreshToken ?? null
    }

    async function renew(): Promise<string | null> {
      const current = refreshToken.current
      if (!current) return null
      try {
        const auth = await refreshSession(current)
        apply(auth)
        return auth.accessToken
      } catch {
        refreshToken.current = null
        setUser(null)
        setAccessToken(null)
        expiredRef.current?.()
        return null
      }
    }

    setSessionRefresher(() => {
      inFlight.current ??= renew().finally(() => {
        inFlight.current = null
      })
      return inFlight.current
    })
    return () => setSessionRefresher(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      setSession: (auth) => {
        setUser(auth.user)
        setAccessToken(auth.accessToken)
        refreshToken.current = auth.refreshToken ?? null
      },
      clearSession: () => {
        // Sair revoga o token de renovação no servidor (melhor esforço).
        const current = refreshToken.current
        refreshToken.current = null
        if (current) void logout(current).catch(() => {})
        setUser(null)
        setAccessToken(null)
      },
    }),
    [user, accessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
