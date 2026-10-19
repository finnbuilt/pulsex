import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleMessagePayload } from '../extension/utils/message-handler.js';

test('handleMessagePayload rejects missing API key with helpful error', async () => {
  const result = await handleMessagePayload(
    {
      action: 'GENERATE_REPLY',
      payload: { tweetText: 'Hello world' }
    },
    {
      getSettings: async () => ({ apiKey: '', model: 'deepseek-chat' }),
      fetcher: async () => { throw new Error('Should not be called'); }
    }
  );

  assert.equal(result.success, false);
  assert.match(result.error, /API key not configured/i);
});

test('handleMessagePayload successfully generates reply with mocked fetcher', async () => {
  const mockFetcher = async () => ({
    choices: [{ message: { content: 'Compelling reply to the tweet.' } }]
  });

  const result = await handleMessagePayload(
    {
      action: 'GENERATE_REPLY',
      payload: {
        tweetText: 'Startups need focus.',
        tweetAuthor: 'founder',
        angle: 'insight'
      }
    },
    {
      getSettings: async () => ({ apiKey: 'sk-test12345678901234567890', model: 'deepseek-chat' }),
      fetcher: mockFetcher
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.reply, 'Compelling reply to the tweet.');
});

test('handleMessagePayload handles copilot chat messages', async () => {
  const mockFetcher = async () => ({
    choices: [{ message: { content: 'Here is a refined version.' } }]
  });

  const result = await handleMessagePayload(
    {
      action: 'COPILOT_CHAT',
      payload: {
        tweetContext: { text: 'Ship faster!' },
        history: [{ role: 'user', content: 'Give me 3 bullet points' }]
      }
    },
    {
      getSettings: async () => ({ apiKey: 'sk-test12345678901234567890', model: 'deepseek-chat' }),
      fetcher: mockFetcher
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.reply, 'Here is a refined version.');
});

test('handleMessagePayload validates key via VALIDATE_KEY action', async () => {
  let fetchedUrl = null;
  const mockFetcher = async (url) => {
    fetchedUrl = url;
    return { choices: [{ message: { content: 'OK' } }] };
  };

  const result = await handleMessagePayload(
    {
      action: 'VALIDATE_KEY',
      payload: { apiKey: 'sk-test12345678901234567890' }
    },
    {
      getSettings: async () => ({}),
      fetcher: mockFetcher
    }
  );

  assert.equal(result.success, true);
  assert.ok(fetchedUrl);
});

test('handleMessagePayload omits temperature and sets max_tokens 2048 for deepseek-reasoner', async () => {
  let capturedBody = null;
  const mockFetcher = async (url, options) => {
    capturedBody = JSON.parse(options.body);
    return { choices: [{ message: { content: 'Logical reasoning response.' } }] };
  };

  const result = await handleMessagePayload(
    {
      action: 'GENERATE_REPLY',
      payload: { tweetText: 'Math question' }
    },
    {
      getSettings: async () => ({ apiKey: 'sk-test12345678901234567890', model: 'deepseek-reasoner' }),
      fetcher: mockFetcher
    }
  );

  assert.equal(result.success, true);
  assert.equal(capturedBody.model, 'deepseek-reasoner');
  assert.equal(capturedBody.temperature, undefined);
  assert.equal(capturedBody.max_tokens, 2048);
});

test('handleMessagePayload handles REWRITE_REPLY action', async () => {
  const mockFetcher = async () => ({
    choices: [{ message: { content: 'Punchier version.' } }]
  });

  const result = await handleMessagePayload(
    {
      action: 'REWRITE_REPLY',
      payload: {
        originalReply: 'This is a long reply.',
        mode: 'punchier',
        tweetText: 'Tech discussion'
      }
    },
    {
      getSettings: async () => ({ apiKey: 'sk-test12345678901234567890', model: 'deepseek-chat' }),
      fetcher: mockFetcher
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.reply, 'Punchier version.');
});

test('handleMessagePayload handles GENERATE_QUOTE_TWEET action', async () => {
  const mockFetcher = async () => ({
    choices: [{ message: { content: 'High signal take on shipping fast.' } }]
  });

  const result = await handleMessagePayload(
    {
      action: 'GENERATE_QUOTE_TWEET',
      payload: {
        tweetText: 'We shipped v1 today.',
        tweetAuthor: 'indiedev'
      }
    },
    {
      getSettings: async () => ({ apiKey: 'sk-test12345678901234567890', model: 'deepseek-chat' }),
      fetcher: mockFetcher
    }
  );

  assert.equal(result.success, true);
  assert.equal(result.reply, 'High signal take on shipping fast.');
});

test('handleMessagePayload handles GET_STATS action', async () => {
  const result = await handleMessagePayload(
    { action: 'GET_STATS' },
    {
      getSettings: async () => ({ apiKey: 'sk-test' }),
      fetcher: async () => ({})
    }
  );

  assert.equal(result.success, true);
  assert.ok(result.stats);
  assert.equal(typeof result.stats.repliesGenerated, 'number');
  assert.equal(typeof result.stats.adsFiltered, 'number');
});

test('handleMessagePayload rejects empty tweet text in GENERATE_REPLY', async () => {
  const result = await handleMessagePayload(
    {
      action: 'GENERATE_REPLY',
      payload: { tweetText: '   ' }
    },
    {
      getSettings: async () => ({ apiKey: 'sk-test12345678901234567890', model: 'deepseek-chat' }),
      fetcher: async () => ({ choices: [{ message: { content: 'Should not generate' } }] })
    }
  );

  assert.equal(result.success, false);
  assert.match(result.error, /no tweet text detected/i);
});



