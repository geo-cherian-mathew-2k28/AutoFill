# SnapFill

Private, local document-to-form autofill. The React app extracts and reviews document fields; the companion browser extension opens a destination form and fills it on the user's explicit request.

## Run the app

```bash
npm install
npm run dev
```

## Use the local agent

1. In Chrome, open `chrome://extensions`, enable Developer mode, and use **Load unpacked** on `snapfill/extension`.
2. Scan a document in SnapFill and save the reviewed details locally.
3. With the SnapFill tab active, open the extension and choose **Import current SnapFill data**.
4. In the extension, paste a destination form URL and choose **Open and autofill**, or open a form yourself and choose **Autofill current form**.

The extension asks for permission only for the destination site you select. It maps common form labels for name, date of birth, document number, address, guardian name, username, and password. Credentials are used only on an exact matching hostname.

## Privacy model

- Document extraction runs in the browser.
- The web app stores reviewed fields in local browser storage.
- The extension stores its vault encrypted locally with AES-GCM. Its key is derived from the user passphrase with PBKDF2 and only retained while unlocked.
- No backend, account, analytics, or cloud AI is part of the product flow.
