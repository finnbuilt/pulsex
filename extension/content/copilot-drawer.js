/**
 * PulseX - Floating AI Copilot Drawer
 * Draggable floating trigger and slide-out chat copilot using Shadow DOM.
 */

import { getShadowStyles, renderCopilotDrawerTemplate } from './shadow-templates.js';
import { extractTweetDataFromElement, insertTextIntoTwitterEditor } from '../utils/x-dom-helpers.js';

export function formatCopilotHistory({ tweetContext = {}, persona = '', history = [] }) {
  const author = tweetContext.author ? `@${tweetContext.author}` : 'creator';
  const text = tweetContext.text || '(No specific tweet selected)';
  const personaText = persona.trim() ? `\nUser Tone & Persona: ${persona.trim()}` : '';

  const systemMessage = {
    role: 'system',
    content: `You are PulseX Copilot, an elite thinking partner and ghostwriter for X (Twitter).
The user is viewing or discussing this tweet:
[Author]: ${author}
[Tweet]: "${text}"
${personaText}
Assist the user in crafting replies, iterating on drafts, reframing arguments, or creating punchy variations.
Keep your suggestions concise, witty, actionable, and ready to post on X.`
  };

  return [systemMessage, ...history];
}

export class CopilotDrawer {
  constructor() {
    this.hostEl = null;
    this.shadow = null;
    this.isOpen = false;
    this.activeTweetContext = { author: '', text: '' };
    this.chatHistory = [];
    this.latestAssistantReply = '';
  }

  mount(targetRoot = document.body) {
    if (document.getElementById('pulsex-copilot-container')) return;

    this.hostEl = document.createElement('div');
    this.hostEl.id = 'pulsex-copilot-container';

    this.shadow = this.hostEl.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = `
      <style>${getShadowStyles()}</style>
      ${renderCopilotDrawerTemplate()}
    `;

    targetRoot.appendChild(this.hostEl);
    this.initEvents();
  }

  detectActiveTweet() {
    // 1. Check if user is typing in a reply box
    const activeEditor = document.activeElement;
    if (activeEditor && activeEditor.getAttribute('role') === 'textbox') {
      const modal = activeEditor.closest('[role="dialog"]');
      if (modal) {
        const tweet = modal.querySelector('article[data-testid="tweet"]');
        if (tweet) return extractTweetDataFromElement(tweet);
      }
    }

    // 2. Nearest tweet in viewport center
    const tweets = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    if (tweets.length > 0) {
      const viewportCenterY = window.innerHeight / 2;
      let closestTweet = tweets[0];
      let minDistance = Infinity;

      for (const t of tweets) {
        const rect = t.getBoundingClientRect();
        const dist = Math.abs((rect.top + rect.bottom) / 2 - viewportCenterY);
        if (dist < minDistance) {
          minDistance = dist;
          closestTweet = t;
        }
      }

      return extractTweetDataFromElement(closestTweet);
    }

    return { author: 'creator', text: 'No tweet currently focused' };
  }

