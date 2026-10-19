import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROVIDERS, getProvider } from '../extension/utils/providers.js';
import { handleMessagePayload } from '../extension/utils/message-handler.js';
import { validateSettingsPayload } from '../extension/popup/popup-logic.js';
import { parseDeepSeekResponse } from '../extension/utils/deepseek.js';

test('PROVIDERS contains all popular BYOK options', () => {
  const providerIds = Object.keys(PROVIDERS);
  assert.ok(providerIds.includes('deepseek'));
  assert.ok(providerIds.includes('openai'));
  assert.ok(providerIds.includes('anthropic'));
  assert.ok(providerIds.includes('gemini'));
  assert.ok(providerIds.includes('groq'));
  assert.ok(providerIds.includes('openrouter'));
  assert.ok(providerIds.includes('custom'));
});

test('OpenAI provider validates keys and formats standard chat completions request', () => {
  const openai = getProvider('openai');
  assert.equal(openai.validateKey('').valid, false);
  assert.equal(openai.validateKey('sk-123456789012345678901234').valid, true);

  const req = openai.buildRequest({
    apiKey: 'sk-123456789012345678901234',
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: 'You are an assistant' }, { role: 'user', content: 'Hi' }],
    max_tokens: 150,
    temperature: 0.7
  });

  assert.equal(req.url, 'https://api.openai.com/v1/chat/completions');
  assert.equal(req.headers['Authorization'], 'Bearer sk-123456789012345678901234');
  const body = JSON.parse(req.body);
  assert.equal(body.model, 'gpt-4o-mini');
  assert.equal(body.messages.length, 2);
  assert.equal(body.temperature, 0.7);
});

test('Anthropic provider formats messages API with separate system prompt', () => {
  const claude = getProvider('anthropic');
  assert.equal(claude.validateKey('').valid, false);
  assert.equal(claude.validateKey('invalid-key').valid, false);
  assert.equal(claude.validateKey('sk-ant-12345678901234567890').valid, true);

  const req = claude.buildRequest({
    apiKey: 'sk-ant-12345678901234567890',
    model: 'claude-3-5-sonnet-20241022',
    messages: [
      { role: 'system', content: 'System instruction here' },
      { role: 'user', content: 'Hello Claude' }
    ],
    max_tokens: 300,
    temperature: 0.5
  });

  assert.equal(req.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(req.headers['x-api-key'], 'sk-ant-12345678901234567890');
  assert.equal(req.headers['anthropic-version'], '2023-06-01');

  const body = JSON.parse(req.body);
  assert.equal(body.system, 'System instruction here');
  assert.equal(body.messages.length, 1);
  assert.equal(body.messages[0].role, 'user');
  assert.equal(body.messages[0].content, 'Hello Claude');
});

test('Anthropic response parser parses content block array', () => {
  const anthropicResponse = {
    content: [{ type: 'text', text: 'This is Claude speaking directly and clearly.' }]
  };
  const parsed = parseDeepSeekResponse(anthropicResponse, 'anthropic');
  assert.equal(parsed, 'This is Claude speaking directly and clearly.');
});

test('Gemini and Groq providers build valid requests and validate keys', () => {
  const gemini = getProvider('gemini');
  assert.equal(gemini.validateKey('AIzaSy1234567890123456').valid, true);
  const geminiReq = gemini.buildRequest({
    apiKey: 'AIzaSy1234567890123456',
    model: 'gemini-2.0-flash',
    messages: [{ role: 'user', content: 'Hi' }]
  });
  assert.ok(geminiReq.url.includes('generativelanguage.googleapis.com'));

  const groq = getProvider('groq');
  assert.equal(groq.validateKey('gsk_123456789012345678901234').valid, true);
  const groqReq = groq.buildRequest({
    apiKey: 'gsk_123456789012345678901234',
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: 'Hi' }]
  });
  assert.ok(groqReq.url.includes('api.groq.com'));
});

test('Custom/Local provider allows blank keys and routes to local endpoint', () => {
  const custom = getProvider('custom');
  assert.equal(custom.validateKey('').valid, true); // No key needed for local Ollama

  const req = custom.buildRequest({
    apiKey: '',
    model: 'llama3.2',
    messages: [{ role: 'user', content: 'Hi' }],
    customEndpoint: 'http://localhost:11434/v1/chat/completions'
  });

  assert.equal(req.url, 'http://localhost:11434/v1/chat/completions');
  const body = JSON.parse(req.body);
  assert.equal(body.model, 'llama3.2');
  assert.equal(req.headers['Authorization'], undefined);
});

test('handleMessagePayload dispatches to selected provider via BYOK', async () => {
  let capturedUrl = null;
  let capturedHeaders = null;

  const mockFetcher = async (url, options) => {
    capturedUrl = url;
    capturedHeaders = options.headers;
    return {
      content: [{ type: 'text', text: 'Anthropic reply generated.' }]
    };
  };

  const result = await handleMessagePayload(
    {
      action: 'GENERATE_REPLY',
      payload: {
        tweetText: 'Building in public is high leverage.',
        tweetAuthor: 'techlead',
        provider: 'anthropic',
        apiKey: 'sk-ant-testkey123456789012345',
        model: 'claude-3-5-sonnet-20241022'
      }
    },
    {
      getSettings: async () => ({ provider: 'anthropic' }),
      fetcher: mockFetcher
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.reply, 'Anthropic reply generated.');
  assert.equal(capturedUrl, 'https://api.anthropic.com/v1/messages');
  assert.equal(capturedHeaders['x-api-key'], 'sk-ant-testkey123456789012345');
});

test('validateSettingsPayload supports all provider options', () => {
  // 1. OpenAI validation
  const validOpenAI = validateSettingsPayload({
    provider: 'openai',
    apiKey: 'sk-proj-12345678901234567890',
    model: 'gpt-4o'
  });
  assert.equal(validOpenAI.valid, true);

  // 2. Claude validation
  const validClaude = validateSettingsPayload({
    provider: 'anthropic',
    apiKey: 'sk-ant-12345678901234567890',
    model: 'claude-3-5-haiku-20241022'
  });
  assert.equal(validClaude.valid, true);

  // 3. Custom Ollama validation with no key
  const validCustom = validateSettingsPayload({
    provider: 'custom',
    apiKey: '',
    model: 'llama3.2',
    customEndpoint: 'http://localhost:11434/v1/chat/completions'
  });
  assert.equal(validCustom.valid, true);

  // 4. Custom Ollama with invalid endpoint URL
  const invalidEndpoint = validateSettingsPayload({
    provider: 'custom',
    apiKey: '',
    model: 'llama3.2',
    customEndpoint: 'ftp://invalid-url'
  });
  assert.equal(invalidEndpoint.valid, false);
  assert.match(invalidEndpoint.error, /endpoint must start with http/i);
});
