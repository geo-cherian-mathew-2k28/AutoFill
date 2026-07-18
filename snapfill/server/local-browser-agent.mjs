import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const TEST_TIMEOUT = 30000

class CdpClient {
  constructor(url) {
    this.socket = new WebSocket(url)
    this.nextId = 1
    this.pending = new Map()
    this.ready = new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true })
      this.socket.addEventListener('error', reject, { once: true })
    })
    this.socket.addEventListener('message', ({ data }) => {
      const message = JSON.parse(data)
      const pending = this.pending.get(message.id)
      if (!pending) return
      this.pending.delete(message.id)
      if (message.error) pending.reject(new Error(message.error.message))
      else pending.resolve(message.result)
    })
  }

  async send(method, params = {}, sessionId) {
    await this.ready
    const id = this.nextId++
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    })
  }

  close() { this.socket.close() }
}

async function retry(action, timeout = TEST_TIMEOUT) {
  const deadline = Date.now() + timeout
  let error
  while (Date.now() < deadline) {
    try { return await action() } catch (caught) { error = caught; await new Promise((resolve) => setTimeout(resolve, 250)) }
  }
  throw error ?? new Error('The local browser agent timed out.')
}

function chromePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ]
  return candidates.find((candidate) => existsSync(candidate))
}

function fillExpression(profile, includeOptional) {
  return `new Promise((resolve, reject) => {
    const profile = ${JSON.stringify(profile)}
    const includeOptional = ${JSON.stringify(includeOptional)}
    const normalize = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
    const fieldControls = () => [...document.querySelectorAll('input, textarea, select, [contenteditable="true"][role="textbox"]')]
      .filter((control) => !['hidden', 'submit', 'button', 'reset', 'radio', 'checkbox'].includes(control.type))
    const directLabel = (control) => {
      const referenced = (control.getAttribute('aria-labelledby') ?? '').split(/\\s+/).map((id) => document.getElementById(id)?.textContent).filter(Boolean).join(' ')
      return [control.labels ? [...control.labels].map((item) => item.textContent).join(' ') : '', control.getAttribute('aria-label'), referenced].filter(Boolean).join(' ')
    }
    const deadline = Date.now() + 15000
    const timer = setInterval(() => {
      const controls = fieldControls()
      if (!controls.length) {
        if (Date.now() > deadline) { clearInterval(timer); reject(new Error('No fillable controls were found on this page.')) }
        return
      }
      clearInterval(timer)
      const aliases = {
        fullName: ['fullname', 'applicantname', 'nameoftheapplicant', 'legalname'],
        dateOfBirth: ['dateofbirth', 'dob', 'birthdate'],
        documentNumber: ['documentnumber', 'aadhaar', 'aadharnumber', 'pannumber', 'license', 'licencenumber', 'idnumber'],
        address: ['address', 'residentialaddress', 'homeaddress'],
        guardianName: ['guardianname', 'fathername', 'mothername', 'parentname'],
      }
      const sharedKeys = []
      let filled = 0
      controls.forEach((control) => {
        const label = directLabel(control)
        const question = normalize(label).replaceAll('youranswer', '').replaceAll('required', '')
        const identity = normalize([control.name, control.id, control.getAttribute('autocomplete'), control.getAttribute('aria-label'), control.getAttribute('placeholder'), label].join(' '))
        const key = ['name', 'yourname', 'fullname', 'yourfullname'].includes(question) ? 'fullName' : Object.entries(aliases).find(([, names]) => names.some((name) => identity.includes(name)))?.[0]
        const value = key ? profile[key] : ''
        const required = control.required || control.getAttribute('aria-required') === 'true'
        if (!key || !value || (!includeOptional && !required)) return
        if (control instanceof HTMLSelectElement) {
          const option = [...control.options].find((item) => normalize(item.value) === normalize(value) || normalize(item.text) === normalize(value))
          if (!option) return
          control.value = option.value
        } else if (control.isContentEditable) {
          control.textContent = value
        } else {
          const prototype = control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
          Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(control, value)
        }
        control.dispatchEvent(new InputEvent('input', { bubbles: true, data: value, inputType: 'insertText' }))
        control.dispatchEvent(new Event('change', { bubbles: true }))
        control.dispatchEvent(new Event('blur', { bubbles: true }))
        filled += 1
        sharedKeys.push(key)
      })
      resolve({ filled, total: controls.length, hostname: location.hostname, sharedKeys: [...new Set(sharedKeys)] })
    }, 250)
  })`
}

export async function fillWithLocalBrowser({ url, profile, includeOptional = true }) {
  const target = new URL(url)
  if (!['http:', 'https:'].includes(target.protocol)) throw new Error('Enter an HTTP or HTTPS form URL.')
  const executable = chromePath()
  if (!executable) throw new Error('Google Chrome is required for the local browser agent.')

  const port = 9400 + Math.floor(Math.random() * 400)
  const profilePath = join(tmpdir(), `snapfill-local-agent-${crypto.randomUUID()}`)
  const browser = spawn(executable, [
    `--remote-debugging-port=${port}`,
    '--remote-allow-origins=*',
    '--no-first-run',
    `--user-data-dir=${profilePath}`,
    target.toString(),
  ], { detached: true, stdio: 'ignore', windowsHide: false })
  browser.unref()

  const version = await retry(async () => {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`)
    if (!response.ok) throw new Error('The local browser agent did not start.')
    return response.json()
  })
  const cdp = new CdpClient(version.webSocketDebuggerUrl)
  try {
    const result = await retry(async () => {
      const targets = await cdp.send('Target.getTargets')
      const form = targets.targetInfos.find((item) => item.type === 'page' && item.url.startsWith(target.origin))
      if (!form) throw new Error('The destination form has not loaded yet.')
      const session = await cdp.send('Target.attachToTarget', { targetId: form.targetId, flatten: true })
      const response = await cdp.send('Runtime.evaluate', { expression: fillExpression(profile, includeOptional), awaitPromise: true, returnByValue: true }, session.sessionId)
      if (response.exceptionDetails) throw new Error(response.exceptionDetails.text ?? 'The local browser agent could not fill the form.')
      return response.result.value
    })
    if (!result?.filled) throw new Error('No reviewed details matched the fillable fields on this form.')
    return { ...result, strategy: 'local-browser' }
  } finally {
    cdp.close()
  }
}
