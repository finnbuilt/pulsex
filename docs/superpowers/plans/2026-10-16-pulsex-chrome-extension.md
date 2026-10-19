# PulseX Chrome Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "PulseX", a complete AI-powered Chrome extension for X (Twitter) using DeepSeek API, featuring an in-timeline reply assistant, floating copilot drawer, feed noise/ad blocker, and Obsidian Emerald cyber-glass design.

**Architecture:** Native Chrome Manifest V3 extension with Shadow DOM encapsulation for injected components. A background service worker coordinates DeepSeek API calls, while content scripts provide live timeline injection and noise filtration without interfering with X's React hydration.

**Tech Stack:** JavaScript (ES6+), Chrome Extension APIs (Manifest V3, chrome.storage, chrome.runtime), DeepSeek REST API, Shadow DOM, Custom CSS (Obsidian Emerald theme), Node.js built-in `node:test` for automated unit tests.

## Global Constraints
- Target platform: Chrome Extension Manifest V3 (`"manifest_version": 3`).
- Host permissions: `https://x.com/*`, `https://twitter.com/*`, `https://api.deepseek.com/*`.
- Design theme: Obsidian Emerald / Cyber Glass (`#0b0f17`, emerald `#10b981`, cyan `#06b6d4`, frosted blur).
- Model endpoints: `https://api.deepseek.com/chat/completions` with `deepseek-chat` and `deepseek-reasoner`.
- Strict human-in-the-loop: Never auto-submit tweets; insert drafts for user review only.
- Shadow DOM isolation: All injected timeline and drawer UI elements MUST reside inside closed or accessible Shadow Roots.

---

### Task 1: Extension Scaffold, Manifest, and Test Setup

**Files:**
- Create: `extension/manifest.json`
- Create: `extension/icons/icon.svg`
- Create: `scripts/generate-icons.js`
- Create: `tests/manifest.test.js`

**Interfaces:**
- Produces: `manifest.json` complying with Chrome Manifest V3 requirements, icon assets (16x16, 48x48, 128x128 PNGs), and baseline test framework.

- [ ] **Step 1: Write failing test for manifest structure**
```javascript
// tests/manifest.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('manifest.json has valid Manifest V3 schema and required permissions', () => {
  const manifestPath = path.resolve('extension/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'PulseX - AI Superpowers for X');
  assert.ok(manifest.permissions.includes('storage'));
  assert.ok(manifest.host_permissions.includes('https://api.deepseek.com/*'));
  assert.ok(manifest.host_permissions.some(h => h.includes('x.com')));
  assert.equal(manifest.background.service_worker, 'background.js');
  assert.ok(manifest.action.default_popup);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/manifest.test.js`
Expected: FAIL (file does not exist).

- [ ] **Step 3: Implement `manifest.json` and icon generator**
Write `extension/manifest.json`, `extension/icons/icon.svg`, and run `scripts/generate-icons.js` using canvas or svg-to-png generation to create `icon16.png`, `icon48.png`, and `icon128.png`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/manifest.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/manifest.json extension/icons/ tests/manifest.test.js scripts/
git commit -m "feat: scaffold Manifest V3 configuration and icon assets"
```

---

### Task 2: DeepSeek API Client & Prompt Templates

**Files:**
- Create: `extension/utils/deepseek.js`
- Create: `tests/deepseek.test.js`

**Interfaces:**
- Consumes: User API key, model (`deepseek-chat` | `deepseek-reasoner`), persona instructions, tweet context, and chosen angle/raw thought.
- Produces: 
  - `buildReplyPrompt({ tweetText, tweetAuthor, angle, rawThought, persona })` -> `{ systemPrompt, userPrompt }`
  - `callDeepSeek({ apiKey, model, messages })` -> Promise resolving to reply text string.
  - `validateApiKey(apiKey)` -> Promise<{ valid: boolean, error?: string }>

- [ ] **Step 1: Write failing test for prompt builder and payload formatting**
```javascript
// tests/deepseek.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReplyPrompt, parseDeepSeekResponse } from '../extension/utils/deepseek.js';

