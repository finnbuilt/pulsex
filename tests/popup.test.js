import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSettingsPayload } from '../extension/popup/popup-logic.js';

test('validateSettingsPayload checks valid API key format and known models', () => {
  const valid = validateSettingsPayload({
    apiKey: 'sk-1234567890abcdef1234567890abcdef',
    model: 'deepseek-chat',
    persona: 'Founder'
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.error, null);
});

test('validateSettingsPayload rejects empty key', () => {
  const res = validateSettingsPayload({ apiKey: '', model: 'deepseek-chat' });
  assert.equal(res.valid, false);
  assert.match(res.error, /key is required/i);
});

test('validateSettingsPayload rejects invalid model', () => {
  const res = validateSettingsPayload({
    apiKey: 'sk-1234567890abcdef1234567890abcdef',
    model: 'unsupported-model'
  });
  assert.equal(res.valid, false);
  assert.match(res.error, /unsupported model/i);
});

test('validateSettingsPayload validates length target and persona preset', () => {
  const valid = validateSettingsPayload({
    apiKey: 'sk-1234567890abcdef1234567890abcdef',
    model: 'deepseek-chat',
    length: 'short',
    personaPreset: 'tech_founder'
  });
  assert.equal(valid.valid, true);

  const invalidLength = validateSettingsPayload({
    apiKey: 'sk-1234567890abcdef1234567890abcdef',
    length: 'novel'
  });
  assert.equal(invalidLength.valid, false);
  assert.match(invalidLength.error, /unsupported length/i);

  const invalidPreset = validateSettingsPayload({
    apiKey: 'sk-1234567890abcdef1234567890abcdef',
    personaPreset: 'alien_voice'
  });
  assert.equal(invalidPreset.valid, false);
  assert.match(invalidPreset.error, /unsupported persona preset/i);
});

