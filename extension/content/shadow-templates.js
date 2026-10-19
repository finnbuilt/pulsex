/**
 * PulseX - Shadow DOM UI Templates & Obsidian Emerald Cyber Glass Styling
 */

export function getShadowStyles() {
  return `
    :host {
      all: initial;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Core Obsidian Emerald Cyber Theme Variables */
    .pulsex-root {
      --px-bg: rgba(9, 11, 17, 0.95);
      --px-bg-elevated: #151b28;
      --px-surface: #0f131d;
      --px-card-beveled: #121622;
      --px-border: rgba(255, 255, 255, 0.08);
      --px-border-hover: rgba(56, 189, 248, 0.4);
      --px-emerald: #10b981;
      --px-emerald-light: #34d399;
      --px-cyan: #06b6d4;
      --px-cyan-neon: #38bdf8;
      --px-violet-neon: #8b5cf6;
      --px-iridescent: linear-gradient(135deg, #b8c7ff 0%, #d8e2ff 40%, #fffae0 70%, #fde68a 100%);
      --px-text-primary: #f8fafc;
      --px-text-secondary: #8b9bb4;
      --px-text-muted: #5b697e;
      --px-glass-blur: blur(14px);
    }

    /* Inline Toolbar Container */
    .pulsex-inline-bar {
      margin: 10px 0;
      padding: 12px 16px;
      background: var(--px-bg);
      backdrop-filter: var(--px-glass-blur);
      -webkit-backdrop-filter: var(--px-glass-blur);
      border: 1px solid var(--px-border);
      border-radius: 16px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.08);
      display: flex;
      flex-direction: column;
      gap: 10px;
      color: var(--px-text-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      position: relative;
    }
    .pulsex-inline-bar::before {
      content: "";
      position: absolute;
      left: 0;
      top: 24%;
      bottom: 24%;
      width: 3.5px;
      background: var(--px-violet-neon);
      box-shadow: 0 0 10px var(--px-violet-neon);
      border-radius: 0 2px 2px 0;
    }
    .pulsex-inline-bar::after {
      content: "";
      position: absolute;
      bottom: -1px;
      right: 20px;
      width: 44px;
      height: 3px;
      background: var(--px-cyan-neon);
      box-shadow: 0 0 12px var(--px-cyan-neon), 0 0 20px var(--px-cyan-neon);
      border-radius: 2px;
    }
    .pulsex-inline-bar:hover {
      border-color: var(--px-border-hover);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), 0 0 24px rgba(56, 189, 248, 0.15);
    }

    /* Header / Brand Pill */
    .pulsex-bar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pulsex-brand {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: var(--px-text-primary);
    }
    .pulsex-brand-pulse {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--px-emerald);
      box-shadow: 0 0 8px var(--px-emerald);
      animation: pulse-glow 2s infinite ease-in-out;
    }
    .pulsex-brand-name {
      background: linear-gradient(135deg, #f8fafc 0%, var(--px-emerald-light) 60%, var(--px-cyan) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .pulsex-model-badge {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: var(--px-emerald-light);
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    /* Angle Buttons Strip */
    .pulsex-angles-strip {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .pulsex-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 11px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--px-text-secondary);
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.18s ease;
      user-select: none;
    }
    .pulsex-btn:hover {
      color: var(--px-text-primary);
      background: rgba(16, 185, 129, 0.14);
      border-color: rgba(16, 185, 129, 0.4);
      transform: translateY(-1px);
    }
    .pulsex-btn:active {
      transform: translateY(0);
    }
    .pulsex-btn.active {
      background: rgba(16, 185, 129, 0.22);
      border-color: var(--px-emerald);
      color: #fff;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);
    }

    /* Raw Thought Input Row */
    .pulsex-raw-row {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .pulsex-raw-input {
      flex: 1;
      height: 34px;
      padding: 0 12px;
      font-size: 12px;
      color: var(--px-text-primary);
      background: var(--px-card-beveled);
      border: 1px solid var(--px-border);
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .pulsex-raw-input::placeholder {
      color: var(--px-text-muted);
    }
    .pulsex-raw-input:focus {
      border-color: var(--px-cyan-neon);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.35);
    }

    .pulsex-btn-generate {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
      font-weight: 700;
      padding: 7px 14px;
    }
    .pulsex-btn-generate:hover {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.5);
    }

    /* Inline Status / Output Preview */
    .pulsex-preview-box {
      display: none;
      padding: 10px 12px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px dashed rgba(56, 189, 248, 0.35);
      border-radius: 8px;
      font-size: 12.5px;
      line-height: 1.45;
      color: #e2e8f0;
      position: relative;
    }
    .pulsex-preview-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
      justify-content: flex-end;
    }
    .pulsex-btn-insert {
      background: var(--px-iridescent) !important;
      color: #0b0f19 !important;
      border: none !important;
      font-weight: 800 !important;
      box-shadow: 0 4px 14px rgba(184, 199, 255, 0.45);
    }
    .pulsex-btn-insert:hover {
      box-shadow: 0 6px 20px rgba(184, 199, 255, 0.65);
    }

    /* Floating Copilot Trigger Button */
    .pulsex-floating-toggle {
      position: fixed;
      right: 20px;
      bottom: 24px;
      z-index: 999998;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--px-bg);
      backdrop-filter: var(--px-glass-blur);
      -webkit-backdrop-filter: var(--px-glass-blur);
      border: 1px solid var(--px-border);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6), 0 0 16px rgba(16, 185, 129, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s;
    }
    .pulsex-floating-toggle:hover {
      transform: scale(1.08);
      border-color: var(--px-emerald);
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.7), 0 0 22px rgba(16, 185, 129, 0.4);
    }
    .pulsex-floating-toggle:active {
      cursor: grabbing;
    }
    .pulsex-toggle-icon {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: var(--px-emerald-light);
      stroke-width: 2.2;
    }

    /* Floating Slide-out Copilot Drawer */
    .pulsex-drawer {
      position: fixed;
      top: 0;
      right: -420px;
      width: 400px;
      height: 100vh;
      z-index: 999999;
      background: rgba(10, 14, 22, 0.96);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-left: 1px solid var(--px-border);
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      transition: right 0.32s cubic-bezier(0.16, 1, 0.3, 1);
      color: var(--px-text-primary);
    }
    .pulsex-drawer.open {
      right: 0;
    }

    .pulsex-copilot-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(15, 23, 42, 0.5);
    }
    .pulsex-copilot-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
    }
    .pulsex-close-btn {
      background: none;
      border: none;
      color: var(--px-text-secondary);
      cursor: pointer;
      font-size: 18px;
      padding: 4px 8px;
      border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    .pulsex-close-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Context Pill in Drawer */
    .pulsex-context-box {
      margin: 12px 16px;
      padding: 10px 12px;
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 10px;
      font-size: 11.5px;
      color: var(--px-text-secondary);
    }
    .pulsex-context-label {
      color: var(--px-emerald-light);
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    /* Chat Messages Box */
    .pulsex-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .pulsex-msg {
      max-width: 88%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
    }
    .pulsex-msg-user {
      align-self: flex-end;
      background: linear-gradient(135deg, #065f46 0%, #047857 100%);
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }
    .pulsex-msg-assistant {
      align-self: flex-start;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
      border-bottom-left-radius: 2px;
    }

    /* Quick Action Chips */
    .pulsex-chips-row {
      padding: 6px 16px;
      display: flex;
      gap: 6px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .pulsex-chips-row::-webkit-scrollbar { display: none; }
    .pulsex-chip {
      white-space: nowrap;
      padding: 4px 10px;
      font-size: 11px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--px-text-secondary);
      cursor: pointer;
      transition: all 0.15s;
    }
    .pulsex-chip:hover {
      background: rgba(16, 185, 129, 0.15);
      border-color: var(--px-emerald);
      color: #fff;
    }

    /* Chat Input Area */
    .pulsex-chat-footer {
      padding: 14px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: rgba(15, 23, 42, 0.4);
    }
    .pulsex-chat-input-row {
      display: flex;
      gap: 8px;
    }
    .pulsex-chat-input {
      flex: 1;
      height: 38px;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      color: #fff;
      font-size: 12.5px;
      outline: none;
      resize: none;
    }
    .pulsex-chat-input:focus {
      border-color: var(--px-emerald);
    }
    .pulsex-chat-send {
      padding: 0 16px;
      background: var(--px-emerald);
      color: #000;
      font-weight: 700;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .pulsex-chat-send:hover {
      opacity: 0.9;
    }

    /* Insert Action with Reference Pastel Iridescent Button */
    .pulsex-insert-btn {
      width: 100%;
      padding: 10px;
      border-radius: 9px;
      background: var(--px-iridescent);
      color: #0b0f19;
      font-size: 12.5px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 18px rgba(184, 199, 255, 0.45);
      transition: transform 0.18s, box-shadow 0.18s;
    }
    .pulsex-insert-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 24px rgba(184, 199, 255, 0.65);
    }

    /* Spinner Animation */
    .pulsex-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-top-color: var(--px-emerald-light);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.8; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.25); }
    }
  `;
}

