# Architecture Context — PulseX

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| **Extension Platform** | Chrome Extension Manifest V3 | Standard extension manifest defining permissions, content scripts, background worker, and popup. |
| **Runtime / Background** | Background Service Worker (`background.js`) | Handles asynchronous runtime message routing, API requests to DeepSeek, and badge management. |
| **Content Injection** | Vanilla Classic Content Script (`content_script.js`) | Self-contained classic script injected into `x.com` and `twitter.com`. Observes DOM mutations and mounts UI. |
| **UI Isolation** | Web Components / Shadow DOM (`attachShadow({ mode: 'open' })`) | Encapsulates all PulseX CSS and DOM trees to prevent Twitter's Tailwind/CSS-in-JS from leaking in or out. |
| **AI Backend** | DeepSeek API (`https://api.deepseek.com/chat/completions`) | BYOK LLM engine supporting `deepseek-chat` (V3) and `deepseek-reasoner` (R1). |
| **Storage** | Chrome Storage API (`chrome.storage.local`) | Persists API keys, model selections, custom personas, and filter preferences locally in the browser. |
| **Testing** | Node.js 24 Native Test Runner (`node:test`, `node:assert/strict`) | Executes 37+ unit and integration tests across DOM parsers, message dispatchers, and prompts. |
| **Styling** | Cyber Glass / Obsidian Emerald CSS Custom Properties | Custom CSS embedded directly into Shadow DOM roots and popup stylesheets. |

## System Boundaries

- `extension/background.js`: Entry point for the Manifest V3 service worker. Registers onInstall lifecycle hooks and delegates incoming runtime messages to `message-handler.js`.
- `extension/content/content_script.js`: Self-contained classic script. Mounts the floating Copilot toggle and slide-out drawer, observes timeline reply boxes, cleans tweet metadata, and dispatches generation requests.
- `extension/popup/`: Contains `popup.html`, `popup.css`, and `popup.js`. Provides the settings interface for entering DeepSeek API keys, selecting models, and toggling features.
- `extension/utils/deepseek.js`: Pure ES module providing prompt templates, anti-slop rules, DeepSeek request payloads, key validation, and response parsers.
- `extension/utils/x-dom-helpers.js`: Pure ES module containing tweet extraction logic, author name parsers, thread context classifiers, and contenteditable locator utilities.
- `extension/utils/message-handler.js`: Pure ES module coordinating message actions (`VALIDATE_KEY`, `GENERATE_REPLY`, `COPILOT_CHAT`, `UPDATE_BADGE_COUNT`) with dependency injection for testability.
- `test-demo.html`: Independent, offline-capable test harness simulating Twitter's DOM structure, timeline cards, nested comments, and reply boxes.
- `tests/`: 9 modular test files exercising all business logic, prompt builders, schema constraints, and DOM helpers.

## Storage Model

- **Local Storage (`chrome.storage.local`)**:
  - `apiKey` (`string`): The user's personal DeepSeek API key (`sk-...`). Stored strictly on the user's local disk; never transmitted to any third-party telemetry or cloud service.
  - `model` (`string`): Selected model (`deepseek-chat` or `deepseek-reasoner`). Default: `deepseek-chat`.
  - `persona` (`string`): Custom instructions defining the user's preferred tone and style.
  - `adFilterEnabled` (`boolean`): Toggle determining whether sponsored tweets and crypto spam are hidden. Default: `true`.
- **Runtime Memory State**:
  - `seenEditors` (`WeakSet`): Tracks contenteditable elements that already have an attached PulseX action bar to prevent duplicate injections.
  - `chatHistory` (`Array<{ role: string, content: string }>`): In-memory conversation state for the active Copilot drawer session. Clears when the tab is closed.

## Auth and Access Model

- **Bring-Your-Own-Key (BYOK)**: Users provide their own DeepSeek API key. PulseX performs an instant lightweight validation ping (`max_tokens: 5`) to verify validity before saving.
- **Direct Client-to-API Communication**: All completions requests travel directly from the background service worker to `https://api.deepseek.com`. There are no intermediary proxy servers, user logins, or centralized databases.
- **Permissions Minimization**: Only `storage` is requested in `permissions`. Target host permissions are restricted strictly to `https://x.com/*`, `https://twitter.com/*`, and `https://api.deepseek.com/*`.

## Invariants

1. **Self-Contained Content Script**: `extension/content/content_script.js` must NEVER include top-level ES module `import` or `export` statements because Chrome loads content scripts as classic scripts.
2. **Zero Build Requirement**: The extension must load directly from `extension/` via `chrome://extensions/` without any prerequisite build step (`npm run build`, Webpack, Vite, or esbuild).
3. **No Direct Editor Overwrites**: Never mutate Twitter's Draft.js editor using `.innerText = ...` or `.textContent = ...`. Text insertion must use `document.execCommand('selectAll')` followed by `document.execCommand('insertText')` to synchronize React's internal editor state.
4. **Never Block Contenteditable Layout**: When injecting into Twitter's quick reply boxes, PulseX must mount directly above `div[data-testid="toolBar"]` and enforce `flex-direction: column !important;` on parent containers to ensure the composer remains 100% full width and is never squeezed into a side-by-side column.
5. **Human-in-the-Loop Guarantee**: PulseX must never automatically click the "Reply" or "Post" button on Twitter. Generated text is inserted only as an editable draft for the user to review.
6. **Strict Substance Anti-Slop**: Prompt generation must enforce anti-slop rules, strip view counts and timestamp clutter, and ban generic creator hustle platitudes (*"Views are vanity"*, *"consistency compounds"*, *"Keep shipping"*).
7. **Timeout Protection**: All DeepSeek network requests must incorporate an `AbortController` timeout (25s) and UI recovery timers to ensure the button never remains stuck on `"Analyzing..."`.
