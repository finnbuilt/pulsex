# PulseX — Chrome Web Store Submission Package

Use this document to copy-paste exact text and configurations directly into the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## 1. Store Listing Information

### Title
```text
PulseX - AI Superpowers for X
```

### Summary (Short Description) — *126 / 132 characters*
```text
Universal AI reply assistant for X (Twitter) with BYOK (DeepSeek, OpenAI, Claude, Gemini, Groq, Ollama). Built by @finnbuilt.
```

### Developer
- **Author:** Finn ([@finnbuilt](https://x.com/finnbuilt))
- **Profile:** https://x.com/finnbuilt

### Category
- **Primary Category:** `Productivity` (or `Workflow & Planning`)
- **Secondary Category (if prompted):** `Social & Communication`

---

## 2. Detailed Store Description (Formatted for CWS)

```markdown
Elevate your X (Twitter) workflow with PulseX — an intelligent, context-aware reply assistant and distraction-free timeline enhancer built by Finn (@finnbuilt).

PulseX supports complete Multi-Provider BYOK (Bring Your Own Key): connect directly to DeepSeek, OpenAI, Anthropic Claude, Google Gemini, Groq, OpenRouter, or your own local Ollama / LM Studio models with zero telemetry and zero intermediary servers.

PulseX seamlessly embeds into your X interface with a high-performance obsidian-emerald glass UI, helping you craft authentic, high-signal replies, summarize long threads, and bypass algorithmic timeline noise.

⚡ WHY PULSEX?

• 100% Client-Side BYOK (Bring Your Own Key):
Choose your favorite AI model! PulseX connects directly from your browser to your selected provider:
  - 🚀 DeepSeek (V3 & R1)
  - 🟢 OpenAI (GPT-4o, o3-mini)
  - 🟣 Anthropic Claude (Sonnet 3.5, Haiku, Sonnet 3.7)
  - 🔵 Google Gemini (2.0 Flash, 1.5 Pro)
  - ⚡ Groq (Llama 3.3 70B ultra-fast inference)
  - 🌐 OpenRouter (Access 200+ models with 1 key)
  - 💻 Custom / Local (Ollama, LM Studio, private servers)
Your API keys and prompts never touch any intermediary server.

• Context-Aware Smart Replies:
PulseX inspects root post themes, author identity, and nested replies to produce authentic, human responses tailored to conversation cadence — completely free of robotic AI clichés or em-dashes.

• Instant Angle Presets:
Choose from 5 instant strategic reply styles in a single click:
  - 💡 Insight: Add valuable perspective and nuance
  - 🤝 Agree: Affirm and validate the author's point
  - ⚡ Counter: Thoughtful alternative analysis & constructive pushback
  - 🎯 Witty: Lighthearted, sharp, authentic banter
  - ❓ Question: Spur engaging discussion with thoughtful follow-ups

• Embedded Cyber-Glass Copilot:
Need deeper iteration? Open the PulseX Copilot drawer to:
  - Chat directly with your chosen AI model about any tweet
  - Generate distinct response variations with one click
  - Rewrite drafts (Make punchier, shorten, or rephrase)
  - Generate viral quote-tweet drafts

• Timeline Noise & Ad Filter:
Clean up your feed by automatically dimming sponsored/promoted posts and repetitive crypto/giveaway spam bots.

---

🛡️ PRIVACY & SECURITY FIRST

• Zero Telemetry: No tracking pixels, analytics scripts, or user profiling.
• Local Storage: Stored preferences remain strictly inside chrome.storage.local.
• Pure Manifest V3: Built following the latest security and performance standards of modern web browsers.

---

🚀 GETTING STARTED IN 60 SECONDS

1. Install PulseX.
2. Click the PulseX extension icon in your Chrome toolbar.
3. Select your preferred AI provider and paste your API key (or run Ollama locally for free).
4. Navigate to x.com — click any reply box, choose an angle, and watch authentic drafts appear instantly!

---

Built with ❤️ by Finn (@finnbuilt — https://x.com/finnbuilt).
Note: PulseX is an independent open-source project and is not affiliated with, endorsed by, or sponsored by X Corp.
```

---

## 3. Privacy & Reviewer Disclosures

### Single Purpose Description
> "PulseX is a dedicated writing assistant and feed noise filter built exclusively for X (Twitter) that helps users compose context-aware replies and filter sponsored noise."

### Permission Justifications (Copy & Paste into Developer Dashboard)

#### `storage`
```text
Used solely to store the user's DeepSeek API key, selected AI model (deepseek-chat or deepseek-reasoner), and persona/tone settings locally on their browser via chrome.storage.local. No user data is sent to external developer servers.
```

#### `https://x.com/*` and `https://twitter.com/*`
```text
Required for the content script to read the context of the tweet the user is replying to (author handle and text) and to insert user-approved reply drafts directly into the X reply composer upon user interaction.
```

#### `https://api.deepseek.com/*`
```text
Required to dispatch user-initiated prompt requests directly from the user's browser to DeepSeek's official chat completions API using the user's personal API key (BYOK architecture).
```

### Remote Code Declaration
- **Question:** Does your extension use remote code (e.g., external scripts, CDN scripts, eval)?
- **Answer:** **No, I am not using remote code.**
- *Explanation:* All extension JavaScript, CSS, and icons are 100% bundled locally within the extension package. Zero external scripts or CDNs are executed.

### Data Privacy Questionnaire Answers
- **Data Collection:** Select **No** to all personal identification categories (Name, Email, Address, Phone, Location, Financial, Health, Authentication).
- **Personal Communications:** If prompted, clarify that tweet text is transmitted transiently to DeepSeek's official API exclusively to satisfy the user's explicit request to generate a reply, and is never collected or stored by the developer.
- **Data Usage Affirmations:**
  - [x] Does not sell user data to third parties.
  - [x] Does not use or transfer user data for purposes unrelated to the item's single purpose.
  - [x] Does not use or transfer user data to determine creditworthiness or for lending purposes.

---

## 4. Visual Assets Checklist

Google requires these visual assets before publishing:

| Asset | Dimensions | Requirement | Format |
| :--- | :--- | :--- | :--- |
| **Store Icon** | 128 x 128 px | **Required** | PNG (Already generated at `extension/icons/icon128.png`) |
| **Screenshot 1** | 1280 x 800 px (or 640 x 400) | **Required** (Min 1) | PNG / JPEG: Inline Reply Bar on X.com post |
| **Screenshot 2** | 1280 x 800 px | Recommended | PNG / JPEG: Cyber-Glass Copilot Drawer & Variations |
| **Screenshot 3** | 1280 x 800 px | Recommended | PNG / JPEG: Settings Popup & DeepSeek Model Config |
| **Small Promo Tile** | 440 x 280 px | **Required** | PNG: PulseX Logo & Brand Tagline |
| **Marquee Tile** | 1400 x 560 px | Optional (for store feature) | PNG |

---

## 5. Privacy Policy URL

Chrome Web Store requires a public URL. You can host `docs/privacy-policy.html` on GitHub Pages:
```text
https://finnbuilt.github.io/pulsex/privacy-policy.html
```
*(Or paste the raw URL / web link where you host `privacy-policy.html`)*