export function renderInlineBarTemplate() {
  return `
    <div class="pulsex-root">
      <div class="pulsex-inline-bar">
        <div class="pulsex-bar-header">
          <div class="pulsex-brand">
            <span class="pulsex-brand-pulse"></span>
            <span class="pulsex-brand-name">PulseX</span>
          </div>
          <span class="pulsex-model-badge">DeepSeek AI</span>
        </div>

        <div class="pulsex-angles-strip">
          <button class="pulsex-btn" data-angle="agree" title="Agree and add valuable nuance">
            🤝 Agree & Expand
          </button>
          <button class="pulsex-btn" data-angle="counter" title="Constructive challenge or alternative view">
            ⚡ Counter Angle
          </button>
          <button class="pulsex-btn" data-angle="insight" title="High-value data or practical framework">
            💡 Insight
          </button>
          <button class="pulsex-btn" data-angle="witty" title="Clever, sharp and memorable">
            🎯 Witty
          </button>
          <button class="pulsex-btn" data-angle="question" title="Engaging conversation starter">
            ❓ Question
          </button>
        </div>

        <div class="pulsex-raw-row">
          <input type="text" class="pulsex-raw-input" placeholder="Type raw thoughts (e.g. 'disagree with #2, pricing too high') or click an angle..." />
          <button class="pulsex-btn pulsex-btn-generate">
            <span>Generate</span>
          </button>
        </div>

        <div class="pulsex-preview-box">
          <div class="pulsex-preview-text"></div>
          <div class="pulsex-preview-actions">
            <button class="pulsex-btn pulsex-btn-discard">Discard</button>
            <button class="pulsex-btn pulsex-btn-insert">
              Insert into Tweet
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderCopilotDrawerTemplate() {
  return `
    <div class="pulsex-root">
      <!-- Floating draggable trigger pill -->
      <div class="pulsex-floating-toggle" id="pulsex-floating-toggle" title="Open PulseX Copilot">
        <svg class="pulsex-toggle-icon" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>

      <!-- Slide-out Drawer -->
      <div class="pulsex-drawer" id="pulsex-drawer">
        <div class="pulsex-copilot-header">
          <div class="pulsex-copilot-title">
            <span class="pulsex-brand-pulse"></span>
            <span class="pulsex-brand-name">PulseX Copilot</span>
            <a href="https://x.com/finnbuilt" target="_blank" rel="noreferrer" class="pulsex-header-author" title="Built by @finnbuilt">by @finnbuilt</a>
          </div>
          <button class="pulsex-close-btn" id="pulsex-close-btn">&times;</button>
        </div>

        <div class="pulsex-context-box" id="pulsex-context-box">
          <div class="pulsex-context-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Active Tweet Context
          </div>
          <div class="pulsex-context-text" id="pulsex-context-text">Detecting active tweet...</div>
        </div>

        <div class="pulsex-chips-row">
          <span class="pulsex-chip" data-prompt="Make it shorter and punchier">⚡ Shorter & Punchier</span>
          <span class="pulsex-chip" data-prompt="Provide a constructive counter-point">🛡️ Counter Perspective</span>
          <span class="pulsex-chip" data-prompt="Add a high-value takeaway">💡 Add Takeaway</span>
          <span class="pulsex-chip" data-prompt="Turn into clean, fluent native English">🌐 Clean English</span>
        </div>

        <div class="pulsex-chat-messages" id="pulsex-chat-messages">
          <div class="pulsex-msg pulsex-msg-assistant">
            Hello! I'm your PulseX Copilot (built by @finnbuilt). I automatically read the active tweet you're focused on. Click a chip above or ask me to draft, rewrite, or brainstorm variations!
          </div>
        </div>

        <div class="pulsex-chat-footer">
          <div class="pulsex-chat-input-row">
            <textarea class="pulsex-chat-input" id="pulsex-chat-input" placeholder="Ask Copilot (e.g. 'Give me 3 witty options')..."></textarea>
            <button class="pulsex-chat-send" id="pulsex-chat-send">Send</button>
          </div>
          <button class="pulsex-insert-btn" id="pulsex-insert-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Insert Latest Reply into Tweet
          </button>
          <div class="pulsex-drawer-credits">
            Built by <a href="https://x.com/finnbuilt" target="_blank" rel="noreferrer" class="pulsex-author-link">Finn (@finnbuilt) ↗</a>
          </div>
        </div>
      </div>
    </div>
  `;
}
