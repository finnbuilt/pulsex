/**
 * PulseX - Background Service Worker (Manifest V3)
 */

import { handleMessagePayload } from './utils/message-handler.js';

// Initialize defaults on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['provider', 'model', 'adFilterEnabled', 'persona'], (data) => {
    const defaults = {};
    if (!data.provider) defaults.provider = 'deepseek';
    if (!data.model) defaults.model = 'deepseek-chat';
    if (data.adFilterEnabled === undefined) defaults.adFilterEnabled = true;
    if (data.persona === undefined) defaults.persona = 'Direct, insightful, and authentic tech creator. High value, zero fluff, no hashtags.';
    
    if (Object.keys(defaults).length > 0) {
      chrome.storage.local.set(defaults);
    }
  });
});

// Route runtime messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessagePayload(message)
    .then(response => sendResponse(response))
    .catch(error => sendResponse({ success: false, error: error.message }));

  return true; // Keep channel open for async response
});
