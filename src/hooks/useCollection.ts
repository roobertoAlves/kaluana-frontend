import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../services/http'
import { readJson, writeJson } from '../services/storage'

/**
 * Como uma coleção conversa com a API. Cada feature declara o seu
 * (ex.: eventsApi.eventsSource). `update`/`remove` são opcionais para
 * recursos que a API só cria (ou cria e atualiza pela mesma rota).
 */
export interface CollectionRemote<T> {
  list: (token: string) => Promise<T[]>
  create: (token: string, item: T) => Promise<T>
  update?: (token: string, item: T) => Promise<T>
  remove?: (token: string, id: string) => Promise<void>
}

export interface CollectionSource<T> {
  name: string
  remote?: CollectionRemote<T>
}

/**
 * Lista do usuário, recarregada sempre que a tela ganha foco.
 * Logado: a API é a fonte da verdade e o AsyncStorage vira cache (a lista
 * aparece mesmo sem rede). Sem login: só armazenamento local, como antes.
 * Mutações devolvem o item salvo (com o id do servidor) ou null se falharam.
 */
export function useCollection<T extends { id: string }>(source: string | CollectionSource<T>) {
  const { name, remote } = typeof source === 'string' ? { name: source, remote: undefined } : source
  const { user, accessToken } = useAuth()
  const userId = user?.id ?? 'anon'
  const api = remote && accessToken ? { remote, token: accessToken } : null
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const ref = useRef<T[]>([])

  const persist = useCallback(
    async (next: T[]) => {
      ref.current = next
      setItems(next)
      await writeJson(userId, name, next)
    },
    [userId, name],
  )

  const reload = useCallback(async () => {
    const cached = await readJson<T[]>(userId, name, [])
    ref.current = cached
    setItems(cached)
    if (api) {
      try {
        await persist(await api.remote.list(api.token))
        setError(null)
      } catch (e) {
        setError(errorMessage(e, 'Sem conexão. Mostrando os últimos dados salvos.'))
      }
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, name, accessToken, persist])

  useFocusEffect(
    useCallback(() => {
      void reload()
    }, [reload]),
  )

  /** Executa a chamada remota (se houver) e só então atualiza a lista. */
  const run = useCallback(async <R,>(call: (() => Promise<R>) | null, fallback: R, apply: (result: R) => T[]): Promise<R | null> => {
    try {
      const result = call ? await call() : fallback
      await persist(apply(result))
      setError(null)
      return result
    } catch (e) {
      setError(errorMessage(e))
      return null
    }
  }, [persist])

  const add = (item: T) =>
    run(api && (() => api.remote.create(api.token, item)), item, (saved) => [saved, ...ref.current])

  const upsert = (item: T) => {
    const exists = ref.current.some((x) => x.id === item.id)
    const save = exists && api?.remote.update ? api.remote.update : api?.remote.create
    return run(api && save ? () => save(api.token, item) : null, item, (saved) =>
      exists ? ref.current.map((x) => (x.id === item.id ? saved : x)) : [saved, ...ref.current],
    )
  }

  const remove = async (id: string) => {
    const removeRemote = api?.remote.remove
    const ok = await run(api && removeRemote ? () => removeRemote(api.token, id) : null, undefined, () =>
      ref.current.filter((x) => x.id !== id),
    )
    return ok !== null
  }

  /**
   * Mutação própria da feature (ex.: microetapas): com conta, chama a API e usa
   * o item devolvido; sem conta, aplica {@code local}. Substitui o item pelo id.
   */
  const mutate = (remoteCall: (token: string) => Promise<T>, local: T) =>
    run(api ? () => remoteCall(api.token) : null, local, (saved) => ref.current.map((x) => (x.id === saved.id ? saved : x)))

  return {
    items,
    loading,
    error,
    clearError: () => setError(null),
    reload,
    add,
    upsert,
    remove,
    mutate,
    replaceAll: persist,
  }
}
