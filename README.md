# Dictée Libre ✏️

A free, offline-first, mobile-friendly Progressive Web App for French spelling practice.  
No account, no backend, no paid dependency.

## Features

- Enter any word list (one word or phrase per line)
- Configurable repetitions (1–3×), fixed/adaptive/manual answer timer, speech rate, and voice
- Full keyboard mode **or** autonomous microphone spelling mode with manual fallback
- Pastel colour-coded correction: correct · accent issue · incorrect
- Replay only missed words until every word has been written correctly at least once
- Installable PWA — works fully offline after the first load

## Tech stack

| Layer | Tool |
|-------|------|
| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS 3 |
| PWA / Service Worker | vite-plugin-pwa (Workbox) |
| Audio | Web Speech API (`speechSynthesis` + native `SpeechRecognition` where available) — no third-party API |
| Hosting | GitHub Pages |

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # build and run automated tests
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Testing

The test suite uses Node's built-in test runner. Test files live next to the source as `*.test.ts`; `scripts/build-tests.mjs` bundles them into `.test-build/` before execution.

Current coverage focuses on:

- PWA manifest icon paths staying relative, so GitHub Pages sub-path installs resolve icons correctly.
- Dictation speech-run cancellation, so repeated “Réécouter” clicks cannot leave older speech loops racing the latest one.
- Adaptive answer timing, including short-word minimums, phrase scaling, and the long-sentence cap.
- French letter-name spelling recognition, including accents, separators, unsupported-browser detection, and grading integration.

## Deployment

Every push to `main` triggers the [GitHub Actions workflow](.github/workflows/deploy.yml) which:

1. Installs dependencies with `npm ci`
2. Builds with `VITE_BASE_URL=/<repo-name>/` so asset paths are correct under the GitHub Pages sub-path
3. Uploads `dist/` to GitHub Pages via the official `actions/deploy-pages` action

**One-time setup** — in your repository go to  
*Settings → Pages → Source* and select **GitHub Actions**.

If you use a custom domain pointing to the repo root, remove the `VITE_BASE_URL` env line from the workflow so the app builds with base `/`.

PWA manifest icons and the favicon use relative public paths so the app works both at `/` and under the GitHub Pages `/<repo-name>/` sub-path.

## App flow

```
Home → Word list → Configuration → Countdown 3·2·1
  → Dictée (word by word) → Congratulations
  → Correction (word by word) → Score
  → [if missed words] → Replay missed → … → Score (100 %)
```

## Project structure

```
src/
├── types.ts              # State machine types, DicteeConfig
├── grading.ts            # normaliseBasic / stripAccents / gradeAnswer / mergeGrade
├── hooks/useSpeech.ts    # Web Speech API hook with fr-FR fallback
├── hooks/useSpeechRecognition.ts # Native microphone spelling recognition hook
├── spellingRecognition.ts # French letter-name parser for autonomous mode
├── App.tsx               # Top-level state machine (no router — smart display safe)
└── screens/
    ├── HomeScreen.tsx
    ├── WordListScreen.tsx
    ├── ConfigScreen.tsx
    ├── CountdownScreen.tsx
    ├── DicteeScreen.tsx
    ├── CongratsScreen.tsx
    ├── CorrectionScreen.tsx
    └── ScoreScreen.tsx
```

## PWA icons

Icons are committed in `public/` and were generated from `public/icon.svg` using ImageMagick:

```bash
convert -background none -size 192x192 public/icon.svg public/icon-192.png
convert -background none -size 512x512 public/icon.svg public/icon-512.png
```

Replace `public/icon.svg` with your own artwork and re-run the commands to update them.

## License

MIT
