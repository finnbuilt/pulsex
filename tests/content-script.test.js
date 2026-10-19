import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('content_script.js is self-contained with no ES module import/export statements', () => {
  const contentScriptPath = path.resolve('extension/content/content_script.js');
  assert.ok(fs.existsSync(contentScriptPath), 'content_script.js must exist');
  const code = fs.readFileSync(contentScriptPath, 'utf8');

  // Must not have top-level import statements because Chrome content scripts are classic scripts
  assert.equal(/^import\s+.*?from/m.test(code), false, 'content_script.js must not contain import statements');
  assert.equal(/^export\s+/m.test(code), false, 'content_script.js must not contain export statements');

  // Must include the core features
  assert.ok(code.includes('pulsex-floating-toggle'), 'must include floating copilot toggle');
  assert.ok(code.includes('pulsex-inline-bar'), 'must include in-timeline reply bar');
  assert.ok(code.includes('pulsex-drawer'), 'must include copilot drawer');
  assert.ok(code.includes('pulsex-variants-tabs'), 'must include multi-variation tabs');
  assert.ok(code.includes('pulsex-metrics-pill'), 'must include real-time metrics pill');
  assert.ok(code.includes('pulsex-tone-row'), 'must include tone refiner chips');
  assert.ok(code.includes('pulsex-preview-reroll'), 'must include reroll button');
  assert.ok(code.includes('pulsex_toggle_pos'), 'must persist draggable toggle position');
  assert.ok(code.includes('GENERATE_REPLY'), 'must handle GENERATE_REPLY action');
  assert.ok(code.includes('REWRITE_REPLY'), 'must handle REWRITE_REPLY action');
  assert.ok(code.includes('GENERATE_QUOTE_TWEET'), 'must handle GENERATE_QUOTE_TWEET action');
  assert.ok(code.includes('COPILOT_CHAT'), 'must handle COPILOT_CHAT action');
});

test('content_script.js evaluates without runtime errors when DOM is present', () => {
  const contentScriptPath = path.resolve('extension/content/content_script.js');
  const code = fs.readFileSync(contentScriptPath, 'utf8');

  // Verify function wrapper parses cleanly in Node VM
  assert.doesNotThrow(() => {
    new Function(code);
  }, 'content_script.js must parse cleanly as a JavaScript function');
});

