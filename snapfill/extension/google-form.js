function normalized(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function controls() {
  return [...document.querySelectorAll('input, textarea, select, [contenteditable="true"][role="textbox"]')]
    .filter((control) => !['hidden', 'submit', 'button', 'reset', 'radio', 'checkbox'].includes(control.type))
}

function questionLabel(control) {
  const referencedText = (control.getAttribute('aria-labelledby') ?? '').split(/\s+/).map((id) => document.getElementById(id)?.textContent).filter(Boolean).join(' ')
  return [control.labels ? [...control.labels].map((item) => item.textContent).join(' ') : '', control.getAttribute('aria-label'), referencedText].filter(Boolean).join(' ')
}

function fieldLabel(control) {
  const directLabel = questionLabel(control)
  const containerText = control.closest('[role="listitem"], [data-item-id]')?.innerText?.slice(0, 500) ?? ''
  return [directLabel, containerText].filter(Boolean).join(' ')
}

function fieldDescriptors() {
  return controls().map((control, index) => ({
    index,
    label: fieldLabel(control),
    name: control.name,
    id: control.id,
    type: control.type,
    required: control.required || control.getAttribute('aria-required') === 'true',
    autocomplete: control.getAttribute('autocomplete'),
    placeholder: control.getAttribute('placeholder'),
  }))
}

function fillGoogleForm(profile, mappings, includeOptional) {
  const aliases = {
    fullName: ['fullname', 'applicantname', 'nameoftheapplicant', 'legalname'],
    dateOfBirth: ['dateofbirth', 'dob', 'birthdate'],
    documentNumber: ['documentnumber', 'aadhaar', 'aadharnumber', 'pannumber', 'license', 'licencenumber', 'idnumber'],
    address: ['address', 'residentialaddress', 'homeaddress'],
    guardianName: ['guardianname', 'fathername', 'mothername', 'parentname'],
  }
  let filled = 0
  const sharedKeys = []

  controls().forEach((control, index) => {
    const label = fieldLabel(control)
    const question = normalized(questionLabel(control)).replaceAll('youranswer', '').replaceAll('required', '')
    const identity = normalized([control.name, control.id, control.getAttribute('autocomplete'), control.getAttribute('aria-label'), control.getAttribute('placeholder'), label].join(' '))
    const key = mappings[index] ?? (['name', 'yourname', 'fullname', 'yourfullname'].includes(question) ? 'fullName' : undefined) ?? Object.entries(aliases).find(([, names]) => names.some((name) => identity.includes(name)))?.[0]
    const value = key ? profile[key] : ''
    const required = control.required || control.getAttribute('aria-required') === 'true'
    if (!key || !value || (!includeOptional && !required) || control.disabled || control.readOnly || control.value) return

    control.focus()
    if (control instanceof HTMLSelectElement) {
      const option = [...control.options].find((item) => normalized(item.value) === normalized(value) || normalized(item.text) === normalized(value))
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

  return { filled, total: controls().length, hostname: location.hostname, sharedKeys: [...new Set(sharedKeys)] }
}

async function waitForFields() {
  const deadline = Date.now() + 10000
  while (Date.now() < deadline) {
    const fields = fieldDescriptors()
    if (fields.length) return fields
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return []
}

async function run() {
  const fields = await waitForFields()
  if (!fields.length) return
  const response = await chrome.runtime.sendMessage({ type: 'googleFormReady', fields })
  if (!response?.ok || !response.data?.profile) return
  const result = fillGoogleForm(response.data.profile, response.data.mappings, response.data.includeOptional)
  await chrome.runtime.sendMessage({ type: 'googleFormFilled', result })
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(run, 300), { once: true })
else setTimeout(run, 300)
