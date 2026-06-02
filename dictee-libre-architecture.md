# Dictée Libre — Web App Architecture and Flow

## 1. Product Goal

**Dictée Libre** is a simple, free, mobile-friendly, and smart-display-friendly web app for spelling practice[cite: 1].

The app allows a parent, teacher, or student to:
1. Enter a list of words[cite: 1].
2. Configure the dictation session[cite: 1].
3. Start a guided dictée[cite: 1].
4. Hear each word spoken aloud[cite: 1].
5. Type or validate the answer before the timer expires[cite: 1].
6. Review the results word by word[cite: 1].
7. Replay only the missed words[cite: 1].
8. Continue until every word has been written correctly at least once[cite: 1].

The first version should be a **static Progressive Web App (PWA)**, with no backend, no account, and no paid dependency[cite: 1]. It must be deeply responsive to work seamlessly on modern mobile phones, traditional PCs, and fixed smart displays (e.g., Meta Portal, Google Nest Hub)[cite: 1].

---

## 2. Core Principles

- **Free to use**: No mandatory paid service or API[cite: 1].
- **Local-first**: All data stays in the browser[cite: 1].
- **Device-agnostic**: Interface scales intelligently for portrait mobile use, desktop environments, and landscape-oriented kitchen/countertop smart displays[cite: 1].
- **Child-friendly**: Encouraging language, soft pastel UI cues, and no punitive feedback[cite: 1].
- **Simple state flow**: Word list -> Configuration -> Countdown -> Dictée -> Correction -> Retry missed words[cite: 1].
- **Repeat until success**: The student can keep replaying missed words until all words are correct[cite: 1].

---

## 3. Main User Flow

\* Home
  \* ↓
  \* Enter word list
  \* ↓
  \* Configure dictée (Voice, Repetitions, Display Mode)
  \* ↓
  \* Countdown: 3, 2, 1, c'est parti !
  \* ↓
  \* Dictée session (Typing Mode OR Oral/Self-Grading Mode)
  \* ↓
  \* Congratulations screen
  \* ↓
  \* Word-by-word correction
  \* ↓
  \* Score screen
  \* ↓
  \* If mistakes exist:
      \* Replay missed words
      \* ↓
      \* Re-grade full dictée, replacing only newly corrected answers
      \* ↓
      \* Repeat until all words are correct at least once
  \* ↓
  \* Restart or stop

---

## 4. Screens

### 4.1 Home Screen
- **Purpose**: Start a new dictée quickly[cite: 1].
- **UI Elements**:
  - App title: `Dictée Libre ✏️`[cite: 1]
  - Primary button: `Nouvelle dictée`[cite: 1]
  - Secondary actions (Optional MVP): `Dernière dictée`, `Listes sauvegardées`, `Paramètres`[cite: 1]

### 4.2 Word List Screen
- **Purpose**: Capture input text for the dictée[cite: 1].
- **UI Elements**:
  - Text area with placeholder demonstrating one word/expression per line[cite: 1].
  - Button: `Continuer`[cite: 1]
- **Validation**:
  - Trim whitespace, ignore empty lines, preserve accents[cite: 1].
  - Reject empty input with a friendly error message[cite: 1].

### 4.3 Configuration Screen
- **Purpose**: Tailor audio pacing and UI adaptation[cite: 1].
- **Required Settings**:
  - **Repetitions**: `1`, `2` (Default), or `3`[cite: 1].
  - **Time between words**: `5s`, `10s` (Default), `15s`, `20s`, or Manual `Next`[cite: 1].
  - **Voice Speed**: `Lent` (0.7), `Normal` (0.9–1.0), `Rapide` (1.2)[cite: 1].
  - **Input Mode**: 
    - `Clavier` (Standard text box entry)[cite: 1].
    - `Oral / Autonome` (For smart displays without reliable virtual keyboards; student speaks/writes physically and taps to reveal/self-grade).
  - **Voice Selection**: Dropdown dynamically populated from browser's native `speechSynthesis.getVoices()` matching target language (Default: `fr-FR`).

### 4.4 Countdown Screen
- **Purpose**: Prepare the student visually and aurally[cite: 1].
- **Behavior**: Large screen-centered countdown numbers `3`, `2`, `1`, `C'est parti !`[cite: 1]. Automatically advances to the dictée screen[cite: 1].

### 4.5 Dictée Screen
- **Purpose**: Dictate one item at a time while safely collecting input without spoiling answers[cite: 1].
- **UI Elements**:
  - Progress tracking indicator (e.g., `Mot 3 / 12`) and Timer Countdown (`00:08`)[cite: 1].
  - **Typing Layout**: Large, isolated text input with native overrides to stop cheating/autocorrect:
    - input type="text" autocorrect="off" autocapitalize="none" spellcheck="false" autocomplete="off"
  - **Oral Layout**: Large hidden placeholder text with a massive `Afficher la réponse` call-to-action button.
  - Quick action controls: `🔊 Réécouter`, `⏸️ Pause`, `⏭️ Passer`[cite: 1].
- **Timing Constraint**: The countdown timer must only begin *after* the browser's speech synthesis has finished speaking the word combinations[cite: 1].

