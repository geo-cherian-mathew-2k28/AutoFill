const VAULT_KEY = 'snapfillEncryptedVault'
const encoder = new TextEncoder()
const decoder = new TextDecoder()

let unlockedVault = null
let encryptionKey = null
let vaultSalt = null

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function deriveKey(passphrase, salt) {
  const material = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

function emptyVault() {
  return { profile: {}, credentials: [], documents: [], recipes: [], receipts: [], sitePolicies: {} }
}

function normalizeVault(value) {
  const defaults = emptyVault()
  return {
    ...defaults,
    ...value,
    profile: value?.profile ?? {},
    credentials: Array.isArray(value?.credentials) ? value.credentials : [],
    documents: Array.isArray(value?.documents) ? value.documents : [],
    recipes: Array.isArray(value?.recipes) ? value.recipes : [],
    receipts: Array.isArray(value?.receipts) ? value.receipts : [],
    sitePolicies: value?.sitePolicies ?? {},
  }
}

async function persist() {
  if (!unlockedVault || !encryptionKey || !vaultSalt) throw new Error('Unlock the vault first.')
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encryptionKey, encoder.encode(JSON.stringify(unlockedVault)))
  await chrome.storage.local.set({ [VAULT_KEY]: { salt: toBase64(vaultSalt), iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) } })
}

export async function vaultExists() {
  const stored = await chrome.storage.local.get(VAULT_KEY)
  return Boolean(stored[VAULT_KEY])
}

export async function createVault(passphrase) {
  if (passphrase.length < 10) throw new Error('Use a passphrase with at least 10 characters.')
  vaultSalt = crypto.getRandomValues(new Uint8Array(16))
  encryptionKey = await deriveKey(passphrase, vaultSalt)
  unlockedVault = emptyVault()
  await persist()
  return summary()
}

export async function unlockVault(passphrase) {
  const stored = await chrome.storage.local.get(VAULT_KEY)
  const encrypted = stored[VAULT_KEY]
  if (!encrypted) throw new Error('Create your vault first.')
  vaultSalt = fromBase64(encrypted.salt)
  encryptionKey = await deriveKey(passphrase, vaultSalt)
  try {
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64(encrypted.iv) }, encryptionKey, fromBase64(encrypted.ciphertext))
    unlockedVault = normalizeVault(JSON.parse(decoder.decode(plaintext)))
    return summary()
  } catch {
    encryptionKey = null
    vaultSalt = null
    throw new Error('That passphrase did not unlock this vault.')
  }
}

export function lockVault() {
  unlockedVault = null
  encryptionKey = null
  vaultSalt = null
}

export function getVault() {
  if (!unlockedVault) throw new Error('Unlock the vault first.')
  return unlockedVault
}

export function summary() {
  if (!unlockedVault) return { unlocked: false, profile: {}, credentials: [], documentCount: 0, recipeCount: 0, receiptCount: 0, lastReceipt: null }
  return {
    unlocked: true,
    profile: unlockedVault.profile,
    credentials: unlockedVault.credentials.map(({ hostname, username }) => ({ hostname, username })),
    documentCount: unlockedVault.documents.length,
    recipeCount: unlockedVault.recipes.length,
    receiptCount: unlockedVault.receipts.length,
    lastReceipt: unlockedVault.receipts[0] ?? null,
  }
}

export async function saveProfile(profile) {
  const vault = getVault()
  vault.profile = { ...vault.profile, ...profile }
  await persist()
  return summary()
}

export async function saveCredential(credential) {
  const vault = getVault()
  const hostname = new URL(credential.url).hostname
  const entry = { hostname, username: credential.username.trim(), password: credential.password }
  vault.credentials = [...vault.credentials.filter((item) => item.hostname !== hostname), entry]
  await persist()
  return summary()
}

export async function saveDocument(document) {
  const vault = getVault()
  vault.documents = [...vault.documents.filter((item) => item.id !== document.id), document]
  await persist()
  return summary()
}

export async function saveRecipe(recipe) {
  const vault = getVault()
  vault.recipes = [recipe, ...vault.recipes.filter((item) => item.fingerprint !== recipe.fingerprint)].slice(0, 50)
  await persist()
}

export async function saveSitePolicy(hostname, policy) {
  const vault = getVault()
  vault.sitePolicies[hostname] = { ...vault.sitePolicies[hostname], ...policy }
  await persist()
}

export async function recordReceipt(receipt) {
  const vault = getVault()
  vault.receipts = [receipt, ...vault.receipts].slice(0, 100)
  await persist()
  return summary()
}
