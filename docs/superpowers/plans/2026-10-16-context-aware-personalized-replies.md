# Context-Aware Personalized Replies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance PulseX to accurately detect thread context (original post vs nested replies), extract the author's real display name, directly answer reply questions/comments, and instruct DeepSeek to produce ultra-human, short, personalized replies addressing the author by name.

**Architecture:** Upgrade DOM scraping in `x-dom-helpers.js` to target Twitter's `User-Name` and `tweetText` containers to extract display name and determine if the target is a root post or a nested comment. Update `deepseek.js` prompt engineering to perform context analysis, name-based personalization, and enforce a strict 1-2 sentence conversational length. Re-bundle into `content_script.js` and verify with automated unit tests.

**Tech Stack:** JavaScript (ES6+), Chrome Extension Manifest V3, DeepSeek API (`deepseek-chat`), Node.js `node:test` runner.

## Global Constraints
- Strictly short and easy: replies must be 1-2 sentences (maximum 30 words), using plain, natural human language.
- Author personalization: extract the real display name (e.g., "Alex" from "Alex Rivers") and naturally incorporate it into the reply.
- Thread awareness: distinguish between replying to a main tweet vs answering an existing comment/reply in a thread.
- Zero build step: `extension/content/content_script.js` remains a fully self-contained classic script with no external imports.

---

### Task 1: Enhanced Author Name & Thread Context Extraction

**Files:**
- Modify: `extension/utils/x-dom-helpers.js`
- Modify: `tests/dom-helpers.test.js`

**Interfaces:**
- Produces:
  - `extractAuthorDetails(element)`: `{ fullName, firstName, handle }`
  - `extractThreadHierarchy(composerEl)`: `{ isNestedReply: boolean, targetComment: { authorName, authorHandle, text }, rootTweet: { authorName, authorHandle, text } }`

- [ ] **Step 1: Write failing tests for author name and thread context extraction**
```javascript
// In tests/dom-helpers.test.js
test('extractAuthorDetails parses first name from full display name', () => {
  const details = extractAuthorDetails('Sachin Yadav @makelifesimple_ · 2h');
  assert.equal(details.firstName, 'Sachin');
  assert.equal(details.handle, 'makelifesimple_');
});

test('extractAuthorDetails handles single-word names and handles with emojis', () => {
  const details = extractAuthorDetails('Sarah 🚀 @sarah_dev · 15m');
  assert.equal(details.firstName, 'Sarah');
  assert.equal(details.handle, 'sarah_dev');
});

test('identifyThreadContext differentiates root post from nested reply', () => {
  const mockArticles = [
    { text: 'Root tweet about AI', author: 'Dan' },
    { text: 'Replying to @Dan What about energy consumption?', author: 'Maya' }
  ];
  const context = identifyThreadContext(mockArticles[1], mockArticles[0]);
  assert.equal(context.isNestedReply, true);
  assert.equal(context.targetAuthorName, 'Maya');
  assert.equal(context.rootTopic, 'Root tweet about AI');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/dom-helpers.test.js`
Expected: FAIL (`extractAuthorDetails` not defined).

- [ ] **Step 3: Implement `extractAuthorDetails` and thread context parsing in `extension/utils/x-dom-helpers.js`**
Handle `[data-testid="User-Name"]`, emoji stripping for clean first names, and traversal to detect if the target is a reply in a thread.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/dom-helpers.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/utils/x-dom-helpers.js tests/dom-helpers.test.js
git commit -m "feat: add author display name extraction and thread context detection"
```

---

### Task 2: Prompt Engine Upgrade: Context Analysis, Name Personalization & Short Replies

**Files:**
- Modify: `extension/utils/deepseek.js`
- Modify: `tests/deepseek.test.js`

**Interfaces:**
- Consumes: `{ authorName, authorHandle, tweetText, isNestedReply, rootTopic, angle, rawThought, persona }`
- Produces: Enhanced `{ systemPrompt, userPrompt }` that enforces:
  - Contextual analysis of questions/arguments.
  - Natural first-name address (e.g. "Good question, Alex -", "Spot on, Alex.").
  - Extreme brevity: 1-2 punchy sentences, simple human vocabulary, zero bot phrases.

- [ ] **Step 1: Write failing tests for personalized short reply prompts**
```javascript
// In tests/deepseek.test.js
test('buildReplyPrompt instructs model to address author by first name when available', () => {
  const prompt = buildReplyPrompt({
    tweetText: 'Should startups focus on profitability from day 1?',
    authorName: 'Marcus',
    authorHandle: 'marcus_builds',
    isNestedReply: true,
    rootTopic: 'Bootstrapping vs VC in 2026',
    angle: 'insight'
  });

  assert.ok(prompt.systemPrompt.includes('Marcus'));
  assert.ok(prompt.systemPrompt.includes('1-2 short, punchy sentences'));
  assert.ok(prompt.userPrompt.includes('Marcus'));
  assert.ok(prompt.userPrompt.includes('nested comment/reply'));
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/deepseek.test.js`
Expected: FAIL.

- [ ] **Step 3: Update `extension/utils/deepseek.js` with personalized prompt engineering**
Implement strict rules for brevity, human flow, name personalization, and direct answering of nested replies.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/deepseek.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add extension/utils/deepseek.js tests/deepseek.test.js
git commit -m "feat: upgrade prompt engine with name personalization and ultra-short human cadence"
```

---

### Task 3: Content Script Update & Re-bundling

**Files:**
- Modify: `extension/content/content_script.js`
- Modify: `test-demo.html`

**Interfaces:**
- Updates `content_script.js` to:
  - Extract display name and first name using `[data-testid="User-Name"]`.
  - Pass `{ authorName, isNestedReply, rootTopic }` in `GENERATE_REPLY` and `COPILOT_CHAT` messages.
  - Update Copilot Drawer header to show: *"Replying to [Name] (@[handle])"*.
  - Update `test-demo.html` with nested thread reply example for live browser verification.

- [ ] **Step 1: Update `extension/content/content_script.js`**
Integrate the name extraction and thread hierarchy detection into `TimelineManager` and `CopilotManager`.

- [ ] **Step 2: Update `test-demo.html` to simulate a nested reply thread**
Add a nested comment: *"@alexrivers What about small bootstrapped teams with limited runway?"* by user *"Elena Rostova (@elena_dev)"*.

- [ ] **Step 3: Run full automated test suite**
Run: `npm test`
Expected: All tests pass.

- [ ] **Step 4: Commit**
```bash
git add extension/content/content_script.js test-demo.html
git commit -m "feat: integrate personalized context analysis into timeline assistant and copilot drawer"
```

---

### Task 4: Verification and User Testing

- [ ] **Step 1: Test with unit tests**
Run: `npm test`
Expected: 25+ tests pass with zero errors.

- [ ] **Step 2: Verify live in Chrome or `test-demo.html`**
Verify that:
1. When replying to Alex Rivers, the reply says: *"Alex, ..."* or *"Spot on, Alex."*
2. Replies are consistently short (1-2 sentences, under 30 words).
3. Replying to a comment directly answers that comment's question.
