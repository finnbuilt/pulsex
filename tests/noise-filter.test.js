import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkTweetForAdIndicators,
  checkTweetForSpamKeywords
} from '../extension/content/noise-filter.js';

test('checkTweetForAdIndicators identifies sponsored / promoted marks', () => {
  assert.equal(checkTweetForAdIndicators({ textContent: 'Check out this game! Promoted' }), true);
  assert.equal(checkTweetForAdIndicators({ textContent: 'Ad · Super fast database' }), true);
  assert.equal(checkTweetForAdIndicators({ textContent: 'Regular user talking about code' }), false);
});

test('checkTweetForAdIndicators detects multi-language promoted markers', () => {
  assert.equal(checkTweetForAdIndicators({ textContent: 'Publicidad · nueva oferta' }), true);
  assert.equal(checkTweetForAdIndicators({ textContent: 'Gesponsert von Tech' }), true);
  assert.equal(checkTweetForAdIndicators({ textContent: 'Sponsorisé par Cloud' }), true);
});

test('checkTweetForSpamKeywords detects spam giveaway and crypto signatures', () => {
  assert.equal(checkTweetForSpamKeywords('Drop your $SOL address below! 1000 USDT airdrop'), true);
  assert.equal(checkTweetForSpamKeywords('DM me to claim your free reward'), true);
  assert.equal(checkTweetForSpamKeywords('We just launched our new open-source vector database on GitHub'), false);
});
