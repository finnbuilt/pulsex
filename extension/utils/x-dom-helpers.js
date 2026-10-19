/**
 * PulseX - Twitter DOM Parsing, Author Personalization & Text Insertion Utilities
 */

export function extractAuthorHandle(text) {
  if (!text) return 'creator';
  const match = text.match(/@([A-Za-z0-9_]{1,20})/);
  return match ? match[1] : 'creator';
}

/**
 * Extracts full display name, first name, and handle from raw text or DOM element.
 */
export function extractAuthorDetails(input) {
  if (!input) {
    return { fullName: 'Creator', firstName: 'there', handle: 'creator' };
  }

  let text = typeof input === 'string' ? input : (input.innerText || input.textContent || '');
  const handle = extractAuthorHandle(text);

  // Split lines to find display name
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let fullName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(`@${handle}`) || line.startsWith('@')) {
      if (i > 0) {
        fullName = lines[i - 1];
      }
      break;
    }
  }

  // If handle was inline (e.g. "Sachin Yadav @makelifesimple_ · 2h")
  if (!fullName) {
    const inlineMatch = text.match(/^([^\n@·•]+)\s+@/);
    if (inlineMatch && !/^Replying\s+to/i.test(inlineMatch[1])) {
      fullName = inlineMatch[1].trim();
    }
  }

  if (!fullName || /^Replying\s+to/i.test(fullName)) {
    if (handle && handle !== 'creator') {
      // Clean handle (e.g. "vinaysharrna" -> "Vinay", "alex_dev" -> "Alex")
      const base = handle.replace(/sharr?na$/i, '').split(/[_0-9]/)[0] || handle;
      fullName = base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
    } else {
      fullName = 'Friend';
    }
  }

  // Strip emojis, verification ticks, and symbols to isolate real first name
  const cleanName = fullName
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  const words = cleanName.split(/\s+/).filter(Boolean);
  let firstName = words.length > 0 ? words[0] : fullName;
  if (firstName) {
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  }

  return { fullName, firstName, handle };
}

export function cleanExtractedTweetText(rawText) {
  if (!rawText) return '';

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  // Find where author header (@handle, timestamps, dots) ends
  let contentStartIndex = 0;
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    if (lines[i].startsWith('@') || /^\d+[smhdw]$/i.test(lines[i]) || lines[i] === '·') {
      contentStartIndex = i + 1;
    }
  }

  const candidateLines = lines.slice(contentStartIndex);

  // Filter out typical X metadata lines:
  const filteredLines = candidateLines.filter(line => {
    if (line.startsWith('@')) return false;
    if (/^[·•|\-–—]$/.test(line)) return false;
    if (/^\d+[smhdw]$/i.test(line)) return false;
    if (/^\d+(\.\d+)?[KMB]?$/i.test(line)) return false;
    if (/\b\d+(\.\d+)?[KMB]?\s+Views?\b/i.test(line)) return false;
    if (/\b\d{1,2}:\d{2}\s*(?:AM|PM)\b/i.test(line)) return false;
    if (/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}\b/i.test(line)) return false;
    if (/^Replying\s+to\b/i.test(line)) return false;
    if (/^(Quote|Translate post|Ad|Promoted|Verified)$/i.test(line)) return false;
    return true;
  });

  return filteredLines.join(' ').trim() || rawText.trim();
}

export function formatTweetContextForPrompt(tweetData = {}) {
  return {
    author: tweetData.author || 'creator',
    authorName: tweetData.authorName || 'there',
    text: (tweetData.text || '').slice(0, 800)
  };
}

/**
 * Identifies whether we are replying to a root post or answering a nested comment/reply.
 */
export function identifyThreadContext({ targetComment, rootTweet }) {
  if (!targetComment) {
    return {
      isNestedReply: false,
      targetAuthorName: 'there',
      targetAuthorHandle: 'creator',
      targetText: '',
      rootTopic: ''
    };
  }

  const isNested = Boolean(
    rootTweet &&
    (targetComment.author !== rootTweet.author || targetComment.text !== rootTweet.text)
  );

  return {
    isNestedReply: isNested,
    targetAuthorName: targetComment.authorName || 'there',
    targetAuthorHandle: targetComment.author || 'creator',
    targetText: targetComment.text || '',
    rootTopic: rootTweet ? (rootTweet.text || '') : ''
  };
}