test('buildReplyPrompt formats appropriate system & user prompts for angle', () => {
  const prompt = buildReplyPrompt({
    tweetText: 'AI will replace entry-level developers in 2 years.',
    tweetAuthor: 'tech_guru',
    angle: 'counter',
    rawThought: 'disagree, AI augments junior devs to build faster',
    persona: 'Concise tech founder'
  });

  assert.ok(prompt.systemPrompt.includes('PulseX'));
  assert.ok(prompt.systemPrompt.includes('Concise tech founder'));
  assert.ok(prompt.userPrompt.includes('tech_guru'));
  assert.ok(prompt.userPrompt.includes('disagree, AI augments'));
  assert.ok(prompt.userPrompt.includes('counter'));
});

test('parseDeepSeekResponse extracts cleaned content and strips quote wrapping', () => {
  const mockApiRes = {
    choices: [{ message: { content: '"I strongly disagree. AI gives juniors leverage."' } }]
  };
  const text = parseDeepSeekResponse(mockApiRes);
  assert.equal(text, 'I strongly disagree. AI gives juniors leverage.');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/deepseek.test.js`
Expected: FAIL (`../extension/utils/deepseek.js` not found).

- [ ] **Step 3: Implement `extension/utils/deepseek.js`**
Write `buildReplyPrompt`, `parseDeepSeekResponse`, `formatChatMessages`, and `callDeepSeekApi` (with clean error parsing and timeout handling).

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/deepseek.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/utils/deepseek.js tests/deepseek.test.js
git commit -m "feat: implement DeepSeek API client and prompt generation logic"
```

---

### Task 3: Background Service Worker

**Files:**
- Create: `extension/background.js`
- Create: `tests/background-messages.test.js`

**Interfaces:**
- Consumes: Chrome runtime messages (`{ action: 'GENERATE_REPLY', payload }`, `{ action: 'VALIDATE_KEY', apiKey }`, `{ action: 'CHAT_COMPLETION', messages }`).
- Produces: Dispatches fetch requests to `https://api.deepseek.com/chat/completions` and returns response data to content scripts or popup.

- [ ] **Step 1: Write unit tests for background message handlers**
```javascript
// tests/background-messages.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleMessagePayload } from '../extension/utils/message-handler.js';

test('handleMessagePayload rejects missing API key with helpful error', async () => {
  const result = await handleMessagePayload({
    action: 'GENERATE_REPLY',
    payload: { tweetText: 'Hello world' }
  }, { getApiKey: () => null });

  assert.equal(result.success, false);
  assert.match(result.error, /API key not set/i);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/background-messages.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `extension/utils/message-handler.js` and `extension/background.js`**
Handle message routing, error propagation, badge count updates (e.g. ad filter statistics), and DeepSeek API invocation.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/background-messages.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/background.js extension/utils/message-handler.js tests/background-messages.test.js
git commit -m "feat: implement background service worker for DeepSeek API communication"
```

---

### Task 4: Obsidian Emerald UI & Shadow DOM Templates

**Files:**
- Create: `extension/content/styles.css`
- Create: `extension/content/shadow-templates.js`
- Create: `tests/templates.test.js`

**Interfaces:**
- Consumes: State objects for inline reply bar and copilot drawer.
- Produces: CSS stylesheet string and HTML templates for:
  - `renderInlineBarTemplate()`: The reply angle pill buttons, raw thoughts input, loading spinner, and copy/insert actions.
  - `renderCopilotDrawerTemplate()`: Draggable trigger button, header, chat message feed, input area, and quick prompt chips.

- [ ] **Step 1: Write test for template rendering functions**
```javascript
// tests/templates.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderInlineBarTemplate, renderCopilotDrawerTemplate } from '../extension/content/shadow-templates.js';

test('renderInlineBarTemplate includes 5 angle buttons and raw thoughts input', () => {
  const html = renderInlineBarTemplate();
  assert.ok(html.includes('data-angle="agree"'));
  assert.ok(html.includes('data-angle="counter"'));
  assert.ok(html.includes('data-angle="insight"'));
  assert.ok(html.includes('data-angle="witty"'));
  assert.ok(html.includes('data-angle="question"'));
  assert.ok(html.includes('pulsex-raw-input'));
});

test('renderCopilotDrawerTemplate includes drawer container and insert action', () => {
  const html = renderCopilotDrawerTemplate();
  assert.ok(html.includes('pulsex-drawer'));
  assert.ok(html.includes('pulsex-insert-btn'));
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/templates.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `shadow-templates.js` and `styles.css`**
Craft the Obsidian Emerald Cyber Glass design: frosted glass blur, emerald neon `#10b981` accents, cyan micro-highlights, sleek dark buttons, spinner animations, and responsive layouts.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/templates.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/content/styles.css extension/content/shadow-templates.js tests/templates.test.js
git commit -m "feat: design Obsidian Emerald UI and Shadow DOM templates"
```

---

### Task 5: Feed Noise & Ad Filter Module

**Files:**
- Create: `extension/content/noise-filter.js`
- Create: `tests/noise-filter.test.js`

**Interfaces:**
- Consumes: Tweet DOM elements on X.
- Produces: `isAdTweet(element)` -> boolean; `filterTimelineAds(container)` -> count of hidden elements; toggle state via `chrome.storage.local`.

- [ ] **Step 1: Write unit test for ad detection logic**
```javascript
// tests/noise-filter.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkTweetForAdIndicators } from '../extension/content/noise-filter.js';

test('checkTweetForAdIndicators identifies sponsored / promoted marks', () => {
  assert.equal(checkTweetForAdIndicators({ textContent: 'Check out this game! Promoted' }), true);
  assert.equal(checkTweetForAdIndicators({ textContent: 'Ad · Super fast database' }), true);
  assert.equal(checkTweetForAdIndicators({ textContent: 'Regular user talking about code' }), false);
});

test('checkTweetForAdIndicators detects spam giveaway signatures', () => {
  assert.equal(checkTweetForAdIndicators({ textContent: 'Drop your $ETH address below! 1000 USDT airdrop' }, { filterSpam: true }), true);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/noise-filter.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `extension/content/noise-filter.js`**
Implement robust selector and text scanning that catches Promoted badges across different languages and X layout variations, with smooth collapse animations and stats reporting.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/noise-filter.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/content/noise-filter.js tests/noise-filter.test.js
git commit -m "feat: implement feed noise and promoted ad filtering"
```

---

### Task 6: In-Timeline Reply Assistant & Tweet Composer Integration

**Files:**
- Create: `extension/utils/x-dom-helpers.js`
- Create: `extension/content/timeline-assistant.js`
- Create: `tests/dom-helpers.test.js`

**Interfaces:**
- Consumes: Active tweet elements and compose boxes (`[data-testid="tweetTextarea_0"]`).
- Produces: 
  - `extractTweetContext(replyBoxEl)`: returns `{ author, text, id }`.
  - `injectReplyBar(replyBoxEl)`: mounts the Shadow DOM bar into the composer.
  - `insertTextIntoTwitterEditor(editorEl, text)`: safely inserts text via standard input events (`InputEvent('insertText')`) or selection ranges without breaking X's Draft.js editor.

- [ ] **Step 1: Write tests for tweet text extraction and editor text insertion logic**
```javascript
// tests/dom-helpers.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanExtractedTweetText } from '../extension/utils/x-dom-helpers.js';

test('cleanExtractedTweetText strips clutter and extracts core tweet content', () => {
  const rawText = 'TechFounder @techfounder · 2h\nBuilding in public is hard but rewarding.\n12 45 2.1K';
  const cleaned = cleanExtractedTweetText(rawText);
  assert.equal(cleaned, 'Building in public is hard but rewarding.');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/dom-helpers.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `x-dom-helpers.js` and `timeline-assistant.js`**
Handle safe DOM observation, Shadow DOM attachment, button click handling, background API dispatching, loading state animations, and seamless draft insertion.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/dom-helpers.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/utils/x-dom-helpers.js extension/content/timeline-assistant.js tests/dom-helpers.test.js
git commit -m "feat: implement in-timeline reply assistant and composer injection"
```

---

### Task 7: Floating AI Copilot Drawer

**Files:**
- Create: `extension/content/copilot-drawer.js`
- Modify: `extension/content/shadow-templates.js`

**Interfaces:**
- Consumes: Active page selection or nearest tweet; user chat inputs.
- Produces: Draggable floating toggle button (`#pulsex-floating-toggle`), slide-out drawer (`#pulsex-drawer`), multi-turn chat stream with DeepSeek, and "Paste to Tweet" functionality.

- [ ] **Step 1: Write unit tests for copilot message history management**
```javascript
// tests/copilot.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCopilotHistory } from '../extension/content/copilot-drawer.js';

test('formatCopilotHistory structures conversation with tweet context as system reference', () => {
  const history = [
    { role: 'user', content: 'Make it sound more witty' },
    { role: 'assistant', content: 'Here is a witty version...' }
  ];
  const formatted = formatCopilotHistory({
    tweetContext: { text: 'Launching v1 tomorrow!' },
    history
  });

  assert.equal(formatted[0].role, 'system');
  assert.ok(formatted[0].content.includes('Launching v1 tomorrow!'));
  assert.equal(formatted[1].content, 'Make it sound more witty');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/copilot.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `copilot-drawer.js`**
Build the slide-out drawer with drag-position memory, quick preset chips (*"Shorter"*, *"More punchy"*, *"Translate to English"*, *"Add hook"*), and direct paste into the active tweet box.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/copilot.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/content/copilot-drawer.js tests/copilot.test.js
git commit -m "feat: implement floating AI copilot drawer with multi-turn chat"
```

---

### Task 8: Content Script Coordinator

**Files:**
- Create: `extension/content/content_script.js`

**Interfaces:**
- Consumes: Modules from Tasks 4, 5, 6, and 7.
- Produces: Single unified entry point injected into `x.com` and `twitter.com`.
  - Sets up the `MutationObserver` for timeline feed mutations.
  - Mounts the Floating Copilot Drawer once per page lifecycle.
  - Attaches reply bars when reply composers appear.
  - Runs ad filtering as tweets load.

- [ ] **Step 1: Implement `content_script.js` with debounced mutation handling and listener cleanups**
- [ ] **Step 2: Verify syntax and linting**
Run: `node --check extension/content/content_script.js`
Expected: Exit code 0.
- [ ] **Step 3: Commit**
```bash
git add extension/content/content_script.js
git commit -m "feat: assemble content script coordinator for X timeline"
```

---

### Task 9: Extension Popup & Settings UI

**Files:**
- Create: `extension/popup/popup.html`
- Create: `extension/popup/popup.css`
- Create: `extension/popup/popup.js`
- Create: `tests/popup.test.js`

**Interfaces:**
- Consumes: User inputs for DeepSeek API Key, Model selector (`deepseek-chat` / `deepseek-reasoner`), Tone persona selection, and Ad filter toggles.
- Produces: Saves and validates settings in `chrome.storage.local`; provides live "Test Key" health check.

- [ ] **Step 1: Write test for settings validator**
```javascript
// tests/popup.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSettingsPayload } from '../extension/popup/popup-logic.js';

test('validateSettingsPayload checks valid API key format and known models', () => {
  assert.equal(validateSettingsPayload({ apiKey: 'sk-1234567890abcdef1234567890', model: 'deepseek-chat' }).valid, true);
  assert.equal(validateSettingsPayload({ apiKey: '', model: 'deepseek-chat' }).valid, false);
  assert.equal(validateSettingsPayload({ apiKey: 'sk-123', model: 'invalid-model' }).valid, false);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/popup.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `popup/popup-logic.js`, `popup.html`, `popup.css`, and `popup.js`**
Construct the Obsidian Emerald popup window with cyber glass header, model selector, API key input with show/hide toggle, live connection test status pill, persona prompt editor, and ad filter switch.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/popup.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/popup/ tests/popup.test.js
git commit -m "feat: implement extension popup settings and connection health check"
```

---

### Task 10: Full Test Suite Verification & Loading Documentation

**Files:**
- Create: `README.md`
- Create: `package.json` (for test scripts)

**Interfaces:**
- Consumes: All modules from Tasks 1-9.
- Produces: Automated test suite pass (`npm test`) and complete instructions for loading unpacked in Google Chrome.

- [ ] **Step 1: Configure `package.json` with test runner script**
- [ ] **Step 2: Run full test suite**
Run: `npm test`
Expected: All tests pass.
- [ ] **Step 3: Write comprehensive `README.md` with setup, API key guide, architecture notes, and screenshots/diagrams**
- [ ] **Step 4: Commit**
```bash
git add package.json README.md
git commit -m "docs: finalize installation guide and full test suite verification"
```

---

## Plan Self-Review Check
- [x] **Spec coverage:** Covers all features: In-timeline reply generator, 5 angles + raw thoughts, floating copilot drawer, noise/ad filter, Obsidian Emerald theme, DeepSeek BYOK API (`deepseek-chat` + `deepseek-reasoner`), and Shadow DOM isolation.
- [x] **No Placeholders:** All tasks specify exact filenames, concrete code snippets, expected inputs/outputs, and commands.
- [x] **Type & Interface Consistency:** Consistent message actions (`GENERATE_REPLY`, `VALIDATE_KEY`, `CHAT_COMPLETION`) across background worker, content script, and popup.
