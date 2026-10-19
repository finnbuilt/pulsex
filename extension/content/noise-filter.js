/**
 * PulseX - Smart Noise & Ad Filter for X (Twitter)
 */

export const AD_INDICATOR_REGEX = /\b(Promoted|Ad\b|Sponsorisé|Gesponsert|Publicidad|プロモーション|Patrocinado|Реклама)/i;

export const SPAM_PATTERNS = [
  /\bdrop your (\$(sol|eth|btc)|wallet|address)\b/i,
  /\b(airdrop|claim your free|free usdt|whitelist spot)\b/i,
  /\bdm me to (claim|earn|win)\b/i,
  /\bfree giveaway alert\b/i
];

/**
 * Checks if a tweet element or representation contains ad/promoted markings.
 */
export function checkTweetForAdIndicators(element) {
  if (!element) return false;
  const text = element.textContent || '';
  if (AD_INDICATOR_REGEX.test(text)) return true;

  // Check aria-labels or SVG icons used by Twitter for promoted labels
  if (element.querySelector) {
    const svgs = element.querySelectorAll('svg');
    for (const svg of svgs) {
      const parentText = svg.parentElement?.textContent || '';
      if (AD_INDICATOR_REGEX.test(parentText)) return true;
    }
  }

  return false;
}

/**
 * Checks if a tweet text contains spam patterns.
 */
export function checkTweetForSpamKeywords(text) {
  if (!text) return false;
  return SPAM_PATTERNS.some(pattern => pattern.test(text));
}

export class NoiseFilterManager {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.filterSpam = options.filterSpam ?? false;
    this.blockedCount = 0;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  scanAndFilter(root = document) {
    if (!this.enabled || !root || !root.querySelectorAll) return 0;

    const tweetElements = root.querySelectorAll('article[data-testid="tweet"]');
    let newlyBlocked = 0;

    for (const tweet of tweetElements) {
      if (tweet.dataset.pulsexFiltered) continue;

      const isAd = checkTweetForAdIndicators(tweet);
      const isSpam = this.filterSpam && checkTweetForSpamKeywords(tweet.textContent);

      if (isAd || isSpam) {
        tweet.dataset.pulsexFiltered = 'true';
        // Smoothly hide
        tweet.classList.add('pulsex-ad-hidden');
        newlyBlocked++;
        this.blockedCount++;
      }
    }

    if (newlyBlocked > 0 && typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'UPDATE_BADGE_COUNT',
        payload: { count: this.blockedCount }
      }).catch(() => {});
    }

    return newlyBlocked;
  }
}
