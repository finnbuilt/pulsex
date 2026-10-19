/**
 * PulseX - Extension Popup Controller
 * Full Multi-Provider BYOK Engine (DeepSeek, OpenAI, Claude, Gemini, Groq, OpenRouter, Custom/Ollama)
 */

import { validateSettingsPayload, PROVIDERS, getProvider, DEFAULT_PROVIDER } from './popup-logic.js';

document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('px-provider-select');
  const providerBadge = document.getElementById('px-provider-badge');
  const apiKeyGroup = document.getElementById('px-api-key-group');
  const apiKeyLabel = document.getElementById('px-api-key-label');
  const apiKeyLink = document.getElementById('px-api-key-link');
  const apiKeyInput = document.getElementById('px-api-key');
  const toggleKeyVisibilityBtn = document.getElementById('px-toggle-key-visibility');
  const customEndpointGroup = document.getElementById('px-custom-endpoint-group');
  const customEndpointInput = document.getElementById('px-custom-endpoint');
  const modelSelect = document.getElementById('px-model-select');
  const customModelGroup = document.getElementById('px-custom-model-group');
  const customModelInput = document.getElementById('px-custom-model');
  const testConnectionBtn = document.getElementById('px-test-connection-btn');
  const latencyPill = document.getElementById('px-latency-pill');
  const lengthSelect = document.getElementById('px-length-select');
  const personaPresetSelect = document.getElementById('px-persona-preset-select');
  const personaInput = document.getElementById('px-persona-input');
  const adFilterToggle = document.getElementById('px-ad-filter-toggle');
  const saveBtn = document.getElementById('px-save-settings-btn');
  const statusPill = document.getElementById('px-connection-status');
  const statusText = document.getElementById('px-status-text');
  const toast = document.getElementById('px-toast');
  const statReplies = document.getElementById('px-stat-replies');
  const statAds = document.getElementById('px-stat-ads');

  // In-memory key store to preserve keys across provider switches
  let storedProviderKeys = {};

  // Populate models dropdown based on current provider
  function syncProviderUI(providerId, selectedModel = null) {
    const provider = getProvider(providerId);

    // Update Badge
    if (providerBadge) {
      providerBadge.textContent = provider.badge || 'BYOK';
    }

    // Update API Key Label, Link, Placeholder
    if (apiKeyLabel) {
      apiKeyLabel.textContent = `${provider.name} API Key`;
    }

    if (apiKeyLink) {
      if (provider.apiKeyHelpUrl) {
        apiKeyLink.href = provider.apiKeyHelpUrl;
        apiKeyLink.style.display = 'inline';
      } else {
        apiKeyLink.style.display = 'none';
      }
    }

    if (apiKeyInput) {
      apiKeyInput.placeholder = provider.apiKeyPlaceholder || 'Enter API Key';
      // Load current key for this provider
      apiKeyInput.value = storedProviderKeys[providerId] || '';
    }

    // Toggle Custom Endpoint field
    if (customEndpointGroup) {
      customEndpointGroup.style.display = providerId === 'custom' ? 'block' : 'none';
    }

    // Re-render Models dropdown
    if (modelSelect) {
      modelSelect.innerHTML = '';
      for (const m of provider.models) {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.name;
        modelSelect.appendChild(opt);
      }

      const modelToSet = selectedModel && provider.models.some(m => m.id === selectedModel)
        ? selectedModel
        : provider.defaultModel;

      modelSelect.value = modelToSet;
      syncCustomModelUI(modelToSet);
    }
  }

  function syncCustomModelUI(modelId) {
    if (customModelGroup) {
      customModelGroup.style.display = modelId === 'custom_model' ? 'block' : 'none';
    }
  }

  // Handle Provider Change
  providerSelect.addEventListener('change', () => {
    // Save current active key before switching
    const currentProvider = providerSelect.dataset.prevProvider || DEFAULT_PROVIDER;
    storedProviderKeys[currentProvider] = apiKeyInput.value.trim();

    const newProvider = providerSelect.value;
    providerSelect.dataset.prevProvider = newProvider;
    syncProviderUI(newProvider);
    updateStatus('Changed', '');
    if (latencyPill) latencyPill.style.display = 'none';
  });

  // Handle Model Change
  modelSelect.addEventListener('change', () => {
    syncCustomModelUI(modelSelect.value);
  });

  // Load existing configuration & stats
  chrome.storage.local.get([
    'provider',
    'apiKey',
    'providerKeys',
    'model',
    'customEndpoint',
    'customModel',
    'persona',
    'length',
    'personaPreset',
    'adFilterEnabled'
  ], (data) => {
    const activeProvider = data.provider || DEFAULT_PROVIDER;
    storedProviderKeys = data.providerKeys || {};

    // Backward-compat: if legacy apiKey exists and no providerKeys, assign it to deepseek
    if (data.apiKey && !storedProviderKeys.deepseek) {
      storedProviderKeys.deepseek = data.apiKey;
    }

    if (providerSelect) {
      providerSelect.value = activeProvider;
      providerSelect.dataset.prevProvider = activeProvider;
    }

    if (customEndpointInput && data.customEndpoint) {
      customEndpointInput.value = data.customEndpoint;
    }

    if (customModelInput && data.customModel) {
      customModelInput.value = data.customModel;
    }

    syncProviderUI(activeProvider, data.model);

    if (data.length && lengthSelect) lengthSelect.value = data.length;
    if (data.personaPreset && personaPresetSelect) personaPresetSelect.value = data.personaPreset;
    if (data.persona !== undefined && personaInput) personaInput.value = data.persona;
    if (data.adFilterEnabled !== undefined && adFilterToggle) adFilterToggle.checked = data.adFilterEnabled;

    const currentKey = storedProviderKeys[activeProvider] || data.apiKey;
    if (currentKey || activeProvider === 'custom') {
      updateStatus('Ready', 'connected');
    }
  });

  // Fetch live statistics from background service worker
  try {
    chrome.runtime.sendMessage({ action: 'GET_STATS' }, (res) => {
      if (res && res.success && res.stats) {
        if (statReplies) statReplies.textContent = res.stats.repliesGenerated || 0;
        if (statAds) statAds.textContent = res.stats.adsFiltered || 0;
      }
    });
  } catch (e) {}

  // Toggle API key visibility
  toggleKeyVisibilityBtn.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    toggleKeyVisibilityBtn.textContent = isPassword ? '🔒' : '👁️';
  });

  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = `px-toast show ${isError ? 'error' : 'success'}`;
    setTimeout(() => {
      toast.className = 'px-toast';
    }, 3200);
  }

  function updateStatus(text, stateClass) {
    statusText.textContent = text;
    statusPill.className = `px-status-pill ${stateClass || ''}`;
  }

  // Test Connection
  testConnectionBtn.addEventListener('click', () => {
    const provider = providerSelect.value;
    const targetProvider = getProvider(provider);
    const key = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const customEndpoint = customEndpointInput ? customEndpointInput.value.trim() : '';
    const customModel = customModelInput ? customModelInput.value.trim() : '';

    if (targetProvider.requiresKey && !key) {
      showToast(`Please enter your ${targetProvider.name} API key first`, true);
      updateStatus('Missing Key', 'error');
      if (latencyPill) latencyPill.style.display = 'none';
      return;
    }

    testConnectionBtn.disabled = true;
    testConnectionBtn.innerHTML = '<span>⏳ Pinging...</span>';
    updateStatus('Testing...', '');

    chrome.runtime.sendMessage({
      action: 'VALIDATE_KEY',
      payload: {
        provider,
        apiKey: key,
        model,
        customEndpoint,
        customModel
      }
    }, (res) => {
      testConnectionBtn.disabled = false;
      testConnectionBtn.innerHTML = '<span>⚡ Test Connection</span>';

      if (res && res.success && res.valid) {
        updateStatus('Connected', 'connected');
        if (latencyPill) {
          latencyPill.textContent = `⚡ ${res.latencyMs || 120}ms`;
          latencyPill.style.display = 'inline-block';
        }
        showToast(`${targetProvider.name} API verified! ✅`);
      } else {
        const errorMsg = res?.error || 'Connection failed';
        updateStatus('Failed', 'error');
        if (latencyPill) latencyPill.style.display = 'none';
        showToast(`Error: ${errorMsg}`, true);
      }
    });
  });

  // Save Settings
  saveBtn.addEventListener('click', () => {
    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;
    const customEndpoint = customEndpointInput ? customEndpointInput.value.trim() : '';
    const customModel = customModelInput ? customModelInput.value.trim() : '';
    const length = lengthSelect.value;
    const personaPreset = personaPresetSelect.value;
    const persona = personaInput.value.trim();
    const adFilterEnabled = adFilterToggle.checked;

    // Update in-memory provider keys
    storedProviderKeys[provider] = apiKey;

    const validation = validateSettingsPayload({
      provider,
      apiKey,
      model,
      customEndpoint,
      customModel,
      persona,
      length,
      personaPreset
    });

    if (!validation.valid) {
      showToast(validation.error, true);
      return;
    }

    chrome.storage.local.set({
      provider,
      apiKey,
      providerKeys: storedProviderKeys,
      model,
      customEndpoint,
      customModel,
      length,
      personaPreset,
      persona,
      adFilterEnabled
    }, () => {
      updateStatus('Saved & Ready', 'connected');
      const targetProvider = getProvider(provider);
      showToast(`${targetProvider.name} settings saved! ✨`);
    });
  });
});