### 4.6 End of Dictée / Congratulations Screen
- **Purpose**: Brief intermediate celebration before analytical correction screens[cite: 1].

### 4.7 Correction Review Screen
- **Purpose**: Step-by-step evaluation of choices made[cite: 1].
- **Visuals**: Displays Expected word vs Student input side-by-side using calm, child-safe colors (Pastel Greens for Correct, Pastel Amber for Accent issues, Pastel Blue/Purple for Mistake items)[cite: 1].

### 4.8 Score Screen
- **Purpose**: Provide full clear stats and loop back options[cite: 1].
- **UI Elements**: Displays dynamic fractional score (e.g., `7 / 10`) alongside adaptive conditional looping buttons: `🔄 Rejouer uniquement les mots manqués` or `✨ Nouvelle dictée`[cite: 1].

---

## 5. Replay Missed Words Flow

- Only missed elements get added into the new operational active tracking array[cite: 1].
- Previously accurate entries persist intact across iterations[cite: 1].
- Newly amended accurate targets instantly overwrite the previous localized mistake data, dynamically recalculating the session score upwards until 100% completion is reached[cite: 1].

---

## 6. Grading and Normalization Core

\* export function normaliseBasic(value: string): string {
  \* return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
\* }

\* export function stripAccents(value: string): string {
  \* return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
\* }

\* export function gradeAnswer(expected: string, answer: string): "correct" | "almost_correct" | "incorrect" {
  \* const expectedBasic = normaliseBasic(expected);
  \* const answerBasic = normaliseBasic(answer);
  \* if (answerBasic === expectedBasic) return "correct";
  \* if (stripAccents(answerBasic) === stripAccents(expectedBasic)) return "almost_correct";
  \* return "incorrect";
\* }

---

## 7. Unified Local App State Machine

To prevent broken asset/route states on custom smart display browsers or when refreshing GitHub Pages sub-directories, routing is strictly forbidden[cite: 1]. App views are rendered conditionally using a single top-level `DicteeSession.state` state machine[cite: 1].

\* export type State = 'editing_words' | 'configuring' | 'countdown' | 'dictating' | 'reviewing' | 'score' | 'finished';

\* export type DicteeConfig = {
  \* repetitions: number;
  \* answerTimeSeconds: number;
  \* speechRate: number;
  \* voiceURI?: string;
  \* language: string;
  \* mode: "keyboard" | "oral";
\* };

\* export type DicteeSession = {
  \* state: State;
  \* words: { id: string; expected: string }[];
  \* currentIndex: number;
  \* answers: Record<string, string>;
  \* attempts: { wordId: string; answer: string; status: "correct" | "almost_correct" | "incorrect" }[];
\* };

---

## 8. Web Speech API Resilience Architecture

To ensure audio functions on resource-constrained embedded Chromium engines (like Meta Portal browsers) and strict mobile environments (iOS Safari):

1. **Initialization Rule**: Do not fire speech actions on page mount. Trigger native audio initialization (`speechSynthesis.getVoices()`) directly on the user's first interactive button click (`Nouvelle dictée`)[cite: 1].
2. **Fallback Mechanism**: If the target voice matching `fr-FR` cannot be parsed or loaded asynchronously, fallback immediately to the default device voice array (`voices[0]`) rather than crashing, displaying a safe, non-blocking UI alert banner.
3. **Queue Prevention**: Always invoke `window.speechSynthesis.cancel()` right before emitting new statements to clean stale buffers.

---

## 9. Responsive Layout Styling Specs

To accommodate phones, PCs, and smart displays seamlessly, the app relies on CSS Fluid Typography and flexible layouts, eliminating heavy UI framework requirements.

\* :root {
  \* --font-fluid-base: clamp(1.1rem, 2.5vw, 1.75rem);
  \* --font-fluid-heading: clamp(1.75rem, 5vw, 3.25rem);
\* }

\* .app-container {
  \* display: flex;
  \* flex-direction: column;
  \* justify-content: center;
  \* align-items: center;
  \* min-height: 100vh;
  \* padding: 1rem;
  \* background-color: #f8fafc;
\* }

\* .screen-card {
  \* width: 100%;
  \* max-width: 680px;
  \* background: #ffffff;
  \* border-radius: 1.5rem;
  \* padding: clamp(1.25rem, 4vw, 2.75rem);
  \* box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
\* }

\* .dictee-input {
  \* font-size: var(--font-fluid-base);
  \* padding: 1.25rem;
  \* border: 3px solid #e2e8f0;
  \* border-radius: 1rem;
  \* width: 100%;
  \* box-sizing: border-box;
\* }

---

## 10. Technical Stack & Target Deployment

- **Framework**: Vite + React + TypeScript[cite: 1].
- **Styling**: Tailwind CSS or Plain CSS Modules using the Responsive Layout Specs[cite: 1].
- **Assets & Service Workers**: Standard `vite-plugin-pwa` configuration for caching assets locally to allow offline installations via browser app shortcuts[cite: 1].
- **Hosting Target**: Static building directly pushed via automated workflow action or utility token (`gh-pages`) targeting GitHub Pages[cite: 1].
