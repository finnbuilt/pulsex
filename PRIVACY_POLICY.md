# Privacy Policy for PulseX

**Last updated:** October 17, 2026  
**Developer:** Finn (@finnbuilt — https://x.com/finnbuilt)  
**Contact:** https://x.com/finnbuilt / support@pulsex.dev

---

## 1. Introduction & Core Philosophy

PulseX ("we", "our", or "the extension") is an open-architecture, client-side browser extension designed to provide AI-powered assistance and noise reduction exclusively for X (Twitter).

We believe in **absolute privacy and zero data harvesting**. PulseX is engineered around a **BYOK (Bring Your Own Key)** model:
- We **do not operate any tracking servers, proxy servers, or telemetry databases**.
- We **do not collect, monitor, store, or sell** your browsing history, personal identity, passwords, or communications.
- All operations happen locally in your browser.

---

## 2. Information We Handle & How It Is Used

### A. AI Provider API Keys & Preferences
- **What is handled:** Your user-provided API key for your chosen AI provider (DeepSeek, OpenAI, Anthropic Claude, Google Gemini, Groq, OpenRouter, or Local/Ollama), model choice, and preferred persona / tone presets.
- **Where it is stored:** Exclusively on your local device inside Chrome's sandboxed storage (`chrome.storage.local`).
- **How it is used:** To authenticate direct requests to your selected provider's official API when you request a reply, rewrite, or copilot chat.
- **Sharing:** Your API key is transmitted **only** directly to your selected provider's official endpoint:
  - DeepSeek: `https://api.deepseek.com`
  - OpenAI: `https://api.openai.com`
  - Anthropic: `https://api.anthropic.com`
  - Google Gemini: `https://generativelanguage.googleapis.com`
  - Groq: `https://api.groq.com`
  - OpenRouter: `https://openrouter.ai`
  - Local / Ollama: Your own private local machine (`http://localhost:*` or user-defined custom endpoint)
  - Your keys are never transmitted to any third-party or developer server.

### B. Tweet Content & Context
- **What is handled:** The text, author handle, and immediate reply context of the specific tweet you are inspecting or replying to.
- **Where it is stored:** In transient memory while you interact with the extension. It is never logged or saved to persistent disk storage.
- **How it is used:** Formatted into an AI prompt to generate contextually relevant, human-sounding replies or quote tweets.
- **Sharing:** Sent directly to your selected provider's API over encrypted HTTPS to generate completions upon your explicit action.

### C. Personal Data & Cookies
- PulseX **never** accesses your X account password, email, private direct messages (DMs), cookies, financial data, or external web browsing activity.

---

## 3. Chrome Permissions Explanation

PulseX adheres strictly to Google's **Principle of Least Privilege**:

| Permission | Purpose |
| :--- | :--- |
| `storage` | Saves your API keys and tone preferences locally in `chrome.storage.local`. |
| `https://x.com/*`<br>`https://twitter.com/*` | Allows the content script to detect the reply composer, extract tweet text for context, and insert your chosen reply upon clicking. |
| `https://api.deepseek.com/*`<br>`https://api.openai.com/*`<br>`https://api.anthropic.com/*`<br>`https://generativelanguage.googleapis.com/*`<br>`https://api.groq.com/*`<br>`https://openrouter.ai/*`<br>`http://localhost/*` | Enables direct client-to-API communication with your user-selected AI provider without passing through any intermediate proxy servers. |

---

## 4. Third-Party Services: DeepSeek API

When you generate a reply or chat with the copilot, the text of the selected tweet and your prompt are transmitted directly from your browser to:
- Hangzhou DeepSeek Artificial Intelligence Co., Ltd. (`https://api.deepseek.com`)

Data transmitted to DeepSeek is governed by DeepSeek's [API Terms of Service and Privacy Policy](https://www.deepseek.com). PulseX does not retain copies of these requests or responses.

---

## 5. Data Retention & Deletion

- Because all data is stored strictly in your browser's local sandbox, you retain complete control over your data at all times.
- **To delete your stored API key and settings:** Open the PulseX popup, delete the API key from the input field, and click Save, or click "Reset".
- **To delete all extension data completely:** Right-click the PulseX extension icon in Chrome and select **"Remove from Chrome..."**. All locally stored preferences and keys are immediately purged by Chrome.

---

## 6. Children's Privacy

PulseX does not knowingly collect or solicit any personal information from children under the age of 13.

---

## 7. Compliance & Changes to This Policy

We may periodically update this Privacy Policy to reflect changes in our extension or regulatory requirements. Any modifications will be updated here with a revised "Last updated" date.

---

## 8. Contact Us

- GitHub Issues: https://github.com/finnbuilt/pulsex/issues
- X (Twitter): https://x.com/finnbuilt
- Email: support@pulsex.dev
