# ⚡ PulseX - AI Superpowers for X (Twitter)

> **Craft authentic, high-impact replies on X powered by DeepSeek AI — with an Obsidian Emerald cyber-glass aesthetic.**

PulseX is a Chrome extension (Manifest V3) that elevates your presence on X (Twitter). Rather than generating robotic AI spam, PulseX acts as a **human-in-the-loop thinking partner**: turning rough thoughts into polished, contextual replies directly inside the X timeline, providing a floating multi-turn copilot drawer, and cleaning your feed of promoted noise.

---

## ✨ Features

### 1. In-Timeline Reply Assistant
- **Automatic Attachment**: Injects a custom Obsidian Emerald toolbar directly above active reply compose boxes on `x.com`.
- **5 Strategic Angles**:
  - 🤝 **Agree & Expand**: Validate the author and add real-world nuance or examples.
  - ⚡ **Counter Angle**: Present a polite, constructive alternative perspective or trade-off.
  - 💡 **Insight**: Deliver practical frameworks, data, or actionable takeaways.
  - 🎯 **Witty**: Fast, clever, dry-humor observations designed to entertain and spark engagement.
  - ❓ **Question**: High-leverage conversation starters that prompt replies.
- **"Raw Thoughts" Input**: Type shorthand ideas (e.g. *"disagree with #2, pricing hurts early startups"*) and let DeepSeek draft a fluent, authentic reply.
- **Draft Preview & Insert**: Preview the output, discard if needed, or click **"Insert into Tweet"** to paste it straight into Twitter's editor for your final touch.

### 2. Floating AI Copilot Drawer
- **Draggable Cyber Pill**: A non-intrusive floating button that you can position anywhere along the screen.
- **Smart Context Detection**: Automatically captures the author and content of the tweet you are currently reading.
- **Multi-Turn Chat**: Ask DeepSeek to iterate, shorten, rephrase, translate into clean English, or brainstorm punchy variations.
- **1-Click Insert**: Transfers the chosen answer into the active reply editor.

### 3. Smart Noise & Ad Filter
- Seamlessly hides **Promoted / Sponsored** tweets and crypto spam giveaway noise.
- Live badge counter on the extension icon showing how many distractions were removed during your session.
- Instant toggle in extension settings.

### 4. Direct DeepSeek BYOK Integration
- Bring Your Own Key (BYOK) — direct connection to `https://api.deepseek.com`.
- Choose between:
  - **`deepseek-chat` (DeepSeek-V3)**: Ultra-fast and conversational.
  - **`deepseek-reasoner` (DeepSeek-R1)**: Deep chain-of-thought reasoning for nuanced, analytical takes.
- Custom Persona & Tone instructions to mirror your personal voice.
- One-click **Test Connection** health check.

---

## 🎨 Design Aesthetic: Obsidian Emerald / Cyber Glass

PulseX intentionally breaks away from the generic purple-blue gradient look of existing extensions:
- **Obsidian & Onyx Surfaces**: Deep slate `#0a0f17` with subtle frosted glass blur (`backdrop-filter: blur(14px)`).
- **Emerald Glow**: `#10b981` radiant accents, neon cyan `#06b6d4` telemetry micro-highlights.
- **Shadow DOM Isolation**: All injected timeline components run in closed/accessible Shadow DOM roots, making them completely immune to Twitter's dynamic CSS changes.

---

## 🚀 How to Install in Google Chrome

PulseX is built with zero build step dependencies, so you can install and test it immediately:

1. **Open Extensions Page**:
   In Google Chrome, navigate to:
   ```
   chrome://extensions
   ```
2. **Enable Developer Mode**:
   Toggle the **Developer mode** switch in the top-right corner.
3. **Load Unpacked**:
   - Click the **"Load unpacked"** button in the top-left.
   - Select the `extension/` directory inside this project:
     ```
     <project-folder>/extension
     ```
4. **Configure your DeepSeek API Key**:
   - Click the **PulseX** extension icon in your Chrome toolbar.
   - Paste your DeepSeek API key (starts with `sk-...`).
   - Click **"⚡ Test Connection"** to verify connection.
   - Click **"Save Settings"**.
5. **Open X**:
   Go to [https://x.com](https://x.com), click on any tweet's reply box, and experience PulseX!

---

## 🧪 Automated Testing

PulseX includes a comprehensive unit test suite running on Node.js built-in test runner (`node:test`):

```bash
npm test
```

### Test Coverage:
- `tests/manifest.test.js`: Manifest V3 schema and permissions validation.
- `tests/deepseek.test.js`: Prompt engineering, angles, response cleansing, and local key validation.
- `tests/background-messages.test.js`: Message passing and background worker routing.
- `tests/templates.test.js`: Shadow DOM templates and Obsidian Emerald CSS variables.
- `tests/noise-filter.test.js`: Ad and promoted tweet indicator heuristics.
- `tests/dom-helpers.test.js`: Tweet DOM cleaning, metadata stripping, and author extraction.
- `tests/popup.test.js`: Settings validation and model allowlist checking.

---

## 🔒 Privacy & Safety Guarantee

- **Zero Auto-Posting**: PulseX strictly adheres to Twitter's Terms of Service. It **never** auto-clicks "Post" or schedules unattended tweets. You review every word before publishing.
- **Local Key Storage**: Your API keys are stored locally in Chrome's `chrome.storage.local`. They are sent **only** directly to your selected official AI provider (DeepSeek, OpenAI, Anthropic, Gemini, Groq, OpenRouter, or your local Ollama server). There are no telemetry servers, third-party loggers, or middleman backends.

---

## 👨‍💻 Creator & Community

Built with ❤️ by **Finn**  
- **X (Twitter):** [@finnbuilt](https://x.com/finnbuilt)
- **Profile:** https://x.com/finnbuilt

