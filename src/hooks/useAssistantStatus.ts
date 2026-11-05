import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAssistantStatus } from '../services/assistantApi'
import type { AssistantStatus } from '../services/assistantApi'

const OFF: AssistantStatus = { enabled: false, model: null }

export function useAssistantStatus(): AssistantStatus {
  const { accessToken } = useAuth()
  const [status, setStatus] = useState<AssistantStatus>(OFF)

  useEffect(() => {
    if (!accessToken) return
    let alive = true
    fetchAssistantStatus(accessToken)
      .then((s) => alive && setStatus(s))
      .catch(() => alive && setStatus(OFF))
    return () => {
      alive = false
    }
  }, [accessToken])

  return accessToken ? status : OFF
}