/**
 * Extracts author details and cleaned tweet text from an article element.
 */
export function extractTweetDataFromElement(tweetEl) {
  if (!tweetEl) return { author: 'creator', authorName: 'there', text: '' };

  let text = '';
  const tweetTextEl = tweetEl.querySelector ? tweetEl.querySelector('[data-testid="tweetText"]') : null;
  if (tweetTextEl) {
    text = (tweetTextEl.innerText || tweetTextEl.textContent || '').trim();
  }

  const rawText = tweetEl.innerText || tweetEl.textContent || '';
  if (!text) {
    text = cleanExtractedTweetText(rawText);
  }

  let authorDetails = null;
  const userNameEl = tweetEl.querySelector ? tweetEl.querySelector('[data-testid="User-Name"]') : null;
  if (userNameEl) {
    authorDetails = extractAuthorDetails(userNameEl.innerText || userNameEl.textContent || '');
  }
  if (!authorDetails || authorDetails.handle === 'creator') {
    authorDetails = extractAuthorDetails(rawText);
  }

  return {
    author: authorDetails.handle,
    authorName: authorDetails.firstName,
    authorFullName: authorDetails.fullName,
    text
  };
}

/**
 * Traverses DOM from an active compose area to locate the target tweet being replied to.
 */
export function findParentTweetForComposer(composerEl) {
  if (!composerEl) return { author: 'creator', authorName: 'there', text: '' };

  // 1. Reply modal dialog
  const modal = composerEl.closest ? composerEl.closest('[role="dialog"]') : null;
  if (modal) {
    const tweets = Array.from(modal.querySelectorAll('article[data-testid="tweet"]'));
    if (tweets.length > 0) {
      const targetEl = tweets[tweets.length - 1]; // Closest tweet to reply box
      const rootEl = tweets.length > 1 ? tweets[0] : null;
      const targetData = extractTweetDataFromElement(targetEl);
      const rootData = rootEl ? extractTweetDataFromElement(rootEl) : null;
      return {
        ...targetData,
        threadContext: identifyThreadContext({ targetComment: targetData, rootTweet: rootData })
      };
    }
  }

  // 2. Direct enclosing cell (when composer is rendered inside the same card)
  const enclosingCell = composerEl.closest ? (composerEl.closest('[data-testid="cellInnerDiv"]') || composerEl.closest('article[data-testid="tweet"]')?.parentElement) : null;
  if (enclosingCell) {
    const directTweet = enclosingCell.querySelector('article[data-testid="tweet"]');
    if (directTweet) {
      const all = typeof document !== 'undefined' ? Array.from(document.querySelectorAll('article[data-testid="tweet"]')) : [];
      const rootEl = (all.length > 1 && all[0] !== directTweet) ? all[0] : null;
      const targetData = extractTweetDataFromElement(directTweet);
      const rootData = rootEl ? extractTweetDataFromElement(rootEl) : null;
      return {
        ...targetData,
        threadContext: identifyThreadContext({ targetComment: targetData, rootTweet: rootData })
      };
    }
  }

  // 3. Inline reply box under an existing tweet cell
  let current = composerEl.closest ? (composerEl.closest('[data-testid="cellInnerDiv"]') || composerEl.parentElement) : composerEl.parentElement;
  while (current && typeof document !== 'undefined' && current !== document.body) {
    const prev = current.previousElementSibling;
    if (prev) {
      const tweet = prev.querySelector('article[data-testid="tweet"]') ||
                    (prev.matches?.('article[data-testid="tweet"]') ? prev : null);
      if (tweet) {
        const all = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
        const rootEl = (all.length > 1 && all[0] !== tweet) ? all[0] : null;
        const targetData = extractTweetDataFromElement(tweet);
        const rootData = rootEl ? extractTweetDataFromElement(rootEl) : null;
        return {
          ...targetData,
          threadContext: identifyThreadContext({ targetComment: targetData, rootTweet: rootData })
        };
      }
    }
    current = current.parentElement;
  }

  // 4. Geometry-based resolution (tweet immediately above composer)
  if (typeof document !== 'undefined' && composerEl.getBoundingClientRect) {
    const allArticles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    if (allArticles.length > 0) {
      const composerRect = composerEl.getBoundingClientRect();
      let best = null;
      let minDistance = Infinity;

      for (const t of allArticles) {
        const r = t.getBoundingClientRect();
        const dist = composerRect.top - r.bottom;
        if (dist >= -40 && dist < minDistance) {
          minDistance = dist;
          best = t;
        }
      }

      const chosen = best || allArticles[0];
      const rootEl = (allArticles.length > 1 && allArticles[0] !== chosen) ? allArticles[0] : null;
      const targetData = extractTweetDataFromElement(chosen);
      const rootData = rootEl ? extractTweetDataFromElement(rootEl) : null;
      return {
        ...targetData,
        threadContext: identifyThreadContext({ targetComment: targetData, rootTweet: rootData })
      };
    }
  }

  return { author: 'creator', authorName: 'there', text: '' };
}

