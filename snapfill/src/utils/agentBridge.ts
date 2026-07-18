export interface AgentProfile {
  [key: string]: string
}

export interface AgentFillResult {
  filled: number
  total: number
  hostname: string
  strategy: 'ai' | 'heuristic' | 'local-recipe' | 'local-browser'
}

interface BridgeResponse<T> {
  channel: 'snapfill-agent-response'
  requestId: string
  ok: boolean
  data?: T
  error?: string
}

function extensionRequest<T>(type: string, payload: Record<string, unknown>, timeoutMs: number) {
  const requestId = crypto.randomUUID()

  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', receive)
      reject(new Error('SnapFill Agent was not detected.'))
    }, timeoutMs)

    function receive(event: MessageEvent<unknown>) {
      if (event.source !== window || event.origin !== window.location.origin) return
      const response = event.data as BridgeResponse<T>
      if (response?.channel !== 'snapfill-agent-response' || response.requestId !== requestId) return
      window.clearTimeout(timeout)
      window.removeEventListener('message', receive)
      if (response.ok && response.data) resolve(response.data)
      else reject(new Error(response.error ?? 'The local agent could not fill this form.'))
    }

    window.addEventListener('message', receive)
    window.postMessage({
      channel: 'snapfill-agent-request',
      requestId,
      type,
      payload,
    }, window.location.origin)
  })
}

async function localBrowserFallback(url: string, profile: AgentProfile, includeOptional: boolean) {
  const response = await fetch('/api/local-browser-fill', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, profile, includeOptional }),
  })
  const payload = await response.json() as AgentFillResult & { error?: string }
  if (!response.ok) throw new Error(payload.error ?? 'The local browser agent could not fill this form.')
  return payload
}

export async function fillWithLocalAgent(url: string, profile: AgentProfile, document: { id: string; displayName: string }, includeOptional: boolean) {
  try {
    await extensionRequest('status', {}, 1500)
    return await extensionRequest<AgentFillResult>('webAgentFill', { url, profile, document, includeOptional }, 45000)
  } catch (error) {
    if (error instanceof Error && error.message !== 'SnapFill Agent was not detected.') throw error
    return localBrowserFallback(url, profile, includeOptional)
  }
}
