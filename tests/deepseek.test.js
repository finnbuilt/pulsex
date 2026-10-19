import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReplyPrompt,
  parseDeepSeekResponse,
  buildCopilotChatMessages,
  validateApiKeyLocally,
  extractVariations,
  buildRewritePrompt,
  buildQuoteTweetPrompt
} from '../extension/utils/deepseek.js';

test('buildReplyPrompt formats appropriate system & user prompts for angle', () => {
  const prompt = buildReplyPrompt({
    tweetText: 'AI will replace entry-level developers in 2 years.',
    tweetAuthor: 'tech_guru',
    authorName: 'Alex',
    angle: 'counter',
    rawThought: 'disagree, AI augments junior devs to build faster',
    persona: 'Concise tech founder'
  });

  assert.ok(prompt.systemPrompt.includes('PulseX'));
  assert.ok(prompt.systemPrompt.includes('Alex'));
  assert.ok(prompt.systemPrompt.includes('1 to 2 short sentences'));
  assert.ok(prompt.userPrompt.includes('tech_guru'));
  assert.ok(prompt.userPrompt.includes('disagree, AI augments'));
  assert.ok(prompt.userPrompt.includes('counter'));
});

test('buildReplyPrompt differentiates nested reply and instructs answering the comment', () => {
  const prompt = buildReplyPrompt({
    tweetText: 'Does this work for solo bootstrappers without funding?',
    tweetAuthor: 'elena_dev',
    authorName: 'Elena',
    isNestedReply: true,
    rootTopic: 'Launching our new analytics platform',
    angle: 'agree'
  });

  assert.ok(prompt.userPrompt.includes('nested comment'));
  assert.ok(prompt.userPrompt.includes('Elena'));
  assert.ok(prompt.systemPrompt.includes('Directly answer'));
});

test('buildReplyPrompt handles default angles gracefully', () => {
  const angles = ['agree', 'counter', 'insight', 'witty', 'question'];
  for (const angle of angles) {
    const prompt = buildReplyPrompt({
      tweetText: 'Design matters more than code.',
      tweetAuthor: 'designer_pro',
      angle,
      rawThought: ''
    });
    assert.ok(prompt.userPrompt.includes(angle));
  }
});

test('parseDeepSeekResponse extracts cleaned content and strips quote wrapping', () => {
  const mockApiRes = {
    choices: [{ message: { content: '"I strongly disagree. AI gives juniors leverage."' } }]
  };
  const text = parseDeepSeekResponse(mockApiRes);
  assert.equal(text, 'I strongly disagree. AI gives juniors leverage.');
});

test('parseDeepSeekResponse handles empty or reasoning_content choices', () => {
  const mockWithReasoning = {
    choices: [{
      message: {
        reasoning_content: 'Let me think about how to answer.',
        content: 'Spot on analysis.'
      }
    }]
  };
  const text = parseDeepSeekResponse(mockWithReasoning);
  assert.equal(text, 'Spot on analysis.');
});

test('parseDeepSeekResponse eliminates em-dashes and transforms robotic name formulas', () => {
  const mockWithEmDash = {
    choices: [{ message: { content: 'Building is easier than ever, Shakhzod — getting noticed is the real grind now.' } }]
  };
  const text = parseDeepSeekResponse(mockWithEmDash);
  assert.equal(text.includes('—'), false, 'Em-dash must be completely eliminated');
  assert.equal(text.includes('–'), false, 'En-dash must be completely eliminated');
  assert.equal(text, 'Building is easier than ever. Getting noticed is the real grind now.');

  const mockMidSentence = {
    choices: [{ message: { content: 'Speed is good — but quality is what keeps users.' } }]
  };
  const midText = parseDeepSeekResponse(mockMidSentence);
  assert.equal(midText.includes('—'), false);
  assert.equal(midText, 'Speed is good - but quality is what keeps users.');
});


test('buildCopilotChatMessages formats multi-turn chat with tweet context and author name', () => {
  const messages = buildCopilotChatMessages({
    tweetContext: { author: 'elonmusk', authorName: 'Elon', text: 'Mars mission timeline updated.' },
    persona: 'Sharp venture capitalist',
    history: [
      { role: 'user', content: 'Give me a witty reply' },
      { role: 'assistant', content: 'Pack your sunscreen.' }
    ]
  });

  assert.equal(messages[0].role, 'system');
  assert.ok(messages[0].content.includes('Sharp venture capitalist'));
  assert.ok(messages[0].content.includes('Mars mission timeline updated.'));
  assert.ok(messages[0].content.includes('Elon'));
  assert.equal(messages[1].role, 'user');
  assert.equal(messages[1].content, 'Give me a witty reply');
  assert.equal(messages[2].role, 'assistant');
});

test('validateApiKeyLocally checks DeepSeek key format', () => {
  assert.equal(validateApiKeyLocally('sk-1234567890abcdef1234567890abcdef').valid, true);
  assert.equal(validateApiKeyLocally('').valid, false);
  assert.equal(validateApiKeyLocally('invalid-key').valid, false);
});

test('extractVariations splits multiple variations and strips whitespace', () => {
  const multiText = 'Great execution on this feature.\n---VARIATION---\nSolid progress, how is the latency holding up?';
  const variations = extractVariations(multiText);
  assert.equal(variations.length, 2);
  assert.equal(variations[0], 'Great execution on this feature.');
  assert.equal(variations[1], 'Solid progress, how is the latency holding up?');

  const singleText = 'Just one solid reply.';
  assert.deepEqual(extractVariations(singleText), ['Just one solid reply.']);
  assert.deepEqual(extractVariations(''), []);
});

test('buildRewritePrompt creates targeted prompt for punchier and shorter modes', () => {
  const punchy = buildRewritePrompt({
    originalReply: 'I think your database choice is reasonable.',
    mode: 'punchier',
    tweetText: 'Postgres vs Mongo',
    authorName: 'Sarah'
  });

  assert.ok(punchy.systemPrompt.includes('refining an existing reply'));
  assert.ok(punchy.systemPrompt.includes('Sarah'));
  assert.ok(punchy.userPrompt.includes('Postgres vs Mongo'));
  assert.ok(punchy.userPrompt.includes('sharper'));

  const shorter = buildRewritePrompt({
    originalReply: 'We had this exact same problem last year and fixed it by adding caching.',
    mode: 'shorter'
  });
  assert.ok(shorter.userPrompt.includes('ultra-concise'));
});

test('buildQuoteTweetPrompt constructs viral quote tweet prompt', () => {
  const quote = buildQuoteTweetPrompt({
    tweetText: 'Shipped 3 micro-SaaS products this month.',
    tweetAuthor: 'solomaker',
    authorName: 'David',
    rawThought: 'Speed of shipping compounds faster than feature complexity'
  });

  assert.ok(quote.systemPrompt.includes('Quote Tweet'));
  assert.ok(quote.systemPrompt.includes('commentary'));
  assert.ok(quote.userPrompt.includes('David'));
  assert.ok(quote.userPrompt.includes('solomaker'));
  assert.ok(quote.userPrompt.includes('Speed of shipping compounds'));
});

