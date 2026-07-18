const unlockPanel = document.querySelector('#unlock-panel')
const vaultPanel = document.querySelector('#vault-panel')
const status = document.querySelector('#status')
const message = document.querySelector('#message')
const passphrase = document.querySelector('#passphrase')
const unlockButton = document.querySelector('#unlock-button')

async function send(type, payload = {}) {
  const response = await chrome.runtime.sendMessage({ type, ...payload })
  if (!response.ok) throw new Error(response.error)
  return response.data
}

function notify(text, error = false) {
  message.textContent = text
  message.classList.toggle('error', error)
}

function setValue(id, value) {
  document.querySelector(`#${id}`).value = value ?? ''
}

function render(data, exists = true) {
  const unlocked = data.unlocked
  unlockPanel.hidden = unlocked
  vaultPanel.hidden = !unlocked
  unlockButton.textContent = exists ? 'Unlock vault' : 'Create vault'
  document.querySelector('#passphrase-label').textContent = exists ? 'Vault passphrase' : 'Create vault passphrase'
  status.textContent = unlocked ? `${data.credentials.length} site credential${data.credentials.length === 1 ? '' : 's'} saved` : exists ? 'Vault locked' : 'Create local vault'
  if (unlocked) Object.entries(data.profile).forEach(([key, value]) => setValue(key, value))
}

async function refresh() {
  const data = await send('status')
  render(data, data.exists)
}

unlockButton.addEventListener('click', async () => {
  try {
    const statusData = await send('status')
    const data = await send(statusData.exists ? 'unlock' : 'create', { passphrase: passphrase.value })
    passphrase.value = ''
    render(data, true)
    notify('Vault unlocked')
  } catch (error) { notify(error.message, true) }
})

document.querySelector('#import-button').addEventListener('click', async () => {
  try { render(await send('importSnapFill'), true); notify('SnapFill data imported') } catch (error) { notify(error.message, true) }
})

document.querySelector('#fill-current-button').addEventListener('click', async () => {
  try { const result = await send('fillCurrent'); notify(`${result.filled} field${result.filled === 1 ? '' : 's'} filled${result.aiMappings ? ` with ${result.aiMappings} AI match${result.aiMappings === 1 ? '' : 'es'}` : ''}`) } catch (error) { notify(error.message, true) }
})

document.querySelector('#target-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  try { const result = await send('openAndFill', { url: document.querySelector('#target-url').value }); notify(`${result.filled} field${result.filled === 1 ? '' : 's'} filled${result.aiMappings ? ` with ${result.aiMappings} AI match${result.aiMappings === 1 ? '' : 'es'}` : ''}`) } catch (error) { notify(error.message, true) }
})

document.querySelector('#profile-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const profile = Object.fromEntries(new FormData(event.currentTarget).entries())
  try { render(await send('saveProfile', { profile }), true); notify('Details saved') } catch (error) { notify(error.message, true) }
})

document.querySelector('#credential-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const credential = { url: document.querySelector('#credential-url').value, username: document.querySelector('#username').value, password: document.querySelector('#password').value }
  try { render(await send('saveCredential', { credential }), true); event.currentTarget.reset(); notify('Credential saved') } catch (error) { notify(error.message, true) }
})

document.querySelector('#lock-button').addEventListener('click', async () => {
  try { render(await send('lock'), true); notify('Vault locked') } catch (error) { notify(error.message, true) }
})

refresh().catch((error) => notify(error.message, true))
