import { createVault, getVault, lockVault, saveCredential, saveDocument, saveProfile, summary, unlockVault, vaultExists } from './vault.js'

function fillActiveForm(profile, credential) {
  const normalized = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const nameParts = String(profile.fullName ?? '').trim().split(/\s+/)
  const aliases = {
    fullName: ['fullname', 'applicantname', 'nameoftheapplicant', 'legalname'],
    firstName: ['firstname', 'givenname'],
    lastName: ['lastname', 'surname', 'familyname'],
    dateOfBirth: ['dateofbirth', 'dob', 'birthdate'],
    documentNumber: ['documentnumber', 'aadhaar', 'aadharnumber', 'pannumber', 'license', 'licencenumber', 'idnumber'],
    address: ['address', 'residentialaddress', 'homeaddress'],
    guardianName: ['guardianname', 'fathername', 'mothername', 'parentname'],
    username: ['username', 'email', 'emailaddress', 'loginid', 'userid'],
    password: ['password', 'passcode'],
  }
  const values = { ...profile, firstName: nameParts[0] ?? '', lastName: nameParts.slice(1).join(' '), username: credential?.username ?? '', password: credential?.password ?? '' }
  let filled = 0
  const controls = [...document.querySelectorAll('input, textarea, select')]

  function setValue(control, value) {
    if (!value || control.disabled || control.readOnly || control.value) return false
    if (control instanceof HTMLSelectElement) {
      const option = [...control.options].find((item) => normalized(item.value) === normalized(value) || normalized(item.text) === normalized(value))
      if (!option) return false
      control.value = option.value
    } else {
      const prototype = control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(control, value)
    }
    control.dispatchEvent(new Event('input', { bubbles: true }))
    control.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }

  controls.forEach((control) => {
    const label = control.labels ? [...control.labels].map((item) => item.textContent).join(' ') : ''
    const identity = normalized([control.name, control.id, control.getAttribute('autocomplete'), control.getAttribute('aria-label'), control.getAttribute('placeholder'), label].join(' '))
    const key = Object.entries(aliases).find(([, names]) => names.some((name) => identity.includes(name)))?.[0] ?? (identity === 'name' ? 'fullName' : undefined)
    if (key && setValue(control, values[key])) filled += 1
  })
  return { filled, total: controls.length, hostname: location.hostname }
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  if (!tab?.id) throw new Error('Open the form you want to fill first.')
  return tab
}

async function fillTab(tabId) {
  const vault = getVault()
  const tab = await chrome.tabs.get(tabId)
  const hostname = tab.url ? new URL(tab.url).hostname : ''
  const credential = vault.credentials.find((item) => item.hostname === hostname)
  const [result] = await chrome.scripting.executeScript({ target: { tabId }, func: fillActiveForm, args: [vault.profile, credential] })
  return result.result
}

async function waitForLoad(tabId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { chrome.tabs.onUpdated.removeListener(listener); reject(new Error('The form took too long to load.')) }, 30000)
    function listener(updatedTabId, changeInfo) {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        clearTimeout(timeout)
        chrome.tabs.onUpdated.removeListener(listener)
        resolve()
      }
    }
    chrome.tabs.onUpdated.addListener(listener)
  })
}

async function openAndFill(url) {
  const parsed = new URL(url)
  const granted = await chrome.permissions.request({ origins: [`${parsed.origin}/*`] })
  if (!granted) throw new Error('Site access is needed to fill that form.')
  const tab = await chrome.tabs.create({ url: parsed.toString(), active: true })
  if (!tab.id) throw new Error('Could not open the form.')
  await waitForLoad(tab.id)
  await new Promise((resolve) => setTimeout(resolve, 600))
  return fillTab(tab.id)
}

async function importSnapFill() {
  const tab = await activeTab()
  const [result] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.localStorage.getItem('snapfill.saved-profile.v1'),
  })
  if (!result.result) throw new Error('No saved SnapFill data was found in this tab.')
  const document = JSON.parse(result.result)
  const profile = Object.fromEntries((document.fields ?? []).map((field) => [field.key, field.value]))
  await saveProfile(profile)
  await saveDocument({ id: document.id ?? crypto.randomUUID(), name: document.displayName ?? 'SnapFill document', importedAt: new Date().toISOString() })
  return summary()
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handlers = {
    status: async () => ({ exists: await vaultExists(), ...summary() }),
    create: async () => createVault(message.passphrase),
    unlock: async () => unlockVault(message.passphrase),
    lock: async () => { lockVault(); return summary() },
    saveProfile: async () => saveProfile(message.profile),
    saveCredential: async () => saveCredential(message.credential),
    importSnapFill: async () => importSnapFill(),
    fillCurrent: async () => fillTab((await activeTab()).id),
    openAndFill: async () => openAndFill(message.url),
  }
  const handler = handlers[message.type]
  if (!handler) return false
  handler().then((data) => sendResponse({ ok: true, data })).catch((error) => sendResponse({ ok: false, error: error.message }))
  return true
})

chrome.storage.local.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' }).catch(() => undefined)
