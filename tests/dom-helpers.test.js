import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanExtractedTweetText,
  extractAuthorHandle,
  formatTweetContextForPrompt,
  extractAuthorDetails,
  identifyThreadContext,
  findActualContentEditable,
  insertTextIntoTwitterEditor
} from '../extension/utils/x-dom-helpers.js';

test('cleanExtractedTweetText strips clutter and extracts core tweet content', () => {
  const raw = `Alex Rivers
@alexrivers
·
2h
Building AI agent workflows with local models is surprisingly fast.
12
45
1.2K
Quote`;

  const cleaned = cleanExtractedTweetText(raw);
  assert.equal(cleaned, 'Building AI agent workflows with local models is surprisingly fast.');
});

test('cleanExtractedTweetText strips timestamps, view counts, and replying to lines', () => {
  const raw = `meta’s biggest advantage might not be the model itself but getting..... AI in front of billions of people through apps they already use.....
4:44 PM · Oct 16, 2026 · 14 Views
Replying to @vinaysharrna and @SuiBuilds`;

  const cleaned = cleanExtractedTweetText(raw);
  assert.equal(cleaned, 'meta’s biggest advantage might not be the model itself but getting..... AI in front of billions of people through apps they already use.....');
  assert.equal(cleaned.includes('14 Views'), false);
  assert.equal(cleaned.includes('4:44 PM'), false);
  assert.equal(cleaned.includes('Replying to'), false);
});

test('extractAuthorHandle finds Twitter handle from text or fallback', () => {
  assert.equal(extractAuthorHandle('Alex Rivers @alexrivers · 2h'), 'alexrivers');
  assert.equal(extractAuthorHandle('Just some text without handle'), 'creator');
});

test('formatTweetContextForPrompt creates concise summary', () => {
  const formatted = formatTweetContextForPrompt({
    author: 'tech_founder',
    authorName: 'Alex',
    text: 'Never rewrite a working system from scratch.'
  });
  assert.equal(formatted.author, 'tech_founder');
  assert.equal(formatted.authorName, 'Alex');
  assert.equal(formatted.text, 'Never rewrite a working system from scratch.');
});

test('extractAuthorDetails parses first name from full display name', () => {
  const details = extractAuthorDetails('Sachin Yadav @makelifesimple_ · 2h');
  assert.equal(details.firstName, 'Sachin');
  assert.equal(details.fullName, 'Sachin Yadav');
  assert.equal(details.handle, 'makelifesimple_');
});

test('extractAuthorDetails handles single-word names and handles with emojis', () => {
  const details = extractAuthorDetails('Sarah 🚀 @sarah_dev · 15m');
  assert.equal(details.firstName, 'Sarah');
  assert.equal(details.handle, 'sarah_dev');
});

test('extractAuthorDetails cleans and capitalizes handle when display name is missing', () => {
  const details = extractAuthorDetails('Replying to @vinaysharrna and @SuiBuilds');
  assert.equal(details.firstName, 'Vinay');
  assert.equal(details.handle, 'vinaysharrna');
});

test('identifyThreadContext differentiates root post from nested reply', () => {
  const rootTweet = { text: 'Root tweet about AI', author: 'dan_dev', authorName: 'Dan' };
  const replyComment = { text: 'Replying to @dan_dev What about energy consumption?', author: 'maya_codes', authorName: 'Maya' };

  const context = identifyThreadContext({
    targetComment: replyComment,
    rootTweet
  });

  assert.equal(context.isNestedReply, true);
  assert.equal(context.targetAuthorName, 'Maya');
  assert.equal(context.targetAuthorHandle, 'maya_codes');
  assert.equal(context.rootTopic, 'Root tweet about AI');
});

test('findActualContentEditable finds nested contenteditable from wrapper', () => {
  const mockChild = {
    isContentEditable: true,
    getAttribute: (attr) => attr === 'role' ? 'textbox' : null,
    tagName: 'DIV'
  };
  const mockWrapper = {
    isContentEditable: false,
    querySelector: (sel) => mockChild,
    parentElement: null
  };

  const found = findActualContentEditable(mockWrapper);
  assert.equal(found, mockChild);
});

test('findActualContentEditable returns null gracefully when null passed in non-browser environment', () => {
  const found = findActualContentEditable(null);
  assert.equal(found, null);
});

test('insertTextIntoTwitterEditor returns false if no text or no editor found', () => {
  assert.equal(insertTextIntoTwitterEditor(null, ''), false);
  assert.equal(insertTextIntoTwitterEditor(null, 'Some text'), false);
});

test('insertTextIntoTwitterEditor works with editable element', () => {
  let focused = false;
  let clicked = false;
  const mockEditor = {
    isContentEditable: true,
    focus: () => { focused = true; },
    click: () => { clicked = true; },
    dispatchEvent: () => true
  };

  const success = insertTextIntoTwitterEditor(mockEditor, 'Insightful reply');
  assert.equal(success, true);
  assert.equal(focused, true);
  assert.equal(clicked, true);
});

