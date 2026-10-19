# Code Standards — PulseX

## General Principles

- **Zero Workarounds, Fix Root Causes**: Address root architectural issues (such as Twitter flex-row layouts or Draft.js React state listeners) directly at the source rather than layering brittle DOM hacks.
- **Human-in-the-Loop Always**: Never automate tweet posting or form submission. Assist, draft, and insert into the composer, but leave the final click to the user.
- **Fail Fast & Recover Gracefully**: Guard all asynchronous operations with timeouts and error handlers. A failed API call must never freeze the interface or leave buttons locked in disabled states.
- **Zero-Bundler Simplicity**: Preserve clean, native web standards. Avoid adding Webpack, Vite, Babel, or heavy npm dependencies that prevent instant loading in Chrome.

## TypeScript Rules and JavaScript Standards

- **TypeScript Rules & Types**: All interfaces and data shapes conform to strict type definitions. Even in pure JS files, JSDoc annotations provide complete type signatures.
- **Classic Script for Content**: `extension/content/content_script.js` must remain a classic script without top-level `import`/`export` statements. Wrap the implementation in an IIFE `(function () { 'use strict'; ... })();` and check `window.__PULSEX_LOADED__` to prevent duplicate execution.
- **Temporal Dead Zone (TDZ) Awareness**: Never reference `const` or `let` variables prior to their lexical declaration. Ensure all DOM nodes and variables are declared before being referenced in calculations or parent styles.
- **Draft.js / Lexical Editor Insertion**:
  - Always focus and click the contenteditable element first: `editorEl.focus(); editorEl.click();`.
  - Execute native `document.execCommand('selectAll', false, null)` followed by `document.execCommand('insertText', false, textToInsert)`.
  - Dispatch a synthetic `input` event to inform framework listeners: `editorEl.dispatchEvent(new Event('input', { bubbles: true }))`.
  - Always copy the inserted text to `navigator.clipboard.writeText()` as an immediate backup for the user.
- **Safe DeepSeek API Calling**:
  - Check model type: if `model === 'deepseek-reasoner'`, never pass `temperature` (returns HTTP 400 Bad Request) and expand `max_tokens` to `2048`.
  - Include an `AbortController` timeout (25s) with `signal` attached to every `fetch()`.

## Styling Conventions

- **Shadow DOM Encapsulation**: All injected in-timeline toolbars and floating copilot drawers must be attached inside an open Shadow Root (`host.attachShadow({ mode: 'open' })`) with isolated CSS returned by `getPulseXStyles()`.
- **Flex Column Layout Enforcement**: When injecting toolbars into Twitter's quick-reply containers, set `container.style.setProperty('flex-direction', 'column', 'important')` and `label.style.setProperty('width', '100%', 'important')` to prevent horizontal squishing.
- **CSS Custom Properties**: Always define and use theme tokens (`--px-bg`, `--px-emerald`, `--px-border`, etc.) instead of hardcoded hex values across inline templates.
- **Z-Index Hierarchy**: Floating drawer and toggle use `z-index: 2147483647` (maximum) to float above full-screen Twitter overlays; inline toolbars use `z-index: 10`.

## File Organization

- `extension/`: Root folder loaded as an unpacked extension in Chrome.
  - `manifest.json`: Manifest V3 specification.
  - `background.js`: Service worker entry point.
  - `content/`: Content scripts and companion CSS.
    - `content_script.js`: Self-contained injected script for timeline & copilot.
    - `styles.css`: Backup and web-accessible stylesheet.
  - `popup/`: Settings popup page (`popup.html`, `popup.css`, `popup.js`).
  - `utils/`: Reusable ES modules.
    - `deepseek.js`: API payload builder, prompt generation, anti-slop rules, response parsing.
    - `x-dom-helpers.js`: Tweet extraction, author parsing, contenteditable locator, and editor insertion.
    - `message-handler.js`: Runtime message router with dependency injection for testability.
  - `icons/`: Extension icons (`icon16.png`, `icon48.png`, `icon128.png`).
- `tests/`: Automated unit and integration test suite (`*.test.js`) executed via `npm test`.
- `context/`: 6 ContextZen methodology files defining complete agent specifications.
- `docs/superpowers/`: Architecture specs and execution plans.
- `test-demo.html`: Standalone browser fixture for testing context extraction and replies.
