const REQUEST_CHANNEL = 'snapfill-agent-request'
const RESPONSE_CHANNEL = 'snapfill-agent-response'

window.addEventListener('message', async (event) => {
  if (event.source !== window || event.origin !== window.location.origin) return
  const request = event.data
  if (request?.channel !== REQUEST_CHANNEL || request.type !== 'webAgentFill' || typeof request.requestId !== 'string') return

  try {
    const response = await chrome.runtime.sendMessage({ type: request.type, ...request.payload })
    window.postMessage({ channel: RESPONSE_CHANNEL, requestId: request.requestId, ...response }, window.location.origin)
  } catch (error) {
    window.postMessage({ channel: RESPONSE_CHANNEL, requestId: request.requestId, ok: false, error: error instanceof Error ? error.message : 'The local agent is unavailable.' }, window.location.origin)
  }
})
