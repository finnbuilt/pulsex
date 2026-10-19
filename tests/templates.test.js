import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  renderInlineBarTemplate,
  renderCopilotDrawerTemplate,
  getShadowStyles,
  renderApiKeyMissingCard
} from '../extension/content/shadow-templates.js';

test('renderInlineBarTemplate includes 5 angle buttons and raw thoughts input', () => {
  const html = renderInlineBarTemplate();
  assert.ok(html.includes('data-angle="agree"'), 'must include agree angle');
  assert.ok(html.includes('data-angle="counter"'), 'must include counter angle');
  assert.ok(html.includes('data-angle="insight"'), 'must include insight angle');
  assert.ok(html.includes('data-angle="witty"'), 'must include witty angle');
  assert.ok(html.includes('data-angle="question"'), 'must include question angle');
  assert.ok(html.includes('pulsex-raw-input'), 'must include raw thoughts input');
  assert.ok(html.includes('pulsex-brand'), 'must include brand badge');
});

test('renderCopilotDrawerTemplate includes drawer container, header, chat body and insert action', () => {
  const html = renderCopilotDrawerTemplate();
  assert.ok(html.includes('pulsex-drawer'), 'must include drawer container');
  assert.ok(html.includes('pulsex-copilot-header'), 'must include header');
  assert.ok(html.includes('pulsex-chat-messages'), 'must include chat messages box');
  assert.ok(html.includes('pulsex-chat-input'), 'must include chat textarea');
  assert.ok(html.includes('pulsex-insert-btn'), 'must include insert button');
  assert.ok(html.includes('pulsex-floating-toggle'), 'must include floating toggle button');
});

test('getShadowStyles returns valid CSS with obsidian emerald cyber palette', () => {
  const css = getShadowStyles();
  assert.ok(css.includes('#10b981'), 'must include emerald hex');
  assert.ok(css.includes('#06b6d4'), 'must include cyan hex');
  assert.ok(css.includes('backdrop-filter'), 'must include glassmorphism blur');
  assert.ok(css.includes('.pulsex-btn'), 'must style pulse buttons');
});

test('renderApiKeyMissingCard renders beautiful multi-provider setup card with settings action', () => {
  const card = renderApiKeyMissingCard('DeepSeek');
  assert.ok(card.includes('px-api-setup-card'), 'must have setup card container');
  assert.ok(card.includes('Connect AI Provider'), 'must have connect header');
  assert.ok(card.includes('px-setup-pill'), 'must include provider pill');
  assert.ok(card.includes('DeepSeek &bull; BYOK'), 'must show provider name and BYOK');
  assert.ok(card.includes('px-provider-chips'), 'must display multi-provider chips');
  assert.ok(card.includes('active-chip'), 'must highlight active provider chip');
  assert.ok(card.includes('Open PulseX Settings'), 'must have open settings action button');
  assert.ok(card.includes('px-open-settings-action'), 'must have settings button id');
});
