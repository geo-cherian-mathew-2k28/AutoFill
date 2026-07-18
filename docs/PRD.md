# Product Requirements Document

## Project

SnapFill

## Tagline

Private. Instant. Offline.

Scan your identity document and instantly fill digital forms without uploading your data to any server.

## Hackathon Goal

Build a polished, responsive Progressive Web App that demonstrates privacy-first document extraction and automatic form filling.

This is not a production-ready OCR platform. The MVP should:

- Work locally in the browser
- Look premium
- Demonstrate the complete workflow
- Impress judges within two minutes

## Required Stack

Use exactly these technologies:

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- Tesseract.js
- clsx
- class-variance-authority
- tailwind-merge
- react-dropzone
- sonner
- react-hook-form
- zod
- @hookform/resolvers

The app must be Vercel-compatible and must not include a backend, database, authentication, or API.

## Initial Setup

Before writing application code:

1. Install every required dependency.
2. Configure the project.
3. Ensure the application runs successfully.
4. Only then begin implementation.

Expected setup:

```bash
npm create vite@latest snapfill -- --template react-ts
cd snapfill
npm install
npm install tailwindcss @tailwindcss/vite
npm install framer-motion
npm install lucide-react
npm install tesseract.js
npm install clsx
npm install class-variance-authority
npm install tailwind-merge
npm install react-dropzone
npm install sonner
npm install react-hook-form
npm install zod
npm install @hookform/resolvers
```

Also initialize shadcn/ui, configure Tailwind, configure aliases, create a clean folder architecture, run the application, and fix dependency errors automatically.

## Folder Structure

```text
src/
  components/
  pages/
  hooks/
  utils/
  lib/
  assets/
  styles/
  types/
```

## Design Language

The UI should feel like a premium startup product inspired by Linear, Stripe, Arc Browser, Notion, and Vercel. Avoid a Material UI appearance.

Use light mode only.

### Colors

- Background: `#FFFFFF`
- Secondary background: `#F8FAFC`
- Primary: `#2563EB`
- Accent: `#0EA5E9`
- Borders: `#E5E7EB`
- Success: `#10B981`
- Warning: `#F59E0B`
- Text: `#111827`
- Muted: `#6B7280`

### Visual Style

- Inter font
- Bold, spacious headings
- 24px radius where appropriate
- Large whitespace
- Soft shadows
- Glass cards
- Smooth transitions

## Pages

### Landing Page

Hero title:

```text
Fill Forms Instantly.
Keep Your Data Private.
```

Subtitle:

```text
Scan Aadhaar, PAN or Driving Licence.
Everything happens locally on your device.
Nothing is uploaded.
```

Primary button: `Scan Document`

Secondary button: `Try Demo`

Below the hero, include three feature cards:

- Local Processing
- Offline
- Instant Form Fill

Use animated entrance effects.

### Scan Screen

Include a beautiful upload card with drag-and-drop support, a large icon, an animated dashed border, and support for PNG, JPEG, JPG, and optionally PDF.

When a file is uploaded, show a scanning animation.

### Processing Screen

Use a centered animation, progress indicator, and rotating messages:

- Reading document...
- Detecting text...
- Extracting information...
- Almost done...

### Result Screen

Use beautiful cards instead of tables. Each extracted field should be editable.

Example fields:

- Full Name: Geo Cherian Mathew
- DOB: 03-02-2006
- Aadhaar: XXXX XXXX 1234

### Auto Fill Page

Create a beautiful form where fields animate in one by one, automatically fill, and show highlight animation.

Include a completion indicator such as `96% Completed`.

### Success Page

Include a large success animation, the text `Form Ready`, and buttons for:

- Download JSON
- Copy Details
- Start Again

## OCR Logic

Use Tesseract.js. Support Aadhaar, PAN, and Driving Licence style documents with simple regex and keyword matching.

Do not use online AI. Everything stays inside browser memory.

## Privacy Banner

Always show a green badge:

```text
Local Processing Enabled
```

Subtitle:

```text
Your documents never leave this device.
```

## Features

- Image upload
- OCR
- Editable extracted fields
- Confidence percentage
- Auto form filling
- Export JSON
- Copy to clipboard
- Reset
- Responsive layout
- PWA readiness
- Button hover
- Slight card lift
- Fade transitions
- Loading shimmer
- Number counting
- Field highlight
- Smooth scrolling

## States

### Empty State

Show a polished illustration or visual treatment with:

```text
Drop your document here
```

or:

```text
Click to upload
```

### Error State

Use friendly copy:

```text
Couldn't read the document.
Try another image.
```

Button: `Retry`

## Responsiveness

The UI must be pixel-polished on desktop, tablet, and mobile.

## Performance

- Lazy loading
- Avoid unnecessary re-renders
- Fast animations
- Keep the bundle lightweight

## Demo Assets

Include sample Aadhaar and PAN images in `/public/demo/` so the `Try Demo` button works instantly when camera access is unavailable.

## Deliverables

- Clean React and TypeScript code
- Beautiful light-theme UI
- Responsive layout
- Local OCR with Tesseract.js
- Editable extracted fields
- Auto-filled demo form
- JSON export
- Copy-to-clipboard support
- PWA-ready configuration
- No backend or cloud dependencies

## Build Priority

This is a hackathon MVP, not a production SaaS. Prioritize the full user flow, premium UI, reliable demo behavior, local processing, and clean modular code.
