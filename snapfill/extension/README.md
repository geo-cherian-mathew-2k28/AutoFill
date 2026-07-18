# SnapFill Local Agent

This Manifest V3 extension is the companion for cross-site form filling. The website cannot safely write to another site's fields; this extension can, but only after a user action.

## Load for local development

1. Open `chrome://extensions` in Chrome or a Chromium browser.
2. Enable Developer mode.
3. Select **Load unpacked** and choose this `extension` folder.
4. Open SnapFill, scan a document, complete the review, then open the extension on the SnapFill tab and select **Import current SnapFill data**.
5. On any destination form, use **Autofill current form**, or paste a URL in the extension and select **Open and autofill**.

## Security model

- The vault is encrypted locally with AES-GCM; the key is derived from a user passphrase using PBKDF2 (250,000 SHA-256 iterations).
- The plaintext vault and encryption key exist only while the extension service worker stays unlocked. Locking it clears both.
- Passwords are filled only when the current site's hostname exactly matches a saved credential.
- Target-site permission is requested at runtime for the one site selected by the user, not granted permanently to every website.
