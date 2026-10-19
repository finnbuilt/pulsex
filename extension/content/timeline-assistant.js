/**
 * PulseX - In-Timeline Reply Assistant
 * Attaches Obsidian Emerald toolbar above active X compose boxes using Shadow DOM.
 */

import { getShadowStyles, renderInlineBarTemplate } from './shadow-templates.js';
import { findParentTweetForComposer, insertTextIntoTwitterEditor } from '../utils/x-dom-helpers.js';

export class TimelineAssistant {
  constructor() {
    this.attachedComposers = new WeakSet();
  }

  scanAndAttach(root = document) {
    if (!root || !root.querySelectorAll) return;

    // Find all active tweet reply textareas
    const textareas = root.querySelectorAll('[data-testid="tweetTextarea_0"], [data-testid="tweetTextarea_0_label"] [role="textbox"]');

    for (const textarea of textareas) {
      const editor = textarea.getAttribute('role') === 'textbox' ? textarea : textarea.querySelector('[role="textbox"]') || textarea;
      if (this.attachedComposers.has(editor)) continue;

      this.attachToolbarToComposer(editor);
    }
  }

  attachToolbarToComposer(editorEl) {
    const containerWrapper = editorEl.closest('[data-testid="tweetTextarea_0_label"]') || editorEl.parentElement;
    if (!containerWrapper || containerWrapper.querySelector('.pulsex-inline-container')) return;

    this.attachedComposers.add(editorEl);

    // Create host element for Shadow DOM
    const hostEl = document.createElement('div');
    hostEl.className = 'pulsex-inline-container';

    const shadow = hostEl.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>${getShadowStyles()}</style>
      ${renderInlineBarTemplate()}
    `;

    // Insert toolbar right before the textarea
    containerWrapper.parentNode.insertBefore(hostEl, containerWrapper);

    this.bindToolbarEvents(shadow, editorEl);
  }

  bindToolbarEvents(shadow, editorEl) {
    const rawInput = shadow.querySelector('.pulsex-raw-input');
    const generateBtn = shadow.querySelector('.pulsex-btn-generate');
    const angleBtns = shadow.querySelectorAll('.pulsex-angles-strip .pulsex-btn');
    const previewBox = shadow.querySelector('.pulsex-preview-box');
    const previewText = shadow.querySelector('.pulsex-preview-text');
    const discardBtn = shadow.querySelector('.pulsex-btn-discard');
    const insertBtn = shadow.querySelector('.pulsex-btn-insert');

    let selectedAngle = 'insight';
    let latestGeneratedReply = '';

    // Handle angle selections
    angleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        angleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedAngle = btn.dataset.angle;

        // Auto-generate on angle click if user already typed raw thoughts or wants immediate angle generation
        triggerGeneration();
      });
    });

    const triggerGeneration = () => {
      const parentTweet = findParentTweetForComposer(editorEl);
      const rawThought = rawInput.value.trim();

      // Visual loading state
      generateBtn.innerHTML = '<span class="pulsex-spinner"></span> <span>Crafting...</span>';
      generateBtn.disabled = true;

      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({
          action: 'GENERATE_REPLY',
          payload: {
            tweetText: parentTweet?.text || '',
            tweetAuthor: parentTweet?.author || 'creator',
            angle: selectedAngle,
            rawThought
          }
        }, (response) => {
          generateBtn.innerHTML = '<span>Generate</span>';
          generateBtn.disabled = false;

          if (response && response.success && response.reply) {
            latestGeneratedReply = response.reply;
            previewText.textContent = response.reply;
            previewBox.style.display = 'block';
          } else {
            const err = response?.error || 'Failed to generate reply. Check your DeepSeek API key in PulseX settings.';
            previewText.innerHTML = `<span style="color: #f87171;">⚠️ ${err}</span>`;
            previewBox.style.display = 'block';
          }
        });
      }
    };

    generateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerGeneration();
    });

    rawInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerGeneration();
      }
    });

    discardBtn.addEventListener('click', () => {
      previewBox.style.display = 'none';
      latestGeneratedReply = '';
    });

    insertBtn.addEventListener('click', () => {
      if (latestGeneratedReply) {
        insertTextIntoTwitterEditor(editorEl, latestGeneratedReply);
        previewBox.style.display = 'none';
      }
    });
  }
}
