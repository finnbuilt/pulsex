# Design Specification: PulseX Chrome Extension

**Date:** 2026-10-16  
**Status:** Approved  
**Aesthetic:** Obsidian Emerald / Cyber Glass  
**Target Platform:** Google Chrome (Manifest V3)  
**Host Scope:** `https://x.com/*`, `https://twitter.com/*`  
**AI Engine:** DeepSeek API (`deepseek-chat`, `deepseek-reasoner`)  

---

## 1. Executive Summary

**PulseX** is an AI-powered Chrome extension designed for X (Twitter) creators, founders, and professionals. Unlike generic tweet bots, PulseX operates on the **human-in-the-loop** principle: it turns raw, messy thoughts into high-engagement, authentic replies directly inside the X timeline, while also filtering out feed noise and ads.

The design philosophy avoids the purple-blue gradient aesthetic of tools like SignalX in favor of an **Obsidian Emerald / Cyber Glass** theme: deep onyx and obsidian slate surfaces, subtle glassmorphic blur, vibrant emerald (`#10b981`) and electric cyan accents, crisp monospace-influenced typography, and responsive micro-interactions.

---

## 2. Architecture & Tech Stack

### 2.1 Manifest V3 Architecture
PulseX uses native Manifest V3 web standards with zero build step requirement:
- **`manifest.json`**: Declares host permissions for `https://x.com/*`, `https://twitter.com/*`, and `https://api.deepseek.com/*`, storage permission, and content scripts.
- **`background.js` (Service Worker)**: Handles cross-origin network requests to DeepSeek's API endpoint (`https://api.deepseek.com/chat/completions`), avoiding CORS limitations in content scripts, and manages global extension state.
- **`content_script.js`**: Injected into X pages. Uses a resilient `MutationObserver` to attach interactive controls to tweets and compose boxes.
- **Shadow DOM Isolation**: All injected UI (the floating copilot drawer, inline toolbar, reply angle buttons) is rendered inside closed Shadow DOM boundaries to prevent CSS collisions with X's Twitter styles.
- **`popup/` (Extension Popup & Settings)**: Allows the user to configure their DeepSeek API key, select models, adjust persona preferences, and toggle the Feed Noise & Ad Filter.
- **Storage**: Chrome Local Storage (`chrome.storage.local`) securely persists the user's API key, model choice, persona instructions, and filter toggles.

```
pulsex-extension/
├── manifest.json
├── background.js
├── content/
│   ├── content_script.js
│   ├── styles.css
│   └── shadow-dom-templates.js
├── popup/
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── utils/
    ├── deepseek.js
    └── x-dom-helpers.js
```

---

## 3. Core Features & User Workflows

### 3.1 In-Timeline DeepSeek Reply Assistant
1. **Triggering**: When a user clicks to reply to any tweet on X, the extension identifies the active reply compose box (`[data-testid="tweetTextarea_0"]`).
2. **Toolbar Injection**: PulseX attaches an Obsidian Emerald toolbar directly above or within the reply composer.
3. **Quick Angles**:
   - **Agree & Expand**: Adds depth, corroboration, or personal perspective.
   - **Constructive Counter**: Respectfully challenges or offers an alternative angle.
   - **Value-Add Insight**: Shares a actionable takeaway, metric, or resource.
   - **Witty / Punchy**: Fast, memorable, high-tempo remark.
   - **Question / Conversation Starter**: Poses an engaging open-ended question.
4. **"Raw Thoughts" Input**:
   - A minimalist micro-input field: *"Type your raw thought..."* (e.g., *"agree with point 2 but pricing too high for startups"*).
   - DeepSeek transforms this rough sketch into a polished, natural-sounding reply.
5. **Human Approval**: The generated text is placed directly into X's `draft-js` or `contenteditable` editor, allowing the user to review, edit, or regenerate before sending.

### 3.2 Floating AI Copilot Drawer (Side Drawer)
- **Activation**: A sleek, draggable hexagonal/pill floating button positioned at the right margin of the browser window.
- **Context Reader**: When opened, PulseX automatically detects the currently focused or nearest tweet, extracting author, tweet body, and parent thread.
- **Chat Iteration**: A multi-turn chat panel where users can request adjustments: *"Make it sound more punchy"*, *"Translate to clean English"*, or *"Give me 3 alternative options"*.
- **One-Click Insert**: A *"Paste to Tweet"* button copies the chosen output directly into the active tweet editor.

### 3.3 Smart Feed Noise & Ad Filter
- **Ad/Promoted Tweet Blocker**: Detects tweets marked with "Ad", "Promoted", or sponsored indicators and hides them seamlessly.
- **Crypto / Low-Quality Spam Blocker**: Optional keyword filter for repetitive hype phrases (e.g., "giveaway", "airdrop", "$SOL address below").
- **Stat Counter**: Shows the user how many ads and clutter elements were hidden during the browsing session.

### 3.4 BYOK DeepSeek Settings & Persona Customization
- **API Key Management**: Secure key input with a "Test Connection" button that validates the key against DeepSeek's model list.
- **Model Choice**:
  - `deepseek-chat` (DeepSeek-V3): Default, ultra-fast, cost-effective for conversational replies.
  - `deepseek-reasoner` (DeepSeek-R1): Uses chain-of-thought reasoning for complex, nuanced arguments.
- **Custom Persona Prompting**:
  - Users can define their personal tone: *"Direct, analytical, concise, no hashtags, no generic praise, sound like a seasoned tech founder."*

---

## 4. Visual Design: Obsidian Emerald & Cyber Glass

| Element | Specification |
| :--- | :--- |
| **Background (Main)** | Deep Obsidian Slate (`#0b0f17`) with `rgba(16, 24, 39, 0.85)` glass backdrop |
| **Border & Dividers** | Subtle emerald-tinted borders (`rgba(16, 185, 129, 0.2)` to `rgba(255, 255, 255, 0.08)`) |
| **Accent Glow** | Radiant Emerald (`#10b981`) and Cyber Cyan (`#06b6d4`) with soft box-shadows |
| **Text Primary** | Pure Crisp White (`#f8fafc`) |
| **Text Secondary** | Muted Silver/Slate (`#94a3b8`) |
| **Blur Effect** | `backdrop-filter: blur(14px) saturate(160%)` |
| **Typography** | Inter / System UI sans-serif with subtle tabular mono accents for badges |

---

## 5. Security, Privacy & Safety Guidelines
- **API Key Safety**: DeepSeek API keys are stored only in the user's local `chrome.storage.local` and transmitted exclusively to `https://api.deepseek.com/chat/completions`. No 3rd-party proxy or tracking servers.
- **Zero Auto-Posting**: PulseX strictly never auto-posts or simulates mouse clicks on Twitter's "Post" button. Every reply must be explicitly approved and clicked by the user.
- **X Policy Compliance**: Non-invasive DOM additions encapsulated inside Shadow DOM; no reverse-engineering of authenticated X internal private APIs.
