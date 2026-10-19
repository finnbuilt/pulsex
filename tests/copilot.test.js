import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCopilotHistory } from '../extension/content/copilot-drawer.js';

test('formatCopilotHistory structures conversation with tweet context as system reference', () => {
  const history = [
    { role: 'user', content: 'Make it sound more witty' },
    { role: 'assistant', content: 'Here is a witty version...' }
  ];
  const formatted = formatCopilotHistory({
    tweetContext: { author: 'elonmusk', text: 'Launching v1 tomorrow!' },
    persona: 'Concise tech founder',
    history
  });

  assert.equal(formatted[0].role, 'system');
  assert.ok(formatted[0].content.includes('Launching v1 tomorrow!'));
  assert.ok(formatted[0].content.includes('Concise tech founder'));
  assert.equal(formatted[1].content, 'Make it sound more witty');
  assert.equal(formatted[2].content, 'Here is a witty version...');
});
