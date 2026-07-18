# SnapFill Consent Agent

## The product shift

SnapFill is not positioned as another document scanner or form filler. It is a local, consent-driven identity agent that optimizes every form submission for minimum disclosure.

## What makes it distinct

| Capability | Typical autofill | SnapFill Consent Agent |
| --- | --- | --- |
| Data selection | Fills any matching field | Fills required fields first; optional fields need explicit approval |
| Form understanding | Repeats broad heuristics | Learns an encrypted per-form recipe after a successful AI or heuristic mapping |
| Audit trail | None or stores raw content | Keeps a local receipt containing only the hostname, field categories, and strategy |
| AI privacy | Sends profile data for interpretation | Sends only control metadata and available key names; vault values and passwords stay local |
| Site access | Broad extension access | Requests access only for the selected target origin |

## Agent workflow

1. Scan and review a document in the SnapFill app.
2. Import the reviewed profile into the encrypted local agent vault.
3. Enter a target form URL in the extension.
4. The agent opens the site, requests that origin's permission, and analyzes the form.
5. A local recipe is reused when the form is known; otherwise AI or deterministic mapping resolves the controls.
6. The agent fills approved fields, stores a value-free receipt, and retains the mapping locally for later forms of the same shape.

## Production boundary

The browser extension is required because a normal website cannot safely manipulate arbitrary third-party forms. The user remains the final authority: opening the target and enabling optional fields are explicit actions.
