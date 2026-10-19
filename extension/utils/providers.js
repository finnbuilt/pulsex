/**
 * PulseX - Multi-Provider BYOK (Bring Your Own Key) Engine
 * Supported Providers: DeepSeek, OpenAI, Anthropic Claude, Google Gemini, Groq, OpenRouter, Custom/Ollama
 */

export const PROVIDERS = {
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    badge: 'V3 / R1',
    endpoint: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', name: 'deepseek-chat (V3 - Fast & Conversational)' },
      { id: 'deepseek-reasoner', name: 'deepseek-reasoner (R1 - Deep Thinking & Nuance)' }
    ],
    apiKeyHelpUrl: 'https://platform.deepseek.com/api_keys',
    apiKeyPlaceholder: 'sk-...',
    requiresKey: true,
    validateKey(key) {
      if (!key || typeof key !== 'string') return { valid: false, error: 'DeepSeek API key is required' };
      const trimmed = key.trim();
      if (!trimmed.startsWith('sk-') || trimmed.length < 20) {
        return { valid: false, error: 'Invalid DeepSeek key format. Must start with sk-' };
      }
      return { valid: true, error: null };
    },
    buildRequest({ apiKey, model, messages, max_tokens, temperature }) {
      const isReasoner = model === 'deepseek-reasoner';
      const body = {
        model,
        messages,
        max_tokens: isReasoner ? 2048 : max_tokens
      };
      if (!isReasoner && temperature !== undefined) {
        body.temperature = temperature;
      }
      return {
        url: 'https://api.deepseek.com/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(body),
        timeoutMs: isReasoner ? 90000 : 45000
      };
    },
    parseResponse(json) {
      const choice = json?.choices?.[0];
      return choice?.message?.content || choice?.message?.reasoning_content || '';
    }
  },

  openai: {
    id: 'openai',
    name: 'OpenAI',
    badge: 'GPT-4o / o3',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', name: 'gpt-4o-mini (Fast, Low Cost & Smart)' },
      { id: 'gpt-4o', name: 'gpt-4o (Flagship Omni Model)' },
      { id: 'o3-mini', name: 'o3-mini (High-Speed Reasoning)' },
      { id: 'gpt-4-turbo', name: 'gpt-4-turbo (Comprehensive)' }
    ],
    apiKeyHelpUrl: 'https://platform.openai.com/api-keys',
    apiKeyPlaceholder: 'sk-proj-... or sk-...',
    requiresKey: true,
    validateKey(key) {
      if (!key || typeof key !== 'string') return { valid: false, error: 'OpenAI API key is required' };
      const trimmed = key.trim();
      if (!trimmed.startsWith('sk-') || trimmed.length < 20) {
        return { valid: false, error: 'Invalid OpenAI key format. Must start with sk-' };
      }
      return { valid: true, error: null };
    },
    buildRequest({ apiKey, model, messages, max_tokens, temperature }) {
      const isReasoning = model.startsWith('o');
      const body = {
        model,
        messages,
        max_tokens
      };
      if (!isReasoning && temperature !== undefined) {
        body.temperature = temperature;
      }
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(body),
        timeoutMs: 45000
      };
    },
    parseResponse(json) {
      return json?.choices?.[0]?.message?.content || '';
    }
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Claude 3.5 / 3.7',
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-haiku-20241022',
    models: [
      { id: 'claude-3-5-haiku-20241022', name: 'claude-3-5-haiku (Lightning-Fast & Punchy)' },
      { id: 'claude-3-5-sonnet-20241022', name: 'claude-3-5-sonnet (Highest Quality Writing)' },
      { id: 'claude-3-7-sonnet-20250219', name: 'claude-3-7-sonnet (Hybrid Reasoning)' }
    ],
    apiKeyHelpUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyPlaceholder: 'sk-ant-...',
    requiresKey: true,
    validateKey(key) {
      if (!key || typeof key !== 'string') return { valid: false, error: 'Anthropic API key is required' };
      const trimmed = key.trim();
      if (!trimmed.startsWith('sk-ant-') || trimmed.length < 20) {
        return { valid: false, error: 'Invalid Claude key format. Must start with sk-ant-' };
      }
      return { valid: true, error: null };
    },
    buildRequest({ apiKey, model, messages, max_tokens, temperature }) {
      // Split system message and dialogue messages for Anthropic API
      let systemPrompt = '';
      const dialogueMessages = [];

      for (const m of messages) {
        if (m.role === 'system') {
          systemPrompt += (systemPrompt ? '\n\n' : '') + m.content;
        } else {
          dialogueMessages.push({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          });
        }
      }

      if (dialogueMessages.length === 0) {
        dialogueMessages.push({ role: 'user', content: 'Hello' });
      }

      const body = {
        model,
        max_tokens: max_tokens || 350,
        messages: dialogueMessages
      };
      if (systemPrompt) body.system = systemPrompt;
      if (temperature !== undefined) body.temperature = Math.min(1.0, temperature);

      return {
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify(body),
        timeoutMs: 45000
      };
    },
    parseResponse(json) {
      if (Array.isArray(json?.content)) {
        const textBlock = json.content.find(b => b.type === 'text');
        return textBlock ? textBlock.text : (json.content[0]?.text || '');
      }
      return '';
    }
  },

  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Gemini 2.0 Flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    defaultModel: 'gemini-2.0-flash',
    models: [
      { id: 'gemini-2.0-flash', name: 'gemini-2.0-flash (Next-Gen Ultra Fast)' },
      { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash (Fast & Efficient)' },
      { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro (Deep Multimodal & Nuance)' }
    ],
    apiKeyHelpUrl: 'https://aistudio.google.com/app/apikey',
    apiKeyPlaceholder: 'AIzaSy...',
    requiresKey: true,
    validateKey(key) {
      if (!key || typeof key !== 'string') return { valid: false, error: 'Gemini API key is required' };
      const trimmed = key.trim();
      if (!trimmed.startsWith('AIza') && trimmed.length < 20) {
        return { valid: false, error: 'Invalid Gemini key format. Typically starts with AIza' };
      }
      return { valid: true, error: null };
    },
    buildRequest({ apiKey, model, messages, max_tokens, temperature }) {
      const body = {
        model,
        messages,
        max_tokens
      };
      if (temperature !== undefined) body.temperature = temperature;

      return {
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(body),
        timeoutMs: 45000
      };
    },
    parseResponse(json) {
      return json?.choices?.[0]?.message?.content || '';
    }
  },

  groq: {
    id: 'groq',
    name: 'Groq (Ultra-Fast Llama)',
    badge: '500+ tok/s',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b-versatile',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'llama-3.3-70b-versatile (Highest Intelligence)' },
      { id: 'llama-3.1-8b-instant', name: 'llama-3.1-8b-instant (Sub-second Instant)' },
      { id: 'mixtral-8x7b-32768', name: 'mixtral-8x7b-32768 (High-Speed MoE)' }
    ],
    apiKeyHelpUrl: 'https://console.groq.com/keys',
    apiKeyPlaceholder: 'gsk_...',
    requiresKey: true,
    validateKey(key) {
      if (!key || typeof key !== 'string') return { valid: false, error: 'Groq API key is required' };
      const trimmed = key.trim();
      if (!trimmed.startsWith('gsk_') || trimmed.length < 20) {
        return { valid: false, error: 'Invalid Groq key format. Must start with gsk_' };
      }
      return { valid: true, error: null };
    },
    buildRequest({ apiKey, model, messages, max_tokens, temperature }) {
      const body = {
        model,
        messages,
        max_tokens
      };
      if (temperature !== undefined) body.temperature = temperature;

      return {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`
        },
        body: JSON.stringify(body),
        timeoutMs: 30000
      };
    },
    parseResponse(json) {
      return json?.choices?.[0]?.message?.content || '';
    }
  },

  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter (All Models)',
    badge: 'Universal Hub',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'deepseek/deepseek-chat',
    models: [
      { id: 'deepseek/deepseek-chat', name: 'deepseek/deepseek-chat (DeepSeek V3)' },
      { id: 'deepseek/deepseek-r1', name: 'deepseek/deepseek-r1 (DeepSeek R1)' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'anthropic/claude-3.5-sonnet' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'meta-llama/llama-3.3-70b-instruct' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'google/gemini-2.0-flash-exp:free (Free Tier)' }
    ],
    apiKeyHelpUrl: 'https://openrouter.ai/keys',
    apiKeyPlaceholder: 'sk-or-v1-...',
    requiresKey: true,
    validateKey(key) {
      if (!key || typeof key !== 'string') return { valid: false, error: 'OpenRouter API key is required' };
      const trimmed = key.trim();
      if (!trimmed.startsWith('sk-or-') && trimmed.length < 20) {
        return { valid: false, error: 'Invalid OpenRouter key format. Starts with sk-or-' };
      }
      return { valid: true, error: null };
    },
    buildRequest({ apiKey, model, messages, max_tokens, temperature }) {
      const body = {
        model,
        messages,
        max_tokens
      };
      if (temperature !== undefined) body.temperature = temperature;

      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey.trim()}`,
          'HTTP-Referer': 'https://pulsex.dev',
          'X-Title': 'PulseX'
        },
        body: JSON.stringify(body),
        timeoutMs: 60000
      };
    },
    parseResponse(json) {
      return json?.choices?.[0]?.message?.content || '';
    }
  },

  custom: {
    id: 'custom',
    name: 'Custom / Local (Ollama, LM Studio)',
    badge: 'Local / Self-Hosted',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    defaultModel: 'llama3.2',
    models: [
      { id: 'llama3.2', name: 'llama3.2 (Ollama Default)' },
      { id: 'mistral', name: 'mistral (Ollama)' },
      { id: 'qwen2.5-coder', name: 'qwen2.5-coder (Ollama)' },
      { id: 'custom_model', name: 'Custom Model (Specified below)' }
    ],
    apiKeyHelpUrl: '',
    apiKeyPlaceholder: 'Optional (leave blank for local Ollama)',
    requiresKey: false,
    validateKey(key) {
      // Local models do not require an API key
      return { valid: true, error: null };
    },
    buildRequest({ apiKey, model, messages, max_tokens, temperature, customEndpoint, customModel }) {
      const resolvedUrl = (customEndpoint && customEndpoint.trim()) ? customEndpoint.trim() : 'http://localhost:11434/v1/chat/completions';
      const resolvedModel = (model === 'custom_model' && customModel && customModel.trim()) ? customModel.trim() : model;

      const headers = { 'Content-Type': 'application/json' };
      if (apiKey && apiKey.trim()) {
        headers['Authorization'] = `Bearer ${apiKey.trim()}`;
      }

      const body = {
        model: resolvedModel,
        messages,
        max_tokens
      };
      if (temperature !== undefined) body.temperature = temperature;

      return {
        url: resolvedUrl,
        headers,
        body: JSON.stringify(body),
        timeoutMs: 60000
      };
    },
    parseResponse(json) {
      return json?.choices?.[0]?.message?.content || '';
    }
  }
};

export const DEFAULT_PROVIDER = 'deepseek';

export function getProvider(providerId = DEFAULT_PROVIDER) {
  return PROVIDERS[providerId] || PROVIDERS.deepseek;
}
