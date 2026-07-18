# SnapFill

Private. Instant. Offline.

SnapFill is a hackathon MVP for scanning identity documents and filling digital forms without sending private data to a server.

## Product Goal

Build a polished, responsive Progressive Web App that demonstrates:

- Local OCR in the browser with Tesseract.js
- Identity field extraction for Aadhaar, PAN, and Driving Licence style documents
- Editable extracted data
- Animated auto-fill into a demo form
- JSON export and copy-to-clipboard support
- A premium light-theme interface that can impress judges in a short demo

## Privacy Principle

All document processing should happen locally in browser memory. The app must not use a backend, database, authentication, external API, or cloud OCR service.

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- Tesseract.js
- React Hook Form
- Zod
- Sonner

## Commit Discipline

This hackathon project should be committed regularly in small, meaningful steps. The target is at least 50 commits across the build, covering setup, dependencies, UI sections, OCR logic, form flow, polish, tests, and deployment readiness.

See [docs/COMMIT_PLAN.md](docs/COMMIT_PLAN.md) for the running commit cadence.
