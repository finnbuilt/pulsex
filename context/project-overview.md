# Project Overview — PulseX

## Overview

PulseX is a high-performance, context-aware Chrome Extension (Manifest V3) for X (Twitter) powered by DeepSeek AI (`api.deepseek.com`). Styled with a distinctive **Obsidian Emerald / Cyber Glass** visual identity, PulseX brings a complete AI productivity suite directly into the X web interface. It combines an automated in-timeline reply assistant with 5 angle options and raw-thought conversion, a floating draggable AI copilot drawer with multi-turn conversation and 1-click reply insertion, an automated feed noise and promoted ad suppressor, and a BYOK (Bring Your Own Key) popup settings manager supporting `deepseek-chat` and `deepseek-reasoner`.

PulseX guarantees human-in-the-loop control: it never auto-posts on behalf of the user, instead inserting refined, authentic drafts directly into Twitter's composer for final user review and approval.

## Goals

1. **Humanly Authentic Engagement**: Generate concise, conversational replies (1–2 sentences, <25–30 words) that directly address the core substance of posts without generic AI hustle cliches.
2. **Context-Aware Personalization**: Detect whether a reply is targeted at a root post or a nested thread discussion, parse the author's real first name, and naturally engage with them (e.g., "spot on Vinay" or jumping straight into the idea) without artificial em-dashes.
3. **Flawless Draft.js / Lexical Integration**: Maintain Twitter composer layout integrity without horizontal flex squishing, and synchronize text insertions with React's internal editor state via native browser commands.
4. **Zero-Build, Pure Web Standard**: Run directly in Chrome without requiring Webpack, Vite, or external bundlers; maintain 100% test coverage using Node's native test runner.

## Core User Flow

1. **Setup & Authentication**:
   - User installs the extension, clicks the PulseX toolbar icon, enters their DeepSeek API key (`sk-...`), selects their preferred model (`deepseek-chat` for instant 1s speed or `deepseek-reasoner` for deep reasoning), and tests connection with one click.
2. **In-Timeline Reply Generation**:
   - User scrolls X. When they open or click any reply box or modal, the Obsidian Emerald action bar mounts right above the bottom toolbar.
   - PulseX extracts the tweet author's display name and thread context, displaying `Replying to [Name]`.
   - User clicks one of 5 quick angles (`Agree & Expand`, `Counter`, `Insight`, `Witty`, `Question`) or types a shorthand thought into the `Raw Thoughts` input and clicks **Generate**.
   - PulseX queries DeepSeek, applies anti-slop guidelines, and renders a live preview.
   - User clicks **Insert into Tweet**; PulseX injects the draft directly into Twitter's contenteditable editor and activates the "Reply" button.
3. **Floating Copilot Drawer Collaboration**:
   - User clicks the floating bottom-right emerald toggle (or drags it to their preferred screen corner).
   - The drawer slides open, auto-detects the focused tweet on screen, and provides quick chips (`⚡ Ultra-Short & Punchy`, `🛡️ Counter Angle`, `💡 Add Value`, `🌐 Clean English`).
   - User chats with Copilot across multiple turns to brainstorm angles, translate, or refine replies.
   - Clicking **Insert Latest Reply into Tweet** pastes the generated response into the active composer.
4. **Feed Noise & Ad Suppression**:
   - Background scanner automatically detects sponsored/promoted tweets across multiple languages and hides spam giveaways/crypto drops, showing blocked count on the extension icon badge.

## Features

### In-Timeline Reply Assistant
- **5 Multi-Perspective Angles**:
  - `Agree & Expand`: Validates the author's point and provides immediate concrete backing.
  - `Counter`: Respectfully introduces an alternative viewpoint, trade-off, or nuance.
  - `Insight`: Delivers a high-signal metric, practical heuristic, or technical takeaway.
  - `Witty`: Sharp, conversational, punchy one-liner.
  - `Question`: Engaging follow-up question that drives meaningful thread conversation.
- **Raw Thoughts Synthesizer**: Converts shorthand fragments (e.g., "agree with #1, but cost too high") into polished replies.
- **Author Personalization**: Cleans handles (e.g. `vinaysharrna` $\to$ `Vinay`) and formats capitalized first names.
- **Anti-Slop Engine**: Strips timestamps, view counts (`14 Views`), and headers; bans cliches like *"Views are vanity"*, *"consistency compounds"*, *"Keep shipping"*, and *"LFG"*.

### Floating Copilot Drawer
- **Persistent Right Drawer**: Slide-out panel (`400px` width) with frosted glass blur (`backdrop-filter: blur(22px)`).
- **Auto-Focused Tweet Context**: Detects active tweet in viewport and displays target snippet with author badge.
- **Multi-Turn Chat History**: Maintains conversational context for iterative rewriting and angle brainstorming.
- **1-Click Composer Injection**: Inserts latest reply directly into the active Twitter Draft.js composer.

### Feed Noise & Promoted Ad Filter
- **Multi-Language Detection**: Filters Promoted/Ad markers in English, French, German, Spanish, Japanese, Portuguese, and Russian.
- **Spam & Scammer Protection**: Suppresses wallet address drops, fake airdrop claims, and DM solicitation spam.
- **Dynamic Badge Counter**: Displays total blocked noise count on the extension icon.

### Settings Popup & BYOK DeepSeek Client
- **Obsidian Emerald Popup UI**: Clean popup with real-time API key verification ping.
- **Model Selection**: Switch between `deepseek-chat` (V3 - default fast conversational) and `deepseek-reasoner` (R1 - deep thinking).
- **Custom Persona & Tone**: Textarea allowing users to inject custom tone instructions (e.g., "Senior engineer, concise, zero hashtags").
- **Toggle Feed Filter**: Instant switch to enable or disable ad and spam filtering.

## Scope

### In Scope
- Chrome Extension built under Manifest V3 specifications.
- Seamless injection into `x.com` and `twitter.com` timeline, thread views, and reply dialog modals.
- Direct communication with DeepSeek API (`api.deepseek.com`) via background service worker.
- Standalone HTML demo fixture (`test-demo.html`) for browser and offline testing without live Twitter credentials.
- 100% automated test suite using Node 24 native test runner (`node:test`).

### Out of Scope
- Automatic tweet submission without human confirmation (explicitly forbidden to ensure human-in-the-loop safety).
- Third-party social platforms (LinkedIn, Threads, Bluesky) in the current release.
- Account scraping, mass automated follow/unfollow, or bot automation.
- Cloud database backends or external tracking servers (user API keys and settings stay strictly in local Chrome storage).

## Success Criteria

1. **Layout Integrity**: In-timeline bar attaches above Twitter's bottom toolbar (`data-testid="toolBar"`) without causing Twitter's `"Post your reply"` box to collapse or squish.
2. **Draft.js Insertion Compatibility**: Clicking "Insert into Tweet" consistently populates Twitter's editor, clears placeholders, triggers React input state updates, and enables the native "Reply" button.
3. **Strict Substance Grounding**: Zero generic hustle quotes or view-count hallucinations in generated replies; 100% of replies address the specific premise of the tweet.
4. **Timeout & Latency Safety**: API requests never freeze in an `"Analyzing..."` spinner state; requests timeout cleanly after 25s with descriptive user-facing error messages.
5. **Zero-Bundler Portability**: Repository loads as an unpacked extension in `chrome://extensions/` directly from source with zero build commands.
