/**
 * PulseX - Background Message Dispatcher & Multi-Provider Request Coordinator
 */

import {
  DEEPSEEK_API_URL,
  DEFAULT_MODEL,
  buildReplyPrompt,
  buildRewritePrompt,
  buildQuoteTweetPrompt,
  buildCopilotChatMessages,
  parseDeepSeekResponse,
  extractVariations,
  validateApiKeyLocally,
  getProvider,
  DEFAULT_PROVIDER
} from './deepseek.js';

export async function handleMessagePayload(message, deps = {}) {
  const { action, payload = {} } = message || {};

  const getSettings = deps.getSettings || (async () => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      return new Promise(resolve => {
        chrome.storage.local.get([
          'provider',
          'apiKey',
          'providerKeys',
          'model',
          'persona',
          'length',
          'adFilterEnabled',
          'customEndpoint',
          'customModel',
          'repliesGenerated',
          'adsFiltered'
        ], resolve);
      });
    }
    return {
      provider: DEFAULT_PROVIDER,
      apiKey: '',
      providerKeys: {},
      model: DEFAULT_MODEL,
      persona: '',
      length: 'standard',
      adFilterEnabled: true,
      customEndpoint: '',
      customModel: '',
      repliesGenerated: 0,
      adsFiltered: 0
    };
  });

  const fetcher = deps.fetcher || (async (url, options) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errText = `HTTP ${res.status}`;
      try {
        const json = await res.json();
        errText = json.error?.message || json.message || JSON.stringify(json);
      } catch (e) {
        errText = await res.text();
      }
      throw new Error(`API error (${res.status}): ${errText}`);
    }
    return res.json();
  });

  try {
    switch (action) {
      case 'VALIDATE_KEY': {
        const providerId = payload.provider || DEFAULT_PROVIDER;
        const targetProvider = getProvider(providerId);
        const keyToTest = payload.apiKey || '';

        if (targetProvider.requiresKey) {
          const validation = targetProvider.validateKey(keyToTest);
          if (!validation.valid) {
            return { success: false, error: validation.error };
          }
        }

        const startTime = Date.now();
        const reqConfig = targetProvider.buildRequest({
          apiKey: keyToTest,
          model: payload.model || targetProvider.defaultModel,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
          customEndpoint: payload.customEndpoint,
          customModel: payload.customModel
        });

        const testData = await fetcher(reqConfig.url, {
          method: 'POST',
          headers: reqConfig.headers,
          body: reqConfig.body
        });

        const latencyMs = Date.now() - startTime;
        return { success: true, valid: true, latencyMs };
      }

      case 'GENERATE_REPLY': {
        const settings = await getSettings();
        const providerId = payload.provider || settings.provider || DEFAULT_PROVIDER;
        const targetProvider = getProvider(providerId);

        const apiKey = payload.apiKey || (settings.providerKeys && settings.providerKeys[providerId]) || settings.apiKey || '';
        if (targetProvider.requiresKey && (!apiKey || !apiKey.trim())) {
          return {
            success: false,
            code: 'API_KEY_MISSING',
            provider: targetProvider.name,
            providerId: targetProvider.id,
            error: `${targetProvider.name} API key not configured. Click the PulseX extension icon to add your API key.`
          };
        }

        const model = payload.model || settings.model || targetProvider.defaultModel;
        const persona = settings.persona || '';
        const length = payload.length || settings.length || 'standard';
        const multiVariation = Boolean(payload.multiVariation);

        if (!payload.tweetText || !payload.tweetText.trim()) {
          return {
            success: false,
            error: 'No tweet text detected. Please ensure you are replying to an active tweet.'
          };
        }

        const { systemPrompt, userPrompt } = buildReplyPrompt({
          tweetText: payload.tweetText || '',
          tweetAuthor: payload.tweetAuthor || '',
          authorName: payload.authorName || '',
          isNestedReply: Boolean(payload.isNestedReply),
          rootTopic: payload.rootTopic || '',
          angle: payload.angle || 'insight',
          rawThought: payload.rawThought || '',
          persona,
          length,
          multiVariation
        });

        const messages = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ];

        const isReasoner = model === 'deepseek-reasoner' || model.startsWith('o3') || model.startsWith('o1');
        const maxTokens = isReasoner ? 2048 : (multiVariation ? 600 : 350);
        const temperature = isReasoner ? undefined : 0.7;

        const reqConfig = targetProvider.buildRequest({
          apiKey,
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          customEndpoint: settings.customEndpoint,
          customModel: settings.customModel
        });

        const timeoutMs = reqConfig.timeoutMs || 45000;
        let abortTimer = null;
        let signal;
        if (typeof AbortController !== 'undefined') {
          const controller = new AbortController();
          abortTimer = setTimeout(() => controller.abort(), timeoutMs);
          signal = controller.signal;
        }

        let data;
        try {
          data = await fetcher(reqConfig.url, {
            method: 'POST',
            signal,
            headers: reqConfig.headers,
            body: reqConfig.body
          });
        } catch (err) {
          if (err.name === 'AbortError') {
            throw new Error(`${targetProvider.name} API request timed out (${Math.round(timeoutMs / 1000)}s).`);
          }
          throw err;
        } finally {
          if (abortTimer) clearTimeout(abortTimer);
        }

        const rawReply = parseDeepSeekResponse(data, providerId);
        const variations = extractVariations(rawReply);
        const reply = variations[0] || rawReply;

        // Increment stats
        if (typeof chrome !== 'undefined' && chrome.storage?.local) {
          chrome.storage.local.get(['repliesGenerated'], (res) => {
            const count = (res?.repliesGenerated || 0) + 1;
            chrome.storage.local.set({ repliesGenerated: count });
          });
        }

        return { success: true, reply, variations };
      }

      case 'REWRITE_REPLY': {
        const settings = await getSettings();
        const providerId = payload.provider || settings.provider || DEFAULT_PROVIDER;
        const targetProvider = getProvider(providerId);

        const apiKey = payload.apiKey || (settings.providerKeys && settings.providerKeys[providerId]) || settings.apiKey || '';
        if (targetProvider.requiresKey && (!apiKey || !apiKey.trim())) {
          return {
            success: false,
            code: 'API_KEY_MISSING',
            provider: targetProvider.name,
            providerId: targetProvider.id,
            error: `${targetProvider.name} API key not configured.`
          };
        }

        const model = payload.model || settings.model || targetProvider.defaultModel;
        const { systemPrompt, userPrompt } = buildRewritePrompt({
          originalReply: payload.originalReply || '',
          mode: payload.mode || 'punchier',
          tweetText: payload.tweetText || '',
          authorName: payload.authorName || ''
        });

        const isReasoner = model === 'deepseek-reasoner' || model.startsWith('o3');
        const maxTokens = isReasoner ? 2048 : 300;
        const temperature = isReasoner ? undefined : 0.7;

        const reqConfig = targetProvider.buildRequest({
          apiKey,
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: maxTokens,
          temperature,
          customEndpoint: settings.customEndpoint,
          customModel: settings.customModel
        });

        const data = await fetcher(reqConfig.url, {
          method: 'POST',
          headers: reqConfig.headers,
          body: reqConfig.body
        });

        const reply = parseDeepSeekResponse(data, providerId);
        return { success: true, reply };
      }

      case 'GENERATE_QUOTE_TWEET': {
        const settings = await getSettings();
        const providerId = payload.provider || settings.provider || DEFAULT_PROVIDER;
        const targetProvider = getProvider(providerId);

        const apiKey = payload.apiKey || (settings.providerKeys && settings.providerKeys[providerId]) || settings.apiKey || '';
        if (targetProvider.requiresKey && (!apiKey || !apiKey.trim())) {
          return {
            success: false,
            code: 'API_KEY_MISSING',
            provider: targetProvider.name,
            providerId: targetProvider.id,
            error: `${targetProvider.name} API key not configured.`
          };
        }

        const model = payload.model || settings.model || targetProvider.defaultModel;
        const persona = settings.persona || '';

        const { systemPrompt, userPrompt } = buildQuoteTweetPrompt({
          tweetText: payload.tweetText || '',
          tweetAuthor: payload.tweetAuthor || '',
          authorName: payload.authorName || '',
          rawThought: payload.rawThought || '',
          persona
        });

        const isReasoner = model === 'deepseek-reasoner' || model.startsWith('o3');
        const maxTokens = isReasoner ? 2048 : 350;
        const temperature = isReasoner ? undefined : 0.7;

        const reqConfig = targetProvider.buildRequest({
          apiKey,
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: maxTokens,
          temperature,
          customEndpoint: settings.customEndpoint,
          customModel: settings.customModel
        });

        const data = await fetcher(reqConfig.url, {
          method: 'POST',
          headers: reqConfig.headers,
          body: reqConfig.body
        });

        const quoteTweet = parseDeepSeekResponse(data, providerId);
        return { success: true, reply: quoteTweet, quoteTweet };
      }

      case 'COPILOT_CHAT': {
        const settings = await getSettings();
        const providerId = payload.provider || settings.provider || DEFAULT_PROVIDER;
        const targetProvider = getProvider(providerId);

        const apiKey = payload.apiKey || (settings.providerKeys && settings.providerKeys[providerId]) || settings.apiKey || '';
        if (targetProvider.requiresKey && (!apiKey || !apiKey.trim())) {
          return {
            success: false,
            code: 'API_KEY_MISSING',
            provider: targetProvider.name,
            providerId: targetProvider.id,
            error: `${targetProvider.name} API key not configured. Click the PulseX extension icon to add your API key.`
          };
        }

        const model = payload.model || settings.model || targetProvider.defaultModel;
        const persona = settings.persona || '';

        const messages = buildCopilotChatMessages({
          tweetContext: payload.tweetContext || {},
          persona,
          history: payload.history || []
        });

        const isReasoner = model === 'deepseek-reasoner' || model.startsWith('o3');
        const maxTokens = isReasoner ? 2048 : 450;
        const temperature = isReasoner ? undefined : 0.7;

        const reqConfig = targetProvider.buildRequest({
          apiKey,
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          customEndpoint: settings.customEndpoint,
          customModel: settings.customModel
        });

        const timeoutMs = reqConfig.timeoutMs || 45000;
        let abortTimer = null;
        let signal;
        if (typeof AbortController !== 'undefined') {
          const controller = new AbortController();
          abortTimer = setTimeout(() => controller.abort(), timeoutMs);
          signal = controller.signal;
        }

        let data;
        try {
          data = await fetcher(reqConfig.url, {
            method: 'POST',
            signal,
            headers: reqConfig.headers,
            body: reqConfig.body
          });
        } catch (err) {
          if (err.name === 'AbortError') {
            throw new Error(`${targetProvider.name} Copilot request timed out (${Math.round(timeoutMs / 1000)}s). Please try again.`);
          }
          throw err;
        } finally {
          if (abortTimer) clearTimeout(abortTimer);
        }

        const reply = parseDeepSeekResponse(data, providerId);
        return { success: true, reply };
      }

      case 'GET_STATS': {
        const settings = await getSettings();
        const repliesGenerated = settings.repliesGenerated || 0;
        const adsFiltered = settings.adsFiltered || 0;
        return {
          success: true,
          stats: { repliesGenerated, adsFiltered },
          repliesGenerated,
          adsFiltered
        };
      }

      case 'UPDATE_BADGE_COUNT': {
        if (typeof chrome !== 'undefined' && chrome.action?.setBadgeText) {
          const count = payload.count || 0;
          chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
          chrome.action.setBadgeBackgroundColor({ color: '#10b981' });

          if (chrome.storage?.local && count > 0) {
            chrome.storage.local.get(['adsFiltered'], (res) => {
              const current = (res?.adsFiltered || 0) + count;
              chrome.storage.local.set({ adsFiltered: current });
            });
          }
        }
        return { success: true };
      }

      case 'OPEN_SETTINGS': {
        if (typeof chrome !== 'undefined') {
          if (chrome.runtime?.openOptionsPage) {
            chrome.runtime.openOptionsPage();
            return { success: true };
          }
          if (chrome.tabs?.create && chrome.runtime?.getURL) {
            chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') });
            return { success: true };
          }
        }
        return { success: true };
      }

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (err) {
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}
