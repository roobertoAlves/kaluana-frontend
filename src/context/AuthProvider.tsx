import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthenticatedUser } from '../types'
import { AuthContext } from './AuthContext'
import type { AuthContextValue } from './AuthContext'

/**
 * Sessão em memória (estado React), não persistida em disco, mesma
 * decisão do projeto web (reduzir superfície de risco). Isso significa
 * que fechar o app completamente exige logar de novo. Se isso passar a
 * incomodar, o upgrade natural é expo-secure-store para o token.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      setSession: (auth) => {
        setUser(auth.user)
        setAccessToken(auth.accessToken)
      },
      clearSession: () => {
        setUser(null)
        setAccessToken(null)
      },
    }),
    [user, accessToken],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
