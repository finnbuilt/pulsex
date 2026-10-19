# Exact Cyber Color & Font Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the PulseX Chrome extension and landing page to use the exact colors, typography (`Plus Jakarta Sans` & `JetBrains Mono`), and futuristic cyber card components from the reference image (`Dappback` showcase).

**Architecture:** 
1. Import and apply modern geometric typography (`Plus Jakarta Sans` for UI, `JetBrains Mono` for code/numbers).
2. Unify the cyber color system: Deep matte obsidian navy (`#090b11`, `#0f131d`), beveled container surfaces (`#151b28`, `#121622`), electric cyan glow notches (`#38bdf8`), glowing violet vertical accent lines (`#8b5cf6`), and the signature pastel iridescent gradient (`linear-gradient(135deg, #b8c7ff 0%, #d8e2ff 40%, #fffae0 70%, #fde68a 100%)`).
3. Apply this coherent design system across the Landing Page (`docs/index.html`), Extension Popup (`extension/popup/`), and In-Timeline Shadow DOM (`extension/content/shadow-templates.js`).

**Tech Stack:** HTML5, CSS3 Custom Properties, Vanilla JavaScript (Chrome MV3), Node.js Test Runner.

## Global Constraints

- Manifest V3 compliance with zero external runtime scripts in content scripts.
- Shadow DOM isolation preserved for all injected Twitter in-timeline components.
- Zero breaking changes to existing multi-provider BYOK logic.
- All 55 automated unit tests must continue to pass cleanly (`npm test`).

---

### Task 1: Unify Typography & Color Tokens in Landing Page (`docs/index.html`)

**Files:**
- Modify: `docs/index.html`

**Interfaces:**
- Consumes: Google Fonts (`Plus Jakarta Sans` weights 400, 500, 600, 700, 800, 900; `JetBrains Mono` weights 400, 600, 700).
- Produces: Updated CSS root variables (`--bg-base: #080b12`, `--bg-surface: #0f131d`, `--bg-card: #151b28`, `--cyan-neon: #38bdf8`, `--violet-neon: #8b5cf6`, `--iridescent-activate: linear-gradient(...)`).

- [x] **Step 1: Add Google Font link tag in `<head>`**
  Add `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap` to `docs/index.html`.

- [x] **Step 2: Update CSS `:root` variables and typography rules**
  Set `font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;` on `body` and update color tokens to match the reference image.

- [x] **Step 3: Update Cyber Showcase modal styling**
  Ensure the central modal, target profile card, electric cyan notch, violet left bar, floating social capsule, and iridescent button have exact pixel dimensions, glows, and colors from the reference image.

- [x] **Step 4: Verify visually and validate links**
  Ensure the page renders cleanly and interactive angle switching and email download flows work.

---

### Task 2: Align Extension Popup Styling (`extension/popup/`)

**Files:**
- Modify: `extension/popup/popup.html`
- Modify: `extension/popup/popup.css`

**Interfaces:**
- Consumes: `Plus Jakarta Sans` font, cyber color tokens.
- Produces: Popup styled with exact reference card borders, cyan glow tab, violet accent strips, and iridescent Save button.

- [x] **Step 1: Add Google Font link to `extension/popup/popup.html`**
  Add font preconnect and stylesheet link for `Plus Jakarta Sans` in `popup.html`.

- [x] **Step 2: Update `extension/popup/popup.css` root variables & card rules**
  Update `--bg-base` to `#0d121c`, `--bg-card` to `#151b28`, header notch to `#38bdf8` glow, and `.px-btn-primary` to the iridescent gradient button.

- [x] **Step 3: Add left-edge violet accent bar to main settings container or stat cards**
  Add the vertical accent line (`#8b5cf6`) to `.px-stat-card` or the active form card.

---

### Task 3: Align In-Timeline & Copilot Shadow DOM Styles (`extension/content/shadow-templates.js`)

**Files:**
- Modify: `extension/content/shadow-templates.js`
- Test: `tests/templates.test.js`

**Interfaces:**
- Consumes: `getShadowStyles()` in `shadow-templates.js`.
- Produces: Shadow DOM CSS containing the reference cyber colors (deep obsidian navy, electric cyan, violet accent, iridescent insert button).

- [x] **Step 1: Update `getShadowStyles()` color tokens**
  Update `getShadowStyles()` CSS variables:
  `--px-bg: #0d121c`, `--px-surface: #151b28`, `--px-border: rgba(255, 255, 255, 0.08)`, `--px-cyan: #38bdf8`, `--px-violet: #8b5cf6`.

- [x] **Step 2: Style the Insert/Action button with the iridescent gradient**
  Update `.px-insert-btn` in `shadow-templates.js` to use the pastel iridescent gradient with bold dark text.

- [x] **Step 3: Run automated tests to verify template tests pass**
  Run: `npm test`
  Expected: PASS (all 55 tests passing).

---

### Task 4: Re-Package Extension & Update Release Artifacts

**Files:**
- Modify: `pulsex-cws.zip`
- Modify: `docs/pulsex-cws.zip`
- Modify: `context/progress-tracker.md`

- [x] **Step 1: Execute package script**
  Run: `npm run package:cws`
  Expected: Generated `pulsex-cws.zip`.

- [x] **Step 2: Copy to `docs/pulsex-cws.zip`**
  Ensure the static site has the updated archive.

- [x] **Step 3: Update `context/progress-tracker.md`**
  Record Unit 24 with the exact cyber color and font alignment.

- [x] **Step 4: Run test suite**
  Run: `npm test`
  Expected: 55/55 tests passing.

---

### Task 5: Commit & Push to GitHub

**Files:**
- Git repository `main` branch.

- [x] **Step 1: Stage and commit changes**
  `git commit -m "feat: apply exact cyber colors, typography, and card aesthetics from reference image"`

- [x] **Step 2: Push to GitHub remote**
  Push to `https://github.com/finnbuilt/pulsex.git` as `finnbuilt`.

- [x] **Step 3: Verify live deployment & contributors API**
  Confirm GitHub Pages HTTP 200 and contributor count = 1.
