# SnapFill

SnapFill is a private, local consent agent for web forms. The React app extracts and reviews document fields; the companion browser extension opens a destination form, fills the minimum approved data, and learns local form recipes for future visits.

## Run the app

```bash
npm install
npm run dev
```

## Use the local agent

1. In Chrome, open `chrome://extensions`, enable Developer mode, and use **Load unpacked** on `snapfill/extension`.
2. Open the extension once to create or unlock the local encrypted vault.
3. Scan and review a document in SnapFill, then save the reviewed details.
4. On the **Agent ready** screen, paste a destination form URL and select **Autofill this form**. The agent writes only the reviewed fields to its unlocked local vault, opens the selected form, and fills it.
5. The supplied Google Forms test URL works directly. For a new site, use the extension's target URL control once to grant that site permission, then return to the web agent.

When SnapFill is opened in an embedded browser that cannot load Chrome extensions, the local development agent opens an isolated Chrome profile, fills the selected form there, and leaves that form open. The reviewed profile is sent only to the local `127.0.0.1` agent process and the destination form.

The extension asks for permission only for the destination site you select. It maps common form labels for name, date of birth, document number, address, guardian name, username, and password. Credentials are used only on an exact matching hostname. The web agent lets the user include or exclude optional reviewed details. Each run creates an encrypted local receipt with the hostname, field categories, and strategy, never the values themselves.

## Privacy model

- Document extraction runs in the browser.
- The web app stores reviewed fields in local browser storage.
- The extension stores its vault encrypted locally with AES-GCM. Its key is derived from the user passphrase with PBKDF2 and only retained while unlocked.
- No backend, account, analytics, or cloud AI is part of the product flow.
