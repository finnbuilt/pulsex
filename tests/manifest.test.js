import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('manifest.json has valid Manifest V3 schema and required permissions', () => {
  const manifestPath = path.resolve('extension/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, 'PulseX - AI Superpowers for X');
  assert.ok(manifest.permissions.includes('storage'), 'manifest must include storage permission');
  assert.ok(manifest.host_permissions.includes('https://api.deepseek.com/*'), 'manifest must have DeepSeek host permission');
  assert.ok(manifest.host_permissions.some(h => h.includes('x.com')), 'manifest must have x.com host permission');
  assert.equal(manifest.background.service_worker, 'background.js');
  assert.ok(manifest.action.default_popup, 'action popup must be configured');
  assert.ok(manifest.author.includes('Finn') && manifest.author.includes('finnbuilt'), 'manifest must state author Finn (@finnbuilt)');
});
