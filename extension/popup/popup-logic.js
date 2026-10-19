/**
 * PulseX - Popup Settings Validation & Helpers
 * Supports Multi-Provider BYOK: DeepSeek, OpenAI, Claude, Gemini, Groq, OpenRouter, and Local/Custom
 */

import { PROVIDERS, getProvider, DEFAULT_PROVIDER } from '../utils/providers.js';

export { PROVIDERS, getProvider, DEFAULT_PROVIDER };

// Flattened list of all known provider models for backward-compatibility
export const ALLOWED_MODELS = Object.values(PROVIDERS).flatMap(p => p.models.map(m => m.id));

export const ALLOWED_LENGTHS = ['short', 'standard', 'detailed'];
export const ALLOWED_PERSONA_PRESETS = [
  'custom',
  'tech_founder',
  'growth_marketer',
  'deep_thinker',
  'contrarian',
  'supportive'
];

export function validateSettingsPayload({
  provider = DEFAULT_PROVIDER,
  apiKey = '',
  model = '',
  persona = '',
  length = 'standard',
  personaPreset = 'custom',
  customEndpoint = '',
  customModel = ''
}) {
  const targetProvider = getProvider(provider);
  if (!targetProvider) {
    return { valid: false, error: `Unsupported provider: ${provider}` };
  }

  // 1. API Key validation (only if provider requires a key)
  if (targetProvider.requiresKey) {
    const keyValidation = targetProvider.validateKey(apiKey);
    if (!keyValidation.valid) {
      return keyValidation;
    }
  }

  // 2. Model validation
  if (model) {
    const validModelIds = targetProvider.models.map(m => m.id);
    if (provider === 'custom') {
      // In custom/local mode, any model string or predefined option is accepted
      if (model === 'custom_model' && (!customModel || !customModel.trim())) {
        return { valid: false, error: 'Please enter a custom model name (e.g. llama3.2)' };
      }
    } else if (!validModelIds.includes(model)) {
      return {
        valid: false,
        error: `Unsupported model: ${model}. Available for ${targetProvider.name}: ${validModelIds.join(', ')}.`
      };
    }
  }

  // 3. Custom endpoint validation
  if (provider === 'custom' && customEndpoint) {
    const trimmed = customEndpoint.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { valid: false, error: 'Custom API endpoint must start with http:// or https://' };
    }
  }

  // 4. Length validation
  if (length && !ALLOWED_LENGTHS.includes(length)) {
    return { valid: false, error: `Unsupported length: ${length}. Choose short, standard, or detailed.` };
  }

  // 5. Persona Preset validation
  if (personaPreset && !ALLOWED_PERSONA_PRESETS.includes(personaPreset)) {
    return { valid: false, error: `Unsupported persona preset: ${personaPreset}.` };
  }

  return { valid: true, error: null };
}