/**
 * Locates the actual contenteditable Draft.js / Lexical container even if given a wrapper.
 */
export function findActualContentEditable(node) {
  if (node) {
    // Direct check
    if (node.isContentEditable || node.getAttribute?.('contenteditable') === 'true') {
      return node;
    }

    // Check children
    if (node.querySelector) {
      const inside = node.querySelector(
        'div[role="textbox"][contenteditable="true"], [data-testid="tweetTextarea_0"], div[contenteditable="true"], [role="textbox"]'
      );
      if (inside) return inside;
    }

    // Check parent or sibling
    if (node.parentElement) {
      const nearby = node.parentElement.querySelector(
        'div[role="textbox"][contenteditable="true"], [data-testid="tweetTextarea_0"], div[contenteditable="true"]'
      );
      if (nearby) return nearby;
    }
  }

  // Modal dialog fallback
  if (typeof document !== 'undefined') {
    const inDialog = document.querySelector(
      '[role="dialog"] div[role="textbox"][contenteditable="true"], [role="dialog"] [data-testid="tweetTextarea_0"]'
    );
    if (inDialog) return inDialog;

    // Document fallback: first visible editable textbox
    const all = Array.from(document.querySelectorAll('div[role="textbox"][contenteditable="true"], [data-testid="tweetTextarea_0"]'));
    for (const el of all) {
      const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { width: 1, height: 1 };
      if (rect.width > 0 && rect.height > 0) return el;
    }
    if (all.length > 0) return all[0];
  }

  return node || null;
}

/**
 * Inserts text into Twitter's Draft.js / Lexical editor using multi-stage dispatch
 * so React internal state is updated and the editor does not become blank.
 */
export function insertTextIntoTwitterEditor(targetNode, textToInsert) {
  if (!textToInsert) return false;

  const editorEl = findActualContentEditable(targetNode);
  if (!editorEl) {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(textToInsert).catch(() => {});
    }
    return false;
  }

  try {
    editorEl.focus();
    if (typeof editorEl.click === 'function') editorEl.click();
  } catch (e) {}

  // Select all content inside editorEl so new text replaces any existing text rather than appending
  if (typeof window !== 'undefined' && window.getSelection && document.createRange) {
    try {
      const sel = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorEl);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) {}
  }

  let commandExecuted = false;

  // Single-dispatch native insertion:
  // In Draft.js & Lexical, execCommand('insertText') fires beforeinput which React intercepts.
  // Calling execCommand('insertText') exactly ONCE is crucial. Multiple calls fire multiple
  // input events, causing duplicate text insertion in the composer.
  if (typeof document !== 'undefined' && document.execCommand) {
    try {
      document.execCommand('selectAll', false, null);
      document.execCommand('insertText', false, textToInsert);
      commandExecuted = true;
    } catch (e) {}
  }

  // Fallback only if execCommand was unavailable or threw an exception
  if (!commandExecuted && editorEl.isContentEditable) {
    try {
      editorEl.textContent = textToInsert;
    } catch (e) {}
  }

  // Dispatch input & change events for framework bindings (Draft.js React state sync)
  try {
    if (typeof Event !== 'undefined') {
      editorEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      editorEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    }
  } catch (e) {}

  // Always backup to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(textToInsert).catch(() => {});
  }

  return true;
}
