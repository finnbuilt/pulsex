/**
 * PulseX - Context-Aware In-Timeline Reply Assistant & Floating AI Copilot for X (Twitter)
 * Self-contained classic content script (Manifest V3 compatible with zero module bundler requirement).
 */

(function () {
  'use strict';

  // Prevent multiple initializations in the same tab
  if (window.__PULSEX_LOADED__) return;
  window.__PULSEX_LOADED__ = true;

  console.log('%c[PulseX]%c Context-Aware Obsidian Emerald Assistant Loaded', 'color: #10b981; font-weight: bold;', 'color: #94a3b8;');

  // --- Constants & Regex ---
  const AD_REGEX = /\b(Promoted|Ad\b|Sponsorisé|Gesponsert|Publicidad|プロモーション|Patrocinado|Реклама)/i;
  const SPAM_REGEX = [
    /\bdrop your (\$(sol|eth|btc)|wallet|address)\b/i,
    /\b(airdrop|claim your free|free usdt|whitelist spot)\b/i,
    /\bdm me to (claim|earn|win)\b/i
  ];

  function getPulseXStyles() {
    return `
      :host {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
      }
      *, *::before, *::after {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      .px-theme {
        --px-bg: rgba(11, 15, 23, 0.94);
        --px-border: rgba(16, 185, 129, 0.28);
        --px-border-hover: rgba(16, 185, 129, 0.65);
        --px-emerald: #10b981;
        --px-emerald-light: #34d399;
        --px-cyan: #06b6d4;
        --px-text-primary: #f8fafc;
        --px-text-secondary: #94a3b8;
        --px-text-muted: #64748b;
      }

      /* In-Timeline Reply Toolbar */
      .pulsex-inline-bar {
        margin: 8px 0;
        padding: 10px 14px;
        background: var(--px-bg);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--px-border);
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 14px rgba(16, 185, 129, 0.15);
        display: flex;
        flex-direction: column;
        gap: 9px;
        color: var(--px-text-primary);
        font-size: 12px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .pulsex-inline-bar:hover {
        border-color: var(--px-border-hover);
      }

      .pulsex-bar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .pulsex-brand {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 800;
        letter-spacing: 0.3px;
      }
      .pulsex-pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulse-glow 2s infinite ease-in-out;
      }
      .pulsex-brand-title {
        background: linear-gradient(135deg, #f8fafc 0%, #34d399 60%, #06b6d4 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 13px;
      }
      .pulsex-target-badge {
        font-size: 11px;
        font-weight: 600;
        color: #34d399;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .pulsex-header-right {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .pulsex-close-btn {
        background: none;
        border: none;
        color: var(--px-text-muted);
        cursor: pointer;
        font-size: 14px;
        line-height: 1;
        padding: 4px 6px;
        border-radius: 4px;
        transition: all 0.15s ease;
      }
      .pulsex-close-btn:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }

      /* Trigger Bar (Shown initially before expansion) */
      .pulsex-trigger-bar {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin: 4px 0;
        width: 100%;
      }
      .pulsex-trigger-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: 34px;
        padding: 0 16px;
        border-radius: 9999px;
        background: linear-gradient(135deg, rgba(6, 78, 59, 0.45) 0%, rgba(16, 185, 129, 0.22) 60%, rgba(6, 182, 212, 0.25) 100%);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(16, 185, 129, 0.45);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35), 0 0 10px rgba(16, 185, 129, 0.2);
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
        outline: none;
      }
      .pulsex-trigger-btn:hover {
        background: linear-gradient(135deg, rgba(6, 78, 59, 0.65) 0%, rgba(16, 185, 129, 0.35) 60%, rgba(6, 182, 212, 0.4) 100%);
        border-color: #10b981;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), 0 0 18px rgba(16, 185, 129, 0.45);
        transform: translateY(-1px);
      }
      .pulsex-trigger-btn:active {
        transform: translateY(0);
      }
      .pulsex-trigger-text {
        background: linear-gradient(135deg, #ffffff 0%, #34d399 65%, #38bdf8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
        letter-spacing: 0.2px;
      }

      /* Angles Row */
      .pulsex-angles-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .pulsex-angle-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        font-size: 11.5px;
        font-weight: 600;
        color: var(--px-text-secondary);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 7px;
        cursor: pointer;
        transition: all 0.18s ease;
      }
      .pulsex-angle-btn:hover {
        color: #fff;
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.4);
      }
      .pulsex-angle-btn.active {
        background: rgba(16, 185, 129, 0.25);
        border-color: #10b981;
        color: #fff;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
      }

      /* Raw Thoughts Input */
      .pulsex-raw-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .pulsex-raw-input {
        flex: 1;
        height: 32px;
        padding: 0 12px;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 7px;
        color: #fff;
        font-size: 12px;
        outline: none;
      }
      .pulsex-raw-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.25);
      }
      .pulsex-btn-generate {
        height: 32px;
        padding: 0 14px;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #fff;
        border: none;
        border-radius: 7px;
        font-weight: 700;
        font-size: 11.5px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
      }
      .pulsex-btn-generate:hover {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      }

      /* Preview Box */
      .pulsex-preview-box {
        display: none;
        padding: 10px 12px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px dashed rgba(16, 185, 129, 0.35);
        border-radius: 8px;
        font-size: 12.5px;
        line-height: 1.45;
        color: #f1f5f9;
      }
      .pulsex-preview-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .pulsex-variants-tabs {
        display: flex;
        gap: 6px;
      }
      .pulsex-tab-btn {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--px-text-secondary);
        padding: 3px 8px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .pulsex-tab-btn:hover {
        color: #fff;
        background: rgba(16, 185, 129, 0.15);
      }
      .pulsex-tab-btn.active {
        background: rgba(16, 185, 129, 0.25);
        border-color: #10b981;
        color: #10b981;
        font-weight: 700;
      }
      .pulsex-metrics-pill {
        font-size: 10.5px;
        color: #34d399;
        font-family: ui-monospace, SFMono-Regular, monospace;
        background: rgba(16, 185, 129, 0.1);
        padding: 2px 7px;
        border-radius: 4px;
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
      .pulsex-metrics-pill.warn {
        color: #f87171;
        border-color: rgba(248, 113, 113, 0.3);
        background: rgba(248, 113, 113, 0.1);
      }
      .pulsex-preview-content {
        min-height: 24px;
        word-break: break-word;
      }
      .pulsex-tone-row {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
        margin-top: 8px;
        padding-top: 6px;
        border-top: 1px dashed rgba(255, 255, 255, 0.07);
      }
      .pulsex-tone-label {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--px-text-muted);
        letter-spacing: 0.3px;
        margin-right: 2px;
      }
      .pulsex-tone-btn {
        padding: 3px 7px;
        font-size: 10.5px;
        font-weight: 500;
        color: var(--px-text-secondary);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .pulsex-tone-btn:hover {
        color: #fff;
        background: rgba(6, 182, 212, 0.15);
        border-color: rgba(6, 182, 212, 0.4);
      }
      .pulsex-preview-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        justify-content: flex-end;
      }
      .pulsex-preview-btn {
        padding: 5px 11px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid transparent;
      }
      .pulsex-preview-reroll {
        background: rgba(255, 255, 255, 0.05);
        color: #38bdf8;
        border-color: rgba(56, 189, 248, 0.25);
      }
      .pulsex-preview-reroll:hover {
        background: rgba(56, 189, 248, 0.15);
        border-color: #38bdf8;
      }
      .pulsex-preview-discard {
        background: rgba(255, 255, 255, 0.05);
        color: var(--px-text-secondary);
        border-color: rgba(255, 255, 255, 0.1);
      }
      .pulsex-preview-insert {
        background: #10b981;
        color: #000;
        font-weight: 700;
      }

      /* Beautiful API Setup Card */
      .px-api-setup-card {
        padding: 14px 16px;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 20, 31, 0.95) 100%);
        border: 1px solid rgba(16, 185, 129, 0.35);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(16, 185, 129, 0.1);
        text-align: left;
        margin: 2px 0;
      }
      .px-setup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .px-setup-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--px-emerald-light);
      }
      .px-setup-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 8px #10b981;
      }
      .px-setup-pill {
        font-size: 10.5px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #38bdf8;
        font-family: inherit;
      }
      .px-setup-body {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .px-setup-title {
        font-size: 13.5px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.3;
      }
      .px-setup-desc {
        font-size: 11.5px;
        color: var(--px-text-secondary);
        line-height: 1.45;
      }
      .px-provider-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 4px;
      }
      .px-chip {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 500;
        color: #cbd5e1;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .px-chip.active-chip {
        color: #ffffff;
        background: rgba(16, 185, 129, 0.2);
        border-color: rgba(16, 185, 129, 0.5);
        font-weight: 600;
      }
      .px-setup-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 4px;
        flex-wrap: wrap;
      }
      .px-setup-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: 8px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid rgba(255, 255, 255, 0.25);
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
        transition: all 0.18s ease;
      }
      .px-setup-btn:hover {
        transform: translateY(-1px);
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
      }
      .px-setup-tip {
        font-size: 11px;
        color: var(--px-text-muted);
      }

      /* Floating Copilot Toggle (Bottom-Right) */
      .pulsex-floating-toggle {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        width: 50px;
        height: 50px;
        border-radius: 14px;
        background: rgba(10, 15, 24, 0.95);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1.5px solid rgba(16, 185, 129, 0.4);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), 0 0 18px rgba(16, 185, 129, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        transition: box-shadow 0.2s;
        user-select: none;
        touch-action: none;
      }
      .pulsex-floating-toggle:active {
        cursor: grabbing;
      }
      .pulsex-floating-toggle:hover {
        transform: scale(1.08);
        border-color: #10b981;
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), 0 0 24px rgba(16, 185, 129, 0.45);
      }
      .pulsex-toggle-svg {
        width: 26px;
        height: 26px;
        fill: none;
        stroke: #34d399;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      /* Copilot Slide-out Drawer */
      .pulsex-drawer {
        position: fixed;
        top: 0;
        right: -420px;
        width: 400px;
        height: 100vh;
        z-index: 2147483647;
        background: rgba(10, 14, 22, 0.97);
        backdrop-filter: blur(22px);
        -webkit-backdrop-filter: blur(22px);
        border-left: 1px solid var(--px-border);
        box-shadow: -12px 0 40px rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        color: #f8fafc;
      }
      .pulsex-drawer.open {
        right: 0;
      }

      .pulsex-copilot-header {
        padding: 16px 18px;
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
        font-weight: 800;
      }
      .pulsex-close-btn {
        background: none;
        border: none;
        color: var(--px-text-secondary);
        cursor: pointer;
        font-size: 20px;
        padding: 4px 8px;
        border-radius: 6px;
      }
      .pulsex-close-btn:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }

      .pulsex-context-box {
        margin: 12px 16px;
        padding: 10px 12px;
        background: rgba(16, 185, 129, 0.07);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: 8px;
        font-size: 11.5px;
        color: var(--px-text-secondary);
      }
      .pulsex-context-label {
        color: #34d399;
        font-weight: 700;
        margin-bottom: 3px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .pulsex-chips-row {
        padding: 4px 16px;
        display: flex;
        gap: 6px;
        overflow-x: auto;
      }
      .pulsex-chip {
        white-space: nowrap;
        padding: 4px 9px;
        font-size: 11px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--px-text-secondary);
        cursor: pointer;
      }
      .pulsex-chip:hover {
        background: rgba(16, 185, 129, 0.2);
        border-color: #10b981;
        color: #fff;
      }

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
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 12.5px;
        line-height: 1.5;
      }
      .pulsex-msg-user {
        align-self: flex-end;
        background: #047857;
        color: #fff;
      }
      .pulsex-msg-assistant {
        align-self: flex-start;
        background: rgba(30, 41, 59, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: #f1f5f9;
      }

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
        padding: 8px 10px;
        background: rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        color: #fff;
        font-size: 12px;
        outline: none;
        resize: none;
      }
      .pulsex-chat-input:focus {
        border-color: #10b981;
      }
      .pulsex-chat-send {
        padding: 0 14px;
        background: #10b981;
        color: #000;
        font-weight: 700;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }

      .pulsex-insert-btn {
        width: 100%;
        padding: 9px;
        border-radius: 8px;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .pulsex-insert-btn:hover {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      }

      .pulsex-header-author {
        font-size: 10.5px;
        font-weight: 600;
        color: #34d399;
        text-decoration: none;
        padding: 2px 7px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.25);
        border-radius: 10px;
        margin-left: 6px;
        transition: all 0.15s;
        display: inline-flex;
        align-items: center;
      }
      .pulsex-header-author:hover {
        background: rgba(16, 185, 129, 0.25);
        color: #fff;
        text-decoration: underline;
      }

      .pulsex-drawer-credits {
        text-align: center;
        font-size: 10.5px;
        color: var(--px-text-muted);
        margin-top: 4px;
      }
      .pulsex-author-link {
        color: #10b981;
        font-weight: 600;
        text-decoration: none;
      }
      .pulsex-author-link:hover {
        text-decoration: underline;
      }

      .pulsex-spinner {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-top-color: #34d399;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        display: inline-block;
      }

      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.8; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.3); }
      }
    `;
  }

  // --- Beautiful Multi-Provider API Setup Card ---
  function renderApiKeyMissingCard(providerName = 'AI Model') {
    const isDeepSeek = /deepseek/i.test(providerName);
    const isOpenAI = /openai/i.test(providerName);
    const isClaude = /claude|anthropic/i.test(providerName);
    const isGemini = /gemini|google/i.test(providerName);
    const isGroq = /groq/i.test(providerName);
    const isOpenRouter = /openrouter/i.test(providerName);
    const isOllama = /ollama|local/i.test(providerName);

    return `
      <div class="px-api-setup-card">
        <div class="px-setup-header">
          <div class="px-setup-badge">
            <span class="px-setup-dot"></span>
            <span>Connect AI Provider</span>
          </div>
          <span class="px-setup-pill">${providerName} &bull; BYOK</span>
        </div>
        <div class="px-setup-body">
          <div class="px-setup-title">Set up your API key to generate instant replies</div>
          <div class="px-setup-desc">
            PulseX connects directly to any model you love &mdash; DeepSeek, OpenAI, Claude, Gemini, Groq, OpenRouter, or local Ollama. Zero markups, zero middleman servers.
          </div>
          <div class="px-provider-chips">
            <span class="px-chip ${isDeepSeek ? 'active-chip' : ''}">🚀 DeepSeek</span>
            <span class="px-chip ${isOpenAI ? 'active-chip' : ''}">🟢 OpenAI</span>
            <span class="px-chip ${isClaude ? 'active-chip' : ''}">🟣 Claude</span>
            <span class="px-chip ${isGemini ? 'active-chip' : ''}">🔵 Gemini</span>
            <span class="px-chip ${isGroq ? 'active-chip' : ''}">⚡ Groq</span>
            <span class="px-chip ${isOpenRouter ? 'active-chip' : ''}">🌐 OpenRouter</span>
            <span class="px-chip ${isOllama ? 'active-chip' : ''}">💻 Ollama (Free)</span>
          </div>
        </div>
        <div class="px-setup-actions">
          <button type="button" class="px-setup-btn" id="px-open-settings-action">
            <span>⚙️ Open PulseX Settings &rarr;</span>
          </button>
          <span class="px-setup-tip">Click to choose your provider & enter your key</span>
        </div>
      </div>
    `;
  }

  // --- Author Name & Context Extraction Helpers ---
  function extractAuthorDetails(text) {
    if (!text) return { fullName: 'Creator', firstName: 'there', handle: 'creator' };
    const match = text.match(/@([A-Za-z0-9_]{1,20})/);
    const handle = match ? match[1] : 'creator';

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let fullName = '';
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`@${handle}`) || lines[i].startsWith('@')) {
        if (i > 0 && !/^Replying\s+to/i.test(lines[i - 1])) {
          fullName = lines[i - 1];
        }
        break;
      }
    }
    if (!fullName) {
      const inlineMatch = text.match(/^([^\n@·•]+)\s+@/);
      if (inlineMatch && !/^Replying\s+to/i.test(inlineMatch[1])) {
        fullName = inlineMatch[1].trim();
      }
    }
    if (!fullName || /^Replying\s+to/i.test(fullName)) {
      if (handle && handle !== 'creator') {
        const base = handle.replace(/sharr?na$/i, '').split(/[_0-9]/)[0] || handle;
        fullName = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
      } else {
        fullName = 'Friend';
      }
    }

    // Strip emojis to isolate real first name
    const clean = fullName.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    let firstName = words.length > 0 ? words[0] : fullName;
    if (firstName) {
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }

    return { fullName, firstName, handle };
  }

  function cleanTweetText(rawText) {
    if (!rawText) return '';
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let startIdx = 0;
    for (let i = 0; i < Math.min(lines.length, 6); i++) {
      if (lines[i].startsWith('@') || /^\d+[smhdw]$/i.test(lines[i]) || lines[i] === '·') {
        startIdx = i + 1;
      }
    }
    const filtered = lines.slice(startIdx).filter(l => {
      if (l.startsWith('@') || /^[·•|\-–—]$/.test(l) || /^\d+[smhdw]$/i.test(l) || /^\d+(\.\d+)?[KMB]?$/i.test(l)) return false;
      if (/\b\d+(\.\d+)?[KMB]?\s+Views?\b/i.test(l)) return false;
      if (/\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/i.test(l)) return false;
      if (/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/i.test(l)) return false;
      if (/^Replying\s+to\b/i.test(l)) return false;
      if (/^(Quote|Translate post|Ad|Promoted|Verified)$/i.test(l)) return false;
      return true;
    });
    return filtered.join(' ').trim() || rawText.trim();
  }

  function extractTweetData(tweetEl) {
    if (!tweetEl) return { author: 'creator', authorName: 'there', text: '', isNestedReply: false };

    let text = '';
    const textNode = tweetEl.querySelector ? tweetEl.querySelector('[data-testid="tweetText"]') : null;
    if (textNode) {
      text = (textNode.innerText || textNode.textContent || '').trim();
    }

    const rawText = tweetEl.innerText || tweetEl.textContent || '';
    if (!text && rawText) {
      text = cleanTweetText(rawText);
    }

    let authorDetails = null;
    const userNameEl = tweetEl.querySelector ? tweetEl.querySelector('[data-testid="User-Name"]') : null;
    if (userNameEl) {
      authorDetails = extractAuthorDetails(userNameEl.innerText || userNameEl.textContent || '');
    }
    if (!authorDetails || authorDetails.handle === 'creator') {
      authorDetails = extractAuthorDetails(rawText);
    }

    const isNestedReply = rawText.includes('Replying to @') ||
                          rawText.includes('Replying to') ||
                          Boolean(tweetEl.querySelector?.('a[href*="/status/"]'));

    return {
      author: authorDetails.handle,
      authorName: authorDetails.firstName,
      authorFullName: authorDetails.fullName,
      isNestedReply,
      text
    };
  }

  function resolveTargetTweetAndRoot(editorEl) {
    if (!editorEl) return { targetTweetEl: null, rootTweetEl: null };

    // 1. Reply modal dialog
    const modal = editorEl.closest ? editorEl.closest('[role="dialog"]') : null;
    if (modal) {
      const modalTweets = Array.from(modal.querySelectorAll('article[data-testid="tweet"]'));
      if (modalTweets.length > 0) {
        return {
          targetTweetEl: modalTweets[modalTweets.length - 1],
          rootTweetEl: modalTweets.length > 1 ? modalTweets[0] : null
        };
      }
    }

    // 2. Direct enclosing cell (when composer is rendered inside the same card)
    const enclosingCell = editorEl.closest ? (editorEl.closest('[data-testid="cellInnerDiv"]') || editorEl.closest('article[data-testid="tweet"]')?.parentElement) : null;
    if (enclosingCell) {
      const directTweet = enclosingCell.querySelector('article[data-testid="tweet"]');
      if (directTweet) {
        const all = typeof document !== 'undefined' ? Array.from(document.querySelectorAll('article[data-testid="tweet"]')) : [];
        const rootEl = (all.length > 1 && all[0] !== directTweet) ? all[0] : null;
        return { targetTweetEl: directTweet, rootTweetEl: rootEl };
      }
    }

    // 3. Preceding siblings walk
    let cur = editorEl.closest ? (editorEl.closest('[data-testid="cellInnerDiv"]') || editorEl.parentElement) : editorEl.parentElement;
    while (cur && typeof document !== 'undefined' && cur !== document.body) {
      const prev = cur.previousElementSibling;
      if (prev) {
        const tweet = prev.querySelector('article[data-testid="tweet"]') ||
                      (prev.matches?.('article[data-testid="tweet"]') ? prev : null);
        if (tweet) {
          const all = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
          const rootEl = (all.length > 1 && all[0] !== tweet) ? all[0] : null;
          return { targetTweetEl: tweet, rootTweetEl: rootEl };
        }
      }
      cur = cur.parentElement;
    }

    // 4. Geometry-based resolution (tweet physically directly above composer)
    if (typeof document !== 'undefined' && editorEl.getBoundingClientRect) {
      const allArticles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
      if (allArticles.length > 0) {
        const editorRect = editorEl.getBoundingClientRect();
        let best = null;
        let minDistance = Infinity;

        for (const t of allArticles) {
          const r = t.getBoundingClientRect();
          const dist = editorRect.top - r.bottom;
          if (dist >= -40 && dist < minDistance) {
            minDistance = dist;
            best = t;
          }
        }

        const targetTweetEl = best || allArticles[0];
        const rootTweetEl = (allArticles.length > 1 && allArticles[0] !== targetTweetEl) ? allArticles[0] : null;
        return { targetTweetEl, rootTweetEl };
      }
    }

    return { targetTweetEl: null, rootTweetEl: null };
  }

  function findActualContentEditable(node) {
    if (node) {
      if (node.isContentEditable || node.getAttribute?.('contenteditable') === 'true') {
        return node;
      }
      if (node.querySelector) {
        const inside = node.querySelector('div[role="textbox"][contenteditable="true"], [data-testid="tweetTextarea_0"], div[contenteditable="true"]');
        if (inside) return inside;
      }
      if (node.parentElement) {
        const nearby = node.parentElement.querySelector('div[role="textbox"][contenteditable="true"], [data-testid="tweetTextarea_0"], div[contenteditable="true"]');
        if (nearby) return nearby;
      }
    }

    const inDialog = document.querySelector('[role="dialog"] div[role="textbox"][contenteditable="true"], [role="dialog"] [data-testid="tweetTextarea_0"]');
    if (inDialog) return inDialog;

    const all = Array.from(document.querySelectorAll('div[role="textbox"][contenteditable="true"], [data-testid="tweetTextarea_0"]'));
    for (const el of all) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return el;
    }
    return all[0] || null;
  }

  function insertTextIntoEditor(targetNode, textToInsert) {
    if (!textToInsert) return false;
    const editor = findActualContentEditable(targetNode);
    if (!editor) {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(textToInsert).catch(() => {});
      }
      return false;
    }

    try {
      editor.focus();
      if (typeof editor.click === 'function') editor.click();
    } catch (e) {}

    // Select all content inside editor so new text replaces any existing text rather than appending
    if (typeof window !== 'undefined' && window.getSelection && document.createRange) {
      try {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {}
    }

    let pasteHandled = false;

    // Method 1: Synthetic DataTransfer ClipboardEvent('paste')
    // This is the gold standard for Draft.js & Lexical on Twitter/X web. Draft.js intercepts handlePastedText,
    // updates internal React EditorState, and calls e.preventDefault(). This guarantees ZERO duplicate text.
    if (typeof ClipboardEvent !== 'undefined' && typeof DataTransfer !== 'undefined') {
      try {
        const dt = new DataTransfer();
        dt.setData('text/plain', textToInsert);
        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: dt
        });
        editor.dispatchEvent(pasteEvent);
        if (pasteEvent.defaultPrevented) {
          pasteHandled = true;
        }
      } catch (e) {}
    }

    // Method 2: If ClipboardEvent was not handled by Draft.js, fallback to single-dispatch execCommand('insertText')
    // Note: We deliberately do NOT dispatch manual synthetic 'input' events afterwards, as doing so causes
    // Draft.js / React to catch the synthetic event as a second typing action and double-insert text.
    if (!pasteHandled && typeof document !== 'undefined' && document.execCommand) {
      try {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, textToInsert);
      } catch (e) {}
    }

    // Fallback 3: Direct textContent only if neither execCommand nor ClipboardEvent was available
    if (!pasteHandled && (typeof document === 'undefined' || !document.execCommand) && editor.isContentEditable) {
      try {
        editor.textContent = textToInsert;
      } catch (e) {}
    }

    // Always write to clipboard so user has an instant manual backup (Ctrl+V) if needed
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToInsert).catch(() => {});
    }

    return true;
  }

  // --- Floating Copilot Drawer Controller ---
  class CopilotManager {
    constructor() {
      this.isOpen = false;
      this.chatHistory = [];
      this.latestReply = '';
      this.activeTweet = { author: '', authorName: 'there', text: '', isNestedReply: false };
    }

    mount() {
      if (document.getElementById('pulsex-copilot-container')) return;

      const host = document.createElement('div');
      host.id = 'pulsex-copilot-container';
      host.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;';

      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>${getPulseXStyles()}</style>
        <div class="px-theme">
          <div class="pulsex-floating-toggle" id="pulsex-floating-toggle" title="PulseX AI Copilot">
            <svg class="pulsex-toggle-svg" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>

          <div class="pulsex-drawer" id="pulsex-drawer">
            <div class="pulsex-copilot-header">
              <div class="pulsex-copilot-title">
                <span class="pulsex-pulse-dot"></span>
                <span class="pulsex-brand-title">PulseX Copilot</span>
                <a href="https://x.com/finnbuilt" target="_blank" rel="noreferrer" class="pulsex-header-author" title="Built by @finnbuilt">by @finnbuilt</a>
              </div>
              <button class="pulsex-close-btn" id="pulsex-close-btn">&times;</button>
            </div>

            <div class="pulsex-context-box">
              <div class="pulsex-context-label">
                <span id="pulsex-context-badge">🎯 Focused Context</span>
                <span id="pulsex-nested-badge" style="font-size: 10px; color: #06b6d4;"></span>
              </div>
              <div id="pulsex-context-desc">Detecting active tweet...</div>
            </div>

            <div class="pulsex-chips-row">
              <span class="pulsex-chip" data-p="Keep it under 20 words, super punchy">⚡ Ultra-Short & Punchy</span>
              <span class="pulsex-chip" data-p="Respectfully offer a counter-perspective">🛡️ Counter Angle</span>
              <span class="pulsex-chip" data-p="Add a high-value insight or metric">💡 Add Value</span>
              <span class="pulsex-chip" data-p="Rewrite into simple, clear native English">🌐 Clean English</span>
              <span class="pulsex-chip" data-mode="quote">🔁 Viral Quote Hook</span>
            </div>

            <div class="pulsex-chat-messages" id="pulsex-chat-messages">
              <div class="pulsex-msg pulsex-msg-assistant">
                Hey there! I am your PulseX Copilot (built by @finnbuilt). I automatically detect who you are replying to, analyze their point, and craft personalized, humanly short responses.
              </div>
            </div>

            <div class="pulsex-chat-footer">
              <div class="pulsex-chat-input-row">
                <textarea class="pulsex-chat-input" id="pulsex-chat-input" placeholder="Ask Copilot (e.g. 'Give me 2 short answers')..."></textarea>
                <button class="pulsex-chat-send" id="pulsex-chat-send">Send</button>
              </div>
              <button class="pulsex-insert-btn" id="pulsex-insert-btn">
                <span>Insert Latest Reply into Tweet</span>
              </button>
              <div class="pulsex-drawer-credits">
                Built by <a href="https://x.com/finnbuilt" target="_blank" rel="noreferrer" class="pulsex-author-link">Finn (@finnbuilt) ↗</a>
              </div>
            </div>
          </div>
        </div>
      `;

      (document.documentElement || document.body).appendChild(host);
      this.bindEvents(shadow);
    }

    detectFocusedTweet() {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.getAttribute('role') === 'textbox') {
        const modal = activeEl.closest('[role="dialog"]');
        if (modal) {
          const tweets = Array.from(modal.querySelectorAll('article[data-testid="tweet"]'));
          if (tweets.length > 0) return extractTweetData(tweets[tweets.length - 1]);
        }
      }

      const tweets = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
      if (tweets.length > 0) {
        const centerY = window.innerHeight / 2;
        let closest = tweets[0];
        let minD = Infinity;
        for (const t of tweets) {
          const r = t.getBoundingClientRect();
          const d = Math.abs((r.top + r.bottom) / 2 - centerY);
          if (d < minD) { minD = d; closest = t; }
        }
        return extractTweetData(closest);
      }
      return { author: 'creator', authorName: 'there', text: 'Viewing timeline', isNestedReply: false };
    }

    bindEvents(shadow) {
      const toggle = shadow.getElementById('pulsex-floating-toggle');
      const drawer = shadow.getElementById('pulsex-drawer');
      const closeBtn = shadow.getElementById('pulsex-close-btn');
      const contextDesc = shadow.getElementById('pulsex-context-desc');
      const nestedBadge = shadow.getElementById('pulsex-nested-badge');
      const chatMessages = shadow.getElementById('pulsex-chat-messages');
      const chatInput = shadow.getElementById('pulsex-chat-input');
      const chatSend = shadow.getElementById('pulsex-chat-send');
      const chips = shadow.querySelectorAll('.pulsex-chip');
      const insertBtn = shadow.getElementById('pulsex-insert-btn');

      // Restore saved toggle position
      try {
        const savedPos = JSON.parse(localStorage.getItem('pulsex_toggle_pos') || '{}');
        if (savedPos.left && savedPos.top) {
          toggle.style.left = savedPos.left;
          toggle.style.top = savedPos.top;
          toggle.style.right = 'auto';
          toggle.style.bottom = 'auto';
        }
      } catch (e) {}

      // Draggable toggle support with click distinction
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;
      let hasDragged = false;

      const onMouseDown = (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = toggle.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        const onMouseMove = (ev) => {
          if (!isDragging) return;
          const dx = ev.clientX - startX;
          const dy = ev.clientY - startY;
          if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
            hasDragged = true;
          }
          if (hasDragged) {
            const clampX = Math.max(12, Math.min(window.innerWidth - 65, initialLeft + dx));
            const clampY = Math.max(12, Math.min(window.innerHeight - 65, initialTop + dy));
            toggle.style.left = `${clampX}px`;
            toggle.style.top = `${clampY}px`;
            toggle.style.right = 'auto';
            toggle.style.bottom = 'auto';
          }
        };

        const onMouseUp = () => {
          if (!isDragging) return;
          isDragging = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);

          if (hasDragged) {
            try {
              localStorage.setItem('pulsex_toggle_pos', JSON.stringify({
                left: toggle.style.left,
                top: toggle.style.top
              }));
            } catch (e) {}
          }
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      };

      toggle.addEventListener('mousedown', onMouseDown);

      const openDrawer = () => {
        this.isOpen = true;
        drawer.classList.add('open');
        this.activeTweet = this.detectFocusedTweet();

        const nameLabel = this.activeTweet.authorName !== 'there' ? this.activeTweet.authorName : `@${this.activeTweet.author}`;
        contextDesc.textContent = `${nameLabel}: "${this.activeTweet.text.slice(0, 110)}..."`;
        nestedBadge.textContent = this.activeTweet.isNestedReply ? '💬 Nested Comment' : '📌 Main Post';
      };

      const closeDrawer = () => {
        this.isOpen = false;
        drawer.classList.remove('open');
      };

      toggle.addEventListener('click', (e) => {
        if (hasDragged) {
          hasDragged = false;
          return;
        }
        this.isOpen ? closeDrawer() : openDrawer();
      });

      closeBtn.addEventListener('click', closeDrawer);

      const appendMsg = (role, text, isHtml = false) => {
        const msg = document.createElement('div');
        msg.className = `pulsex-msg pulsex-msg-${role}`;
        if (isHtml) {
          msg.innerHTML = text;
          const setupBtn = msg.querySelector('#px-open-settings-action') || msg.querySelector('.px-setup-btn');
          if (setupBtn) {
            setupBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
                try { chrome.runtime.openOptionsPage(); } catch (err) {}
              }
              chrome.runtime.sendMessage({ action: 'OPEN_SETTINGS' });
            });
          }
        } else {
          msg.textContent = text;
        }
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      };

      const sendChat = (text) => {
        if (!text || !text.trim()) return;
        appendMsg('user', text.trim());
        this.chatHistory.push({ role: 'user', content: text.trim() });
        chatInput.value = '';

        const spinner = document.createElement('div');
        spinner.className = 'pulsex-msg pulsex-msg-assistant';
        spinner.innerHTML = '<span class="pulsex-spinner"></span> <span>Analyzing & crafting short reply...</span>';
        chatMessages.appendChild(spinner);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        const fallbackTimer = setTimeout(() => {
          spinner.remove();
          appendMsg('assistant', '⚠️ Copilot request timed out (95s). The provider may be experiencing high latency. Try switching models or checking settings.');
        }, 95000);

        chrome.runtime.sendMessage({
          action: 'COPILOT_CHAT',
          payload: { tweetContext: this.activeTweet, history: this.chatHistory }
        }, (res) => {
          clearTimeout(fallbackTimer);
          spinner.remove();

          if (chrome.runtime.lastError) {
            appendMsg('assistant', `⚠️ Extension connection error: ${chrome.runtime.lastError.message}. Please refresh this page.`);
            return;
          }

          if (res && res.success && res.reply) {
            this.latestReply = res.reply;
            this.chatHistory.push({ role: 'assistant', content: res.reply });
            appendMsg('assistant', res.reply);
          } else {
            const isApiKeyMissing = res?.code === 'API_KEY_MISSING' || (res?.error && res.error.toLowerCase().includes('api key not configured'));
            if (isApiKeyMissing) {
              appendMsg('assistant', renderApiKeyMissingCard(res?.provider || 'AI Model'), true);
            } else {
              appendMsg('assistant', `⚠️ ${res?.error || 'Failed to reach AI provider. Check your settings.'}`);
            }
          }
        });
      };

      chatSend.addEventListener('click', () => sendChat(chatInput.value));
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendChat(chatInput.value);
        }
      });

      const sendQuoteTweet = () => {
        appendMsg('user', 'Draft a viral Quote Tweet reaction');
        const spinner = document.createElement('div');
        spinner.className = 'pulsex-msg pulsex-msg-assistant';
        spinner.innerHTML = '<span class="pulsex-spinner"></span> <span>Drafting viral quote commentary...</span>';
        chatMessages.appendChild(spinner);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chrome.runtime.sendMessage({
          action: 'GENERATE_QUOTE_TWEET',
          payload: {
            tweetText: this.activeTweet.text,
            tweetAuthor: this.activeTweet.author,
            authorName: this.activeTweet.authorName
          }
        }, (res) => {
          spinner.remove();
          if (res && res.success && res.reply) {
            this.latestReply = res.reply;
            this.chatHistory.push({ role: 'assistant', content: res.reply });
            appendMsg('assistant', `Quote Tweet Draft:\n${res.reply}`);
          } else {
            const isApiKeyMissing = res?.code === 'API_KEY_MISSING' || (res?.error && res.error.toLowerCase().includes('api key not configured'));
            if (isApiKeyMissing) {
              appendMsg('assistant', renderApiKeyMissingCard(res?.provider || 'AI Model'), true);
            } else {
              appendMsg('assistant', `⚠️ ${res?.error || 'Failed to craft quote tweet'}`);
            }
          }
        });
      };

      chips.forEach(c => {
        c.addEventListener('click', () => {
          if (c.dataset.mode === 'quote') {
            sendQuoteTweet();
          } else {
            sendChat(c.dataset.p);
          }
        });
      });

      insertBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (insertBtn.dataset.busy === 'true') return;
        insertBtn.dataset.busy = 'true';

        if (!this.latestReply) {
          alert('Ask Copilot for a reply suggestion first!');
          delete insertBtn.dataset.busy;
          return;
        }
        const editor = findActualContentEditable(null);
        if (editor) {
          insertTextIntoEditor(editor, this.latestReply);
          insertBtn.innerHTML = '<span>✅ Inserted!</span>';
          setTimeout(() => {
            closeDrawer();
            insertBtn.innerHTML = '<span>Insert Latest Reply into Tweet</span>';
            delete insertBtn.dataset.busy;
          }, 600);
        } else {
          if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(this.latestReply).catch(() => {});
          }
          insertBtn.innerHTML = '<span>✅ Copied to clipboard!</span>';
          setTimeout(() => {
            insertBtn.innerHTML = '<span>Insert Latest Reply into Tweet</span>';
            delete insertBtn.dataset.busy;
          }, 2000);
        }
      });
    }
  }

  // --- In-Timeline Reply Assistant ---
  class TimelineManager {
    constructor() {
      this.seenEditors = new WeakSet();
    }

    mountCollapsedButton(inlineReply, editorEl) {
      if (!inlineReply || inlineReply.querySelector('.pulsex-collapsed-host')) return;

      const host = document.createElement('div');
      host.className = 'pulsex-collapsed-host';
      host.style.cssText = 'display: inline-flex !important; align-items: center !important; margin: 0 8px !important; flex-shrink: 0 !important; z-index: 5 !important; vertical-align: middle !important;';

      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          :host {
            display: inline-flex !important;
            align-items: center !important;
          }
          .pulsex-collapsed-btn {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            height: 34px;
            padding: 0 14px;
            border-radius: 9999px;
            background: linear-gradient(135deg, rgba(6, 78, 59, 0.45) 0%, rgba(16, 185, 129, 0.22) 60%, rgba(6, 182, 212, 0.25) 100%);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border: 1px solid rgba(16, 185, 129, 0.45);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35), 0 0 10px rgba(16, 185, 129, 0.2);
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            outline: none;
          }
          .pulsex-collapsed-btn:hover {
            background: linear-gradient(135deg, rgba(6, 78, 59, 0.65) 0%, rgba(16, 185, 129, 0.35) 60%, rgba(6, 182, 212, 0.4) 100%);
            border-color: #10b981;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), 0 0 18px rgba(16, 185, 129, 0.45);
            transform: translateY(-1px);
          }
          .pulsex-collapsed-btn:active {
            transform: translateY(0);
          }
          .pulsex-pulse-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
            animation: pulsex-pulse-anim 2s infinite ease-in-out;
          }
          .pulsex-collapsed-text {
            background: linear-gradient(135deg, #ffffff 0%, #34d399 65%, #38bdf8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
            letter-spacing: 0.2px;
          }
          @keyframes pulsex-pulse-anim {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.35); }
          }
        </style>
        <button type="button" class="pulsex-collapsed-btn" title="Expand composer with PulseX AI Assistant">
          <span class="pulsex-pulse-dot"></span>
          <span class="pulsex-collapsed-text">Reply with PulseX</span>
        </button>
      `;

      const btn = shadow.querySelector('.pulsex-collapsed-btn');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // User clicked Reply with PulseX: expand Twitter composer AND auto-open PulseX full interface
        inlineReply.dataset.pulsexAutoOpen = 'true';

        const trigger = inlineReply.querySelector('[role="textbox"], [data-testid="tweetTextarea_0_label"], [data-testid="tweetTextarea_0"], div[contenteditable="true"]') || inlineReply;

        if (trigger) {
          try {
            if (typeof PointerEvent !== 'undefined') {
              trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
            }
            trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
            if (typeof trigger.focus === 'function') trigger.focus();
            trigger.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
            if (typeof PointerEvent !== 'undefined') {
              trigger.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
            }
            trigger.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
            trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          } catch (err) {}
        }

        host.remove();

        setTimeout(() => this.scan(), 50);
        setTimeout(() => this.scan(), 150);
        setTimeout(() => this.scan(), 350);
        setTimeout(() => this.scan(), 700);
      });

      const nativeReplyBtn = inlineReply.querySelector('[data-testid="tweetButtonInline"], [data-testid*="tweetButton"]');
      if (nativeReplyBtn && nativeReplyBtn.parentNode) {
        nativeReplyBtn.parentNode.insertBefore(host, nativeReplyBtn);
      } else {
        inlineReply.appendChild(host);
      }
    }

    scan() {
      // 1. Bidirectional sync: check for any inline replies that may have collapsed back
      const inlineReplies = document.querySelectorAll('div[data-testid="Inline-Tweet-Reply"]');
      for (const ir of inlineReplies) {
        const tb = ir.querySelector('[data-testid="toolBar"]');
        if (!tb) {
          const lingeringFullBar = ir.querySelector('.pulsex-inline-container');
          if (lingeringFullBar) lingeringFullBar.remove();

          if (!ir.querySelector('.pulsex-collapsed-host')) {
            const ed = ir.querySelector('[role="textbox"]') || ir;
            this.seenEditors.delete(ed);
            this.mountCollapsedButton(ir, ed);
          }
        }
      }

      // 2. Scan composer targets
      const selectors = [
        '[data-testid="tweetTextarea_0"]',
        '[data-testid="tweetTextarea_0_label"]',
        'div[role="textbox"][contenteditable="true"][data-testid*="tweet"]',
        'div[data-testid="Inline-Tweet-Reply"]'
      ];

      const targets = document.querySelectorAll(selectors.join(', '));
      for (const target of targets) {
        let editor = target.getAttribute('role') === 'textbox' ? target : target.querySelector('[role="textbox"]') || target;
        if (this.seenEditors.has(editor)) continue;
        this.attachToolbar(editor);
      }
    }

    attachToolbar(editorEl) {
      const label = editorEl.closest('[data-testid="tweetTextarea_0_label"]') ||
                    editorEl.closest('[data-testid="Inline-Tweet-Reply"]') ||
                    editorEl.parentElement;

      if (!label) return;

      const composerRoot = editorEl.closest('form') ||
                           editorEl.closest('[data-testid="Inline-Tweet-Reply"]') ||
                           editorEl.closest('[role="dialog"]') ||
                           label.parentNode;

      // Check if we are inside Twitter's inline reply section
      const inlineReply = editorEl.closest('[data-testid="Inline-Tweet-Reply"]');
      const toolbar = composerRoot?.querySelector('[data-testid="toolBar"]') ||
                      label.parentNode?.querySelector('[data-testid="toolBar"]');

      // Collapsed quick-reply state detection (Image 1):
      // Inside Inline-Tweet-Reply and bottom toolBar is not yet present
      const isCollapsed = inlineReply && !toolbar;

      if (isCollapsed) {
        // Never mount the full 5-angle card in the collapsed 1-line row.
        const lingeringFullBar = composerRoot?.querySelector('.pulsex-inline-container') || inlineReply.querySelector('.pulsex-inline-container');
        if (lingeringFullBar) lingeringFullBar.remove();

        // Mount the sleek "Reply with PulseX" button
        this.mountCollapsedButton(inlineReply, editorEl);
        return;
      }

      // In the expanded state (Image 2):
      // 1. Remove any collapsed button
      if (inlineReply) {
        inlineReply.querySelectorAll('.pulsex-collapsed-host').forEach(el => el.remove());
      }

      // 2. Prevent duplicate full container
      if (composerRoot?.querySelector('.pulsex-inline-container') || label.parentNode?.querySelector('.pulsex-inline-container')) {
        return;
      }

      this.seenEditors.add(editorEl);

      // Analyze tweet being replied to with smart resolution
      const { targetTweetEl, rootTweetEl } = resolveTargetTweetAndRoot(editorEl);
      const targetData = extractTweetData(targetTweetEl);
      const rootData = rootTweetEl ? extractTweetData(rootTweetEl) : null;
      const isNested = targetData.isNestedReply || (rootData && targetData.author !== rootData.author);
      const nameToDisplay = targetData.authorName !== 'there' ? targetData.authorName : `@${targetData.author}`;

      const host = document.createElement('div');
      host.className = 'pulsex-inline-container';
      host.style.cssText = 'width: 100% !important; flex-basis: 100% !important; display: block !important; box-sizing: border-box !important; z-index: 10; margin: 8px 0 !important; clear: both !important;';

      // Prevent clicks inside PulseX from bubbling up to Twitter's composer container
      host.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Check if user clicked from collapsed button or requested auto-open
      const shouldAutoOpen = inlineReply && inlineReply.dataset.pulsexAutoOpen === 'true';
      if (inlineReply) delete inlineReply.dataset.pulsexAutoOpen;

      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>${getPulseXStyles()}</style>
        <div class="px-theme">
          <!-- 1. Sleek Trigger Button View (First thing user sees in composer) -->
          <div class="pulsex-trigger-bar" id="px-trigger-bar" style="display: ${shouldAutoOpen ? 'none' : 'flex'};">
            <button type="button" class="pulsex-trigger-btn" id="px-trigger-btn" title="Expand PulseX Reply AI">
              <span class="pulsex-pulse-dot"></span>
              <span class="pulsex-trigger-text">Reply with PulseX</span>
            </button>
          </div>

          <!-- 2. Full Interface View (Shown when user clicks Reply with PulseX) -->
          <div class="pulsex-inline-bar" id="px-full-bar" style="display: ${shouldAutoOpen ? 'flex' : 'none'};">
            <div class="pulsex-bar-header">
              <div class="pulsex-brand">
                <span class="pulsex-pulse-dot"></span>
                <span class="pulsex-brand-title">PulseX Reply</span>
                <a href="https://x.com/finnbuilt" target="_blank" rel="noreferrer" class="pulsex-header-author" title="Built by @finnbuilt">by @finnbuilt</a>
              </div>
              <div class="pulsex-header-right">
                <div class="pulsex-target-badge">
                  <span>Replying to <strong>${nameToDisplay}</strong> ${isNested ? '(in thread)' : ''}</span>
                </div>
                <button type="button" class="pulsex-close-btn" id="px-close-btn" title="Collapse PulseX">✕</button>
              </div>
            </div>

            <div class="pulsex-angles-row">
              <button class="pulsex-angle-btn" data-angle="agree">🤝 Agree & Expand</button>
              <button class="pulsex-angle-btn" data-angle="counter">⚡ Counter</button>
              <button class="pulsex-angle-btn" data-angle="insight">💡 Insight</button>
              <button class="pulsex-angle-btn" data-angle="witty">🎯 Witty</button>
              <button class="pulsex-angle-btn" data-angle="question">❓ Question</button>
            </div>

            <div class="pulsex-raw-row">
              <input type="text" class="pulsex-raw-input" placeholder="Type raw thoughts (e.g. 'agree with #1, but cost too high') or pick an angle..." />
              <button class="pulsex-btn-generate">
                <span>Generate</span>
              </button>
            </div>

            <div class="pulsex-preview-box">
              <div class="pulsex-preview-top">
                <div class="pulsex-variants-tabs" style="display: none;">
                  <button class="pulsex-tab-btn active" data-v="0">Draft 1</button>
                  <button class="pulsex-tab-btn" data-v="1">Draft 2</button>
                </div>
                <div class="pulsex-metrics-pill" id="pulsex-metrics"></div>
              </div>
              <div class="pulsex-preview-content"></div>
              <div class="pulsex-tone-row">
                <span class="pulsex-tone-label">Refine:</span>
                <button class="pulsex-tone-btn" data-mode="shorter">⚡ Shorter</button>
                <button class="pulsex-tone-btn" data-mode="punchier">🌶️ Punchier</button>
                <button class="pulsex-tone-btn" data-mode="formal">👔 Executive</button>
                <button class="pulsex-tone-btn" data-mode="question">❓ Add Question</button>
              </div>
              <div class="pulsex-preview-actions">
                <button class="pulsex-preview-btn pulsex-preview-reroll">🔄 Reroll</button>
                <button class="pulsex-preview-btn pulsex-preview-discard">Discard</button>
                <button class="pulsex-preview-btn pulsex-preview-insert">Insert into Tweet</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Smart mounting: If bottom toolBar exists, insert right above toolBar.
      // 1. Locate Twitter's bottom toolbar
      const activeToolbar = toolbar ||
                            composerRoot?.querySelector('[data-testid="toolBar"]') ||
                            label.parentNode?.querySelector('[data-testid="toolBar"]');

      // 2. Force column layout on parent containers so textarea and PulseX NEVER share horizontal space
      const containerToColumnize = activeToolbar?.parentNode || label.parentNode;
      if (containerToColumnize) {
        try {
          containerToColumnize.style.setProperty('display', 'flex', 'important');
          containerToColumnize.style.setProperty('flex-direction', 'column', 'important');
          containerToColumnize.style.setProperty('width', '100%', 'important');
        } catch (e) {}
      }

      if (label && label.style) {
        try {
          label.style.setProperty('width', '100%', 'important');
          label.style.setProperty('flex', '1 1 100%', 'important');
        } catch (e) {}
      }

      if (activeToolbar && activeToolbar.parentNode) {
        activeToolbar.parentNode.insertBefore(host, activeToolbar);
      } else if (label.parentNode) {
        if (label.nextSibling) {
          label.parentNode.insertBefore(host, label.nextSibling);
        } else {
          label.parentNode.appendChild(host);
        }
      }

      this.bindBarEvents(shadow, editorEl, targetData, rootData, isNested);
    }

    bindBarEvents(shadow, editorEl, targetData, rootData, isNested) {
      const triggerBar = shadow.querySelector('#px-trigger-bar');
      const triggerBtn = shadow.querySelector('#px-trigger-btn');
      const fullBar = shadow.querySelector('#px-full-bar');
      const closeBtn = shadow.querySelector('#px-close-btn');

      if (triggerBtn && fullBar && triggerBar) {
        triggerBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          triggerBar.style.display = 'none';
          fullBar.style.display = 'flex';
          const inputToFocus = shadow.querySelector('.pulsex-raw-input');
          if (inputToFocus) {
            setTimeout(() => inputToFocus.focus(), 60);
          }
        });
      }

      if (closeBtn && fullBar && triggerBar) {
        closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          fullBar.style.display = 'none';
          triggerBar.style.display = 'flex';
        });
      }

      const rawInput = shadow.querySelector('.pulsex-raw-input');
      const genBtn = shadow.querySelector('.pulsex-btn-generate');
      const angleBtns = shadow.querySelectorAll('.pulsex-angle-btn');
      const previewBox = shadow.querySelector('.pulsex-preview-box');
      const previewContent = shadow.querySelector('.pulsex-preview-content');
      const previewTop = shadow.querySelector('.pulsex-preview-top');
      const variantsTabs = shadow.querySelector('.pulsex-variants-tabs');
      const tabBtns = shadow.querySelectorAll('.pulsex-tab-btn');
      const metricsPill = shadow.querySelector('#pulsex-metrics');
      const toneRow = shadow.querySelector('.pulsex-tone-row');
      const toneBtns = shadow.querySelectorAll('.pulsex-tone-btn');
      const previewActions = shadow.querySelector('.pulsex-preview-actions');
      const rerollBtn = shadow.querySelector('.pulsex-preview-reroll');
      const discardBtn = shadow.querySelector('.pulsex-preview-discard');
      const insertBtn = shadow.querySelector('.pulsex-preview-insert');

      let currentAngle = 'insight';
      let drafts = [];
      let activeIndex = 0;

      const getActiveContext = () => {
        const { targetTweetEl, rootTweetEl } = resolveTargetTweetAndRoot(editorEl);
        const freshTarget = extractTweetData(targetTweetEl);
        const freshRoot = rootTweetEl ? extractTweetData(rootTweetEl) : null;

        const activeTarget = (freshTarget && freshTarget.text) ? freshTarget : targetData;
        const activeRoot = (freshRoot && freshRoot.text) ? freshRoot : rootData;
        const activeIsNested = activeTarget.isNestedReply || (activeRoot && activeTarget.author !== activeRoot.author);

        const badgeSpan = shadow.querySelector('.pulsex-target-badge span');
        if (badgeSpan && activeTarget) {
          const displayName = activeTarget.authorName !== 'there' ? activeTarget.authorName : `@${activeTarget.author}`;
          badgeSpan.innerHTML = `Replying to <strong>${displayName}</strong> ${activeIsNested ? '(in thread)' : ''}`;
        }

        return { target: activeTarget, root: activeRoot, isNested: activeIsNested };
      };

      const updateMetrics = (text) => {
        if (!text || !metricsPill) return;
        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const chars = text.length;
        metricsPill.textContent = `⚡ ${words}w · ${chars}/280`;
        if (chars > 260) {
          metricsPill.classList.add('warn');
        } else {
          metricsPill.classList.remove('warn');
        }
      };

      const renderActiveDraft = () => {
        const text = drafts[activeIndex] || '';
        previewContent.textContent = text;
        updateMetrics(text);
        tabBtns.forEach((btn, idx) => {
          btn.classList.toggle('active', idx === activeIndex);
        });
      };

      const attachSetupAction = () => {
        const setupBtn = shadow.getElementById('px-open-settings-action');
        if (setupBtn) {
          setupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
              try { chrome.runtime.openOptionsPage(); } catch (err) {}
            }
            chrome.runtime.sendMessage({ action: 'OPEN_SETTINGS' });
          });
        }
      };

      const triggerGen = () => {
        const rawThought = rawInput.value.trim();
        const ctx = getActiveContext();

        if (!ctx.target.text || !ctx.target.text.trim()) {
          previewContent.innerHTML = `<span style="color: #f87171;">⚠️ Could not detect tweet content to reply to. Please ensure you are replying to an active tweet.</span>`;
          previewBox.style.display = 'block';
          return;
        }

        genBtn.innerHTML = '<span class="pulsex-spinner"></span> <span>Analyzing...</span>';
        genBtn.disabled = true;

        const progressTimer1 = setTimeout(() => {
          if (genBtn.disabled) {
            genBtn.innerHTML = '<span class="pulsex-spinner"></span> <span>Thinking...</span>';
          }
        }, 5000);

        const progressTimer2 = setTimeout(() => {
          if (genBtn.disabled) {
            genBtn.innerHTML = '<span class="pulsex-spinner"></span> <span>Crafting reply...</span>';
          }
        }, 16000);

        const fallbackTimer = setTimeout(() => {
          genBtn.innerHTML = '<span>Generate</span>';
          genBtn.disabled = false;
          previewContent.innerHTML = `<span style="color: #f87171;">⚠️ Request timed out (95s). The provider servers may be experiencing high latency. Try switching models or check your settings.</span>`;
          previewBox.style.display = 'block';
        }, 95000);

        chrome.runtime.sendMessage({
          action: 'GENERATE_REPLY',
          payload: {
            tweetText: ctx.target.text,
            tweetAuthor: ctx.target.author,
            authorName: ctx.target.authorName,
            isNestedReply: ctx.isNested,
            rootTopic: ctx.root ? ctx.root.text : '',
            angle: currentAngle,
            rawThought,
            multiVariation: true
          }
        }, (res) => {
          clearTimeout(progressTimer1);
          clearTimeout(progressTimer2);
          clearTimeout(fallbackTimer);

          genBtn.innerHTML = '<span>Generate</span>';
          genBtn.disabled = false;

          if (chrome.runtime.lastError) {
            previewContent.innerHTML = `<span style="color: #f87171;">⚠️ Extension connection error: ${chrome.runtime.lastError.message}. Please refresh this page.</span>`;
            previewBox.style.display = 'block';
            return;
          }

          if (res && res.success && (res.reply || (res.variations && res.variations.length > 0))) {
            drafts = (res.variations && res.variations.length > 0) ? res.variations : [res.reply];
            activeIndex = 0;
            if (previewTop) previewTop.style.display = 'flex';
            if (toneRow) toneRow.style.display = 'flex';
            if (previewActions) previewActions.style.display = 'flex';
            if (variantsTabs) {
              variantsTabs.style.display = drafts.length > 1 ? 'flex' : 'none';
            }
            renderActiveDraft();
            previewBox.style.display = 'block';
          } else {
            const isApiKeyMissing = res?.code === 'API_KEY_MISSING' || (res?.error && res.error.toLowerCase().includes('api key not configured'));
            if (isApiKeyMissing) {
              previewContent.innerHTML = renderApiKeyMissingCard(res?.provider || 'AI Model');
              if (previewTop) previewTop.style.display = 'none';
              if (toneRow) toneRow.style.display = 'none';
              if (previewActions) previewActions.style.display = 'none';
              attachSetupAction();
            } else {
              previewContent.innerHTML = `<span style="color: #f87171;">⚠️ ${res?.error || 'Check API provider key in PulseX settings.'}</span>`;
              if (previewTop) previewTop.style.display = 'none';
              if (toneRow) toneRow.style.display = 'none';
              if (previewActions) previewActions.style.display = 'flex';
            }
            previewBox.style.display = 'block';
          }
        });
      };

      tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const idx = parseInt(btn.dataset.v, 10);
          if (drafts[idx] !== undefined) {
            activeIndex = idx;
            renderActiveDraft();
          }
        });
      });

      toneBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const currentDraft = drafts[activeIndex];
          if (!currentDraft) return;

          const ctx = getActiveContext();
          const mode = btn.dataset.mode;
          const orig = btn.textContent;
          btn.textContent = '⏳ ...';
          btn.disabled = true;

          chrome.runtime.sendMessage({
            action: 'REWRITE_REPLY',
            payload: {
              originalReply: currentDraft,
              mode,
              tweetText: ctx.target.text,
              authorName: ctx.target.authorName
            }
          }, (res) => {
            btn.textContent = orig;
            btn.disabled = false;
            if (res && res.success && res.reply) {
              drafts[activeIndex] = res.reply;
              renderActiveDraft();
            } else {
              const isApiKeyMissing = res?.code === 'API_KEY_MISSING' || (res?.error && res.error.toLowerCase().includes('api key not configured'));
              if (isApiKeyMissing) {
                previewContent.innerHTML = renderApiKeyMissingCard(res?.provider || 'AI Model');
                if (previewTop) previewTop.style.display = 'none';
                if (toneRow) toneRow.style.display = 'none';
                if (previewActions) previewActions.style.display = 'none';
                attachSetupAction();
              }
            }
          });
        });
      });

      angleBtns.forEach(b => {
        b.addEventListener('click', (e) => {
          e.preventDefault();
          angleBtns.forEach(btn => btn.classList.remove('active'));
          b.classList.add('active');
          currentAngle = b.dataset.angle;
          triggerGen();
        });
      });

      genBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerGen();
      });

      rerollBtn.addEventListener('click', (e) => {
        e.preventDefault();
        triggerGen();
      });

      rawInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || (e.ctrlKey && e.key === 'Enter') || (e.metaKey && e.key === 'Enter')) {
          e.preventDefault();
          triggerGen();
        }
      });

      shadow.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          previewBox.style.display = 'none';
        }
      });

      discardBtn.addEventListener('click', () => {
        previewBox.style.display = 'none';
        drafts = [];
        activeIndex = 0;
        if (fullBar && triggerBar) {
          fullBar.style.display = 'none';
          triggerBar.style.display = 'flex';
        }
      });

      insertBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (insertBtn.dataset.busy === 'true') return;
        insertBtn.dataset.busy = 'true';

        const textToInsert = drafts[activeIndex];
        if (textToInsert) {
          insertTextIntoEditor(editorEl, textToInsert);
          insertBtn.innerHTML = '<span>✅ Inserted!</span>';
          setTimeout(() => {
            previewBox.style.display = 'none';
            insertBtn.innerHTML = '<span>Insert into Tweet</span>';
            delete insertBtn.dataset.busy;
          }, 600);
        } else {
          delete insertBtn.dataset.busy;
        }
      });
    }
  }

  // --- Ad & Noise Filter ---
  function filterNoise() {
    chrome.storage.local.get(['adFilterEnabled'], (data) => {
      if (data.adFilterEnabled === false) return;

      const tweets = document.querySelectorAll('article[data-testid="tweet"]');
      let blocked = 0;

      for (const tweet of tweets) {
        if (tweet.dataset.pulsexFiltered) continue;
        const text = tweet.textContent || '';
        const isAd = AD_REGEX.test(text);
        const isSpam = SPAM_REGEX.some(p => p.test(text));

        if (isAd || isSpam) {
          tweet.dataset.pulsexFiltered = 'true';
          tweet.style.display = 'none';
          blocked++;
        }
      }

      if (blocked > 0) {
        chrome.runtime.sendMessage({
          action: 'UPDATE_BADGE_COUNT',
          payload: { count: blocked }
        }).catch(() => {});
      }
    });
  }

  // --- Start Coordinator ---
  const copilot = new CopilotManager();
  const timeline = new TimelineManager();

  function boot() {
    copilot.mount();
    timeline.scan();
    filterNoise();

    const observer = new MutationObserver(() => {
      timeline.scan();
      filterNoise();
    });

    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    setInterval(() => {
      copilot.mount();
      timeline.scan();
      filterNoise();
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
