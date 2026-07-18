import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
// Vite executes this shared server-side ESM module at runtime.
// @ts-expect-error JavaScript resolver has no generated declaration file.
import { resolveFormFields } from './server/form-resolver.mjs'
// @ts-expect-error JavaScript local browser agent has no generated declaration file.
import { fillWithLocalBrowser } from './server/local-browser-agent.mjs'

function readJson(request: import('node:http').IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = ''
    request.on('data', (chunk) => { body += chunk })
    request.on('end', () => { try { resolve(JSON.parse(body)) } catch { reject(new Error('Invalid JSON request.')) } })
    request.on('error', reject)
  })
}

function localAiResolver(apiKey: string, model: string): Plugin {
  return {
    name: 'snapfill-local-ai-resolver',
    configureServer(server) {
      server.middlewares.use('/api/resolve-form', async (request, response) => {
        if (request.method !== 'POST') { response.statusCode = 405; response.end(); return }
        try {
          const payload = await readJson(request)
          const result = await resolveFormFields({
            apiKey,
            model,
            fields: (payload as { fields?: unknown[] }).fields,
            availableKeys: (payload as { availableKeys?: string[] }).availableKeys,
          })
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify(result))
        } catch (error) {
          response.statusCode = error instanceof Error && error.message.includes('OPENAI_API_KEY') ? 503 : 400
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'AI resolver failed.' }))
        }
      })
    },
  }
}

function localBrowserAgent(): Plugin {
  return {
    name: 'snapfill-local-browser-agent',
    configureServer(server) {
      server.middlewares.use('/api/local-browser-fill', async (request, response) => {
        if (request.method !== 'POST') { response.statusCode = 405; response.end(); return }
        try {
          const payload = await readJson(request) as { url?: string; profile?: Record<string, string>; includeOptional?: boolean }
          const result = await fillWithLocalBrowser({
            url: payload.url,
            profile: payload.profile,
            includeOptional: payload.includeOptional,
          })
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify(result))
        } catch (error) {
          response.statusCode = 400
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Local browser agent failed.' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localAiResolver(env.OPENAI_API_KEY, env.OPENAI_MODEL || 'gpt-5.6-terra'), localBrowserAgent()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