  initEvents() {
    const toggleBtn = this.shadow.getElementById('pulsex-floating-toggle');
    const drawer = this.shadow.getElementById('pulsex-drawer');
    const closeBtn = this.shadow.getElementById('pulsex-close-btn');
    const contextText = this.shadow.getElementById('pulsex-context-text');
    const chatMessages = this.shadow.getElementById('pulsex-chat-messages');
    const chatInput = this.shadow.getElementById('pulsex-chat-input');
    const chatSend = this.shadow.getElementById('pulsex-chat-send');
    const chips = this.shadow.querySelectorAll('.pulsex-chip');
    const insertBtn = this.shadow.getElementById('pulsex-insert-btn');

    // Make floating button draggable
    let isDragging = false;
    let dragStartX, dragStartY, initialBtnTop, initialBtnRight;

    toggleBtn.addEventListener('mousedown', (e) => {
      isDragging = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = toggleBtn.getBoundingClientRect();
      initialBtnTop = rect.top;
      initialBtnRight = window.innerWidth - rect.right;

      const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - dragStartX;
        const deltaY = moveEvent.clientY - dragStartY;
        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
          isDragging = true;
          const newRight = Math.max(10, Math.min(window.innerWidth - 60, initialBtnRight - deltaX));
          const newTop = Math.max(10, Math.min(window.innerHeight - 60, initialBtnTop + deltaY));
          toggleBtn.style.right = `${newRight}px`;
          toggleBtn.style.top = `${newTop}px`;
          toggleBtn.style.bottom = 'auto';
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    const openDrawer = () => {
      this.isOpen = true;
      drawer.classList.add('open');

      // Refresh tweet context
      this.activeTweetContext = this.detectActiveTweet();
      contextText.textContent = this.activeTweetContext.author
        ? `@${this.activeTweetContext.author}: "${this.activeTweetContext.text.slice(0, 140)}..."`
        : 'No tweet focused';
    };

    const closeDrawer = () => {
      this.isOpen = false;
      drawer.classList.remove('open');
    };

    toggleBtn.addEventListener('click', (e) => {
      if (isDragging) return;
      this.isOpen ? closeDrawer() : openDrawer();
    });

    closeBtn.addEventListener('click', closeDrawer);

    const appendMessage = (role, text) => {
      const msgEl = document.createElement('div');
      msgEl.className = `pulsex-msg pulsex-msg-${role}`;
      msgEl.textContent = text;
      chatMessages.appendChild(msgEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const sendUserMessage = (userText) => {
      if (!userText || !userText.trim()) return;

      appendMessage('user', userText.trim());
      this.chatHistory.push({ role: 'user', content: userText.trim() });
      chatInput.value = '';

      // Spinner assistant placeholder
      const loadingEl = document.createElement('div');
      loadingEl.className = 'pulsex-msg pulsex-msg-assistant';
      loadingEl.innerHTML = '<span class="pulsex-spinner"></span> <span>Thinking...</span>';
      chatMessages.appendChild(loadingEl);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'COPILOT_CHAT',
          payload: {
            tweetContext: this.activeTweetContext,
            history: this.chatHistory
          }
        }, (res) => {
          loadingEl.remove();
          if (res && res.success && res.reply) {
            this.latestAssistantReply = res.reply;
            this.chatHistory.push({ role: 'assistant', content: res.reply });
            appendMessage('assistant', res.reply);
          } else {
            const err = res?.error || 'Unable to connect to DeepSeek API. Check your API key in PulseX settings.';
            appendMessage('assistant', `⚠️ ${err}`);
          }
        });
      }
    };

    chatSend.addEventListener('click', () => {
      sendUserMessage(chatInput.value);
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage(chatInput.value);
      }
    });

    // Preset chips
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        if (prompt) sendUserMessage(prompt);
      });
    });

    // Insert Latest Reply into active Twitter editor
    insertBtn.addEventListener('click', () => {
      if (!this.latestAssistantReply) {
        alert('No reply generated yet! Ask Copilot for a suggestion first.');
        return;
      }

      // Find active compose textarea
      const textareas = document.querySelectorAll('[data-testid="tweetTextarea_0"], [data-testid="tweetTextarea_0_label"] [role="textbox"]');
      if (textareas.length > 0) {
        const editor = textareas[0].getAttribute('role') === 'textbox' ? textareas[0] : textareas[0].querySelector('[role="textbox"]') || textareas[0];
        insertTextIntoTwitterEditor(editor, this.latestAssistantReply);
        closeDrawer();
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(this.latestAssistantReply);
        insertBtn.innerHTML = '<span>✅ Copied to clipboard!</span>';
        setTimeout(() => {
          insertBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Insert Latest Reply into Tweet
          `;
        }, 2000);
      }
    });
  }
}