test('insertTextIntoTwitterEditor does not duplicate text even if execCommand returns false in Chromium', () => {
  let insertTextCalls = 0;
  const mockEditor = {
    isContentEditable: true,
    innerText: '',
    focus: () => {},
    click: () => {},
    dispatchEvent: () => true
  };

  const origDocument = globalThis.document;
  try {
    globalThis.document = {
      execCommand: (cmd, showUi, val) => {
        if (cmd === 'insertText') {
          insertTextCalls++;
          mockEditor.innerText = val;
          return false; // Chrome returns false on deprecated execCommand even when successful
        }
        return true;
      }
    };

    const textToInsert = 'Mailing list, Chris — ads burn cash and build zero audience equity.';
    const success = insertTextIntoTwitterEditor(mockEditor, textToInsert);

    assert.equal(success, true);
    assert.equal(insertTextCalls, 1, 'insertText should be called exactly once');
    assert.equal(mockEditor.innerText, textToInsert, 'editor should contain text exactly once without repetition');
  } finally {
    globalThis.document = origDocument;
  }
});

test('insertTextIntoTwitterEditor calls insertText exactly once even when editor DOM does not update synchronously (Draft.js async React)', () => {
  let insertTextCalls = 0;
  const mockEditor = {
    isContentEditable: true,
    innerText: '', // Remains empty during synchronous execution as Draft.js intercepts beforeinput
    focus: () => {},
    click: () => {},
    dispatchEvent: () => true
  };

  const origDocument = globalThis.document;
  try {
    globalThis.document = {
      execCommand: (cmd) => {
        if (cmd === 'insertText') {
          insertTextCalls++;
          // Do NOT update mockEditor.innerText synchronously
          return false;
        }
        return true;
      }
    };

    const text = "numbers don't lie, that's the whole point. most gurus sell courses but can't show receipts like this.";
    const success = insertTextIntoTwitterEditor(mockEditor, text);

    assert.equal(success, true);
    assert.equal(insertTextCalls, 1, 'MUST execute insertText exactly once and never trigger redundant fallback');
  } finally {
    globalThis.document = origDocument;
  }
});

test('insertTextIntoTwitterEditor sets selection to replace existing draft rather than appending', () => {
  let selectAllCalled = false;
  let rangeSelected = false;

  const mockEditor = {
    isContentEditable: true,
    innerText: 'Old draft text here',
    focus: () => {},
    click: () => {},
    dispatchEvent: () => true
  };

  const origDocument = globalThis.document;
  const origWindow = globalThis.window;

  try {
    globalThis.document = {
      execCommand: (cmd) => {
        if (cmd === 'selectAll') selectAllCalled = true;
        return true;
      },
      createRange: () => ({
        selectNodeContents: (el) => {
          if (el === mockEditor) rangeSelected = true;
        }
      })
    };
    globalThis.window = {
      getSelection: () => ({
        removeAllRanges: () => {},
        addRange: () => {}
      })
    };

    insertTextIntoTwitterEditor(mockEditor, 'New replacement reply');
    assert.equal(selectAllCalled, true, 'must execute selectAll to select existing content');
    assert.equal(rangeSelected, true, 'must select node contents on mockEditor range');
  } finally {
    globalThis.document = origDocument;
    globalThis.window = origWindow;
  }
});

test('insertTextIntoTwitterEditor utilizes Synthetic DataTransfer paste and avoids execCommand when handled', () => {
  let pasteDispatched = false;
  let execCommandCalled = false;
  let pastedText = '';

  const mockEditor = {
    isContentEditable: true,
    focus: () => {},
    click: () => {},
    dispatchEvent: (ev) => {
      if (ev.type === 'paste') {
        pasteDispatched = true;
        pastedText = ev.clipboardData.getData('text/plain');
        ev.defaultPrevented = true; // Draft.js editOnPaste calls e.preventDefault()
        return false;
      }
      return true;
    }
  };

  class MockDataTransfer {
    constructor() { this._data = {}; }
    setData(type, val) { this._data[type] = val; }
    getData(type) { return this._data[type] || ''; }
  }

  class MockClipboardEvent {
    constructor(type, init) {
      this.type = type;
      this.clipboardData = init.clipboardData;
      this.defaultPrevented = false;
    }
  }

  const origClipboardEvent = globalThis.ClipboardEvent;
  const origDataTransfer = globalThis.DataTransfer;
  const origDocument = globalThis.document;

  try {
    globalThis.ClipboardEvent = MockClipboardEvent;
    globalThis.DataTransfer = MockDataTransfer;
    globalThis.document = {
      execCommand: () => {
        execCommandCalled = true;
        return true;
      }
    };

    const reply = "numbers don't lie, that's the whole point. most gurus sell courses but can't show receipts like this.";
    const success = insertTextIntoTwitterEditor(mockEditor, reply);

    assert.equal(success, true);
    assert.equal(pasteDispatched, true, 'must dispatch synthetic paste event to Draft.js');
    assert.equal(pastedText, reply, 'paste event must carry exact text payload');
    assert.equal(execCommandCalled, false, 'must NOT execute redundant execCommand when paste was intercepted by Draft.js');
  } finally {
    globalThis.ClipboardEvent = origClipboardEvent;
    globalThis.DataTransfer = origDataTransfer;
    globalThis.document = origDocument;
  }
});



