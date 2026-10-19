/**
 * PulseX - DeepSeek API Client & Prompt Engineering Module
 * Endpoint: https://api.deepseek.com/chat/completions
 */

export const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
export const DEFAULT_MODEL = 'deepseek-chat';
export const REASONER_MODEL = 'deepseek-reasoner';

export const ANGLE_INSTRUCTIONS = {
  agree: 'Agree with their point and add a fast, concrete validation.',
  counter: 'Respectfully offer an alternative viewpoint or trade-off.',
  insight: 'Deliver a quick high-value takeaway or practical perspective.',
  witty: 'Deliver a sharp, witty, punchy one-liner.',
  question: 'Ask a crisp, engaging follow-up question.'
};

export const PERSONA_PRESETS = {
  custom: 'Direct, insightful, and authentic tech creator. High value, zero fluff, no hashtags.',
  tech_founder: 'Pragmatic tech founder. Focuses on speed, customer leverage, lean execution, and architecture tradeoffs. Direct, authentic, no hype.',
  growth_marketer: 'Data-driven growth operator. Sharp on distribution, funnels, retention, and CAC. High signal, metric-focused.',
  deep_thinker: 'First-principles analytical thinker. Explores subtle incentives, systems thinking, second-order effects, and counter-intuitive truths.',
  contrarian: 'Sharp, respectful contrarian. Challenges consensus assumptions, highlights hidden costs, asks penetrating questions.',
  supportive: 'Warm, encouraging peer builder. Validates real work, highlights specific details that impressed them, builds genuine relationships.'
};

export const LENGTH_PRESETS = {
  short: 'Output strictly 1 punchy sentence (under 15 words).',
  standard: 'Output strictly 1 to 2 short sentences (under 25-30 words).',
  detailed: 'Output 2 to 3 concise, high-value sentences (under 50 words).'
};

export const TONE_REWRITE_MODES = {
  shorter: 'Condense this reply to make it even more ultra-concise (under 15 words) while keeping the core punch.',
  punchier: 'Make this reply sharper, more vivid, and impactful without sounding arrogant.',
  formal: 'Elevate this reply to sound more professional, articulate, and executive.',
  question: 'End this reply with a sharp, natural follow-up question that invites conversation.'
};

/**
 * Extracts multiple variations separated by delimiter, or returns single item.
 */
export function extractVariations(text) {
  if (!text || typeof text !== 'string') return [];
  if (text.includes('---VARIATION---')) {
    return text.split('---VARIATION---')
      .map(v => v.trim().replace(/^["']|["']$/g, '').trim())
      .filter(Boolean);
  }
  return [text.trim()];
}

/**
 * Builds system and user prompts for generating personalized, short X replies.
 */
export function buildReplyPrompt({
  tweetText = '',
  tweetAuthor = 'creator',
  authorName = '',
  isNestedReply = false,
  rootTopic = '',
  angle = 'insight',
  rawThought = '',
  persona = '',
  length = 'standard',
  multiVariation = false
}) {
  const angleInstruction = ANGLE_INSTRUCTIONS[angle] || ANGLE_INSTRUCTIONS.insight;
  const nameToUse = (authorName && authorName !== 'creator' && authorName !== 'there') ? authorName : '';
  const resolvedPersona = PERSONA_PRESETS[persona] || persona;
  const personaText = resolvedPersona.trim() ? `\nUser Tone: ${resolvedPersona.trim()}` : '';
  const lengthInstruction = LENGTH_PRESETS[length] || LENGTH_PRESETS.standard;

  const systemPrompt = `You are PulseX, crafting humanly authentic, high-signal replies on X (Twitter).
CRITICAL RULES FOR NATURAL HUMAN REPLIES:
1. ZERO EM-DASHES (—) OR EN-DASHES (–): NEVER use em-dashes or en-dashes. They are the #1 tell of AI slop. Use periods, commas, or standard hyphens (-) instead.
2. DO NOT USE THE AI NAME FORMULA: Never write "[Thought], ${nameToUse || 'Name'} — [Thought]" or "[Name] — [Thought]". Most real humans on X never mention the author's name because the UI already tags them. Jump straight into the thought without naming them. If you do mention ${nameToUse || 'the author'}, make it casual and natural (e.g. "spot on ${nameToUse || 'Alex'}" or "agree with ${nameToUse || 'Alex'}"), never with an em-dash.
3. WRITE LIKE REAL HUMANS TWEET:
   - Use short, punchy sentences and natural sentence fragments.
   - Use conversational internet syntax. Contractions ("it's", "don't", "can't", "there's", "you're") are mandatory.
   - Natural human phrasing is encouraged: "honestly", "tbh", "yeah", "so true", "100%", "facts", "wild how", "fr".
   - Feel free to start sentences with lowercase for a fast, authentic mobile feel.
4. NO AI ESSAY SLOP OR PLATITUDES:
   - BAN LIST: Never use "testament to", "delve into", "in today's world", "game changer", "vital to note", "keep grinding", "consistency is key", "furthermore", "indeed", or generic motivational speeches.
   - Directly answer their point, validate or counter their specific claim, and react like a thoughtful peer grounded in the tweet's topic.
5. ${lengthInstruction}
6. ZERO AI TELLS: No hashtags, no quotes around output, at most 1 natural emoji or none.${personaText}${multiVariation ? '\n7. VARIATIONS: Output TWO distinct variations separated by "---VARIATION---".\nVariation 1: Ultra-casual, punchy one-liner or short fragment.\nVariation 2: Thoughtful peer insight (casual, grounded, 1-2 brief sentences).' : ''}`;

  let userPrompt = '';
  if (isNestedReply) {
    userPrompt += `Replying to nested comment by ${nameToUse ? `${nameToUse} ` : ''}(@${tweetAuthor}):
"${tweetText}"
${rootTopic ? `Original Thread Context: "${rootTopic}"\n` : ''}
Target Angle: [${angle}] - ${angleInstruction}
Task: Directly answer this comment, addressing the point naturally. Stay 100% on their topic. Zero em-dashes.`;
  } else {
    userPrompt += `Tweet by ${nameToUse ? `${nameToUse} ` : ''}(@${tweetAuthor}):
"${tweetText}"

Target Angle: [${angle}] - ${angleInstruction}
Task: Directly respond to the specific point above. Stay 100% on their topic. Zero em-dashes.`;
  }

  if (rawThought && rawThought.trim()) {
    userPrompt += `\n\nUser's Raw Thought to weave in:
"${rawThought.trim()}"`;
  }

  return { systemPrompt, userPrompt };
}

/**
 * Builds system and user prompts to rewrite an existing draft with a new tone.
 */
export function buildRewritePrompt({
  originalReply = '',
  mode = 'punchier',
  tweetText = '',
  authorName = ''
}) {
  const instruction = TONE_REWRITE_MODES[mode] || TONE_REWRITE_MODES.punchier;
  const nameToUse = (authorName && authorName !== 'creator' && authorName !== 'there') ? authorName : '';

  const systemPrompt = `You are PulseX, refining an existing reply for X (Twitter).
Goal: ${instruction}
Rules:
- Write like a real human: short, casual, authentic (1 to 2 sentences, under 25 words).
- ZERO em-dashes (—) or en-dashes (–). Never use them.
- Do not use robotic name formulas like "[Statement], ${nameToUse || 'Name'} —".
- Zero hashtags, no quotes around output.`;

  const userPrompt = `Target Tweet: "${tweetText}"
Current Draft: "${originalReply}"
Refinement Instruction: ${instruction}`;

  return { systemPrompt, userPrompt };
}

/**
 * Builds prompts for crafting a Quote Tweet reaction.
 */
export function buildQuoteTweetPrompt({
  tweetText = '',
  tweetAuthor = 'creator',
  authorName = '',
  rawThought = '',
  persona = ''
}) {
  const nameToUse = (authorName && authorName !== 'creator' && authorName !== 'there') ? authorName : '';
  const resolvedPersona = PERSONA_PRESETS[persona] || persona;
  const personaText = resolvedPersona.trim() ? `\nUser Voice: ${resolvedPersona.trim()}` : '';

  const systemPrompt = `You are PulseX, crafting a Quote Tweet for X (Twitter).
Goal: Write a compelling commentary to accompany the quoted post on the timeline.
Rules:
- 1 to 2 sharp sentences adding unique perspective, validation, or takeaway.
- Sound like a real human: casual, direct, authentic.
- ZERO em-dashes (—). Under 35 words total. Zero hashtags, no quotes around output.${personaText}`;

  const userPrompt = `Quoted Tweet by ${nameToUse ? `${nameToUse} ` : ''}(@${tweetAuthor}):
"${tweetText}"
${rawThought ? `\nUser's Angle/Thought: "${rawThought}"` : ''}

Task: Write an engaging Quote Tweet reaction that adds high value to followers.`;

  return { systemPrompt, userPrompt };
}

/**
 * Formats multi-turn chat messages for the Copilot Drawer.
 */
export function buildCopilotChatMessages({ tweetContext = {}, persona = '', history = [] }) {
  const handle = tweetContext.author ? `@${tweetContext.author}` : 'author';
  const name = tweetContext.authorName || '';
  const authorDisplay = name ? `${name} (${handle})` : handle;
  const text = tweetContext.text || '(No specific tweet selected)';
  const personaText = persona.trim() ? `\nUser Tone & Persona: ${persona.trim()}` : '';

  const systemMessage = {
    role: 'system',
    content: `You are PulseX Copilot, a strategic thinking partner for X (Twitter).
The user is viewing or discussing a post by ${authorDisplay}:
[Author Name]: "${name || 'the creator'}"
[Tweet]: "${text}"
${personaText}
CRITICAL GUIDELINES:
- Ground all suggestions strictly in the tweet's core topic, company, or technical premise.
- BAN LIST - NEVER output: em-dashes "—" or "–", "Views are vanity", "consistency compounds", "Keep shipping", "Keep building", "LFG", "testament to", "in today's world", or generic motivational platitudes.
- Write like a real human on X: casual, punchy, conversational (1-2 short sentences or fragments, under 25 words).
- Never use the robotic pattern "[Statement], [Name] —". Most human replies jump straight into the idea. If mentioning "${name || 'the creator'}", make it completely casual with zero em-dashes.
- Directly answer questions or objections when replying to sub-threads.`
  };

  return [systemMessage, ...history];
}

/**
 * Extracts and cleans the generated reply from DeepSeek API response.
 */
import { PROVIDERS, getProvider, DEFAULT_PROVIDER } from './providers.js';

export { PROVIDERS, getProvider, DEFAULT_PROVIDER };

export function parseDeepSeekResponse(apiResponse, providerId = 'deepseek') {
  if (!apiResponse) {
    throw new Error('No choices returned by AI API');
  }

  let content = '';

  // 1. Anthropic Claude format: { content: [{ type: 'text', text: '...' }] }
  if (Array.isArray(apiResponse.content)) {
    const textBlock = apiResponse.content.find(b => b.type === 'text');
    content = textBlock ? textBlock.text : (apiResponse.content[0]?.text || '');
  }
  // 2. OpenAI / DeepSeek / Gemini / Groq / OpenRouter / Custom format: { choices: [{ message: { content, reasoning_content } }] }
  else if (apiResponse.choices && apiResponse.choices.length > 0) {
    const choice = apiResponse.choices[0];
    const message = choice.message || {};
    content = message.content || message.reasoning_content || '';
  }
  // 3. String content or direct text
  else if (typeof apiResponse === 'string') {
    content = apiResponse;
  }
  else {
    throw new Error('No choices returned by DeepSeek API');
  }

  content = content.trim();

  // Strip wrapping quotes if the model wrapped the entire reply in quotes
  if ((content.startsWith('"') && content.endsWith('"')) ||
      (content.startsWith("'") && content.endsWith("'"))) {
    content = content.slice(1, -1).trim();
  }

  // Strip leading AI intro labels (e.g. "Here's a reply:", "Reply:")
  content = content.replace(/^(here(?:'s| is) (?:a )?(?:reply|suggestion|reaction):?|reply:?)\s*/i, '');

  // Sanitize robotic name formulas: e.g. ", Name — next clause" -> ". Next clause"
  content = content.replace(/,\s*[A-Z][a-z]+\s*[—–]\s*([a-z])/g, (m, char) => `. ${char.toUpperCase()}`);
  content = content.replace(/,\s*[A-Z][a-z]+\s*[—–]\s*/g, '. ');
  content = content.replace(/^[A-Z][a-z]+\s*[—–]\s*/g, '');

  // Eliminate any remaining em-dashes (—) or en-dashes (–) into natural human punctuation
  content = content.replace(/\s*[—–]\s*/g, ' - ');
  content = content.replace(/[—–]/g, '-');

  return content.trim();
}

export const parseModelResponse = parseDeepSeekResponse;

/**
 * Validates API key format (basic regex check).
 */
export function validateApiKeyLocally(apiKey, providerId = 'deepseek') {
  const provider = getProvider(providerId);
  return provider.validateKey(apiKey);
}

/**
 * Dispatches an HTTP request to any supported AI Provider API.
 */
export async function callModelApi({
  provider: providerId = 'deepseek',
  apiKey,
  model,
  messages = [],
  temperature = 0.7,
  max_tokens = 250,
  customEndpoint,
  customModel
}) {
  const provider = getProvider(providerId);
  const keyValidation = provider.validateKey(apiKey);
  if (!keyValidation.valid) {
    throw new Error(keyValidation.error);
  }

  const selectedModel = model || provider.defaultModel;
  const reqConfig = provider.buildRequest({
    apiKey,
    model: selectedModel,
    messages,
    max_tokens,
    temperature,
    customEndpoint,
    customModel
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), reqConfig.timeoutMs || 45000);

  try {
    const response = await fetch(reqConfig.url, {
      method: 'POST',
      headers: reqConfig.headers,
      body: reqConfig.body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.error?.message || JSON.stringify(errorJson);
      } catch (e) {
        errorDetail = await response.text();
      }
      throw new Error(`${provider.name} API error (${response.status}): ${errorDetail}`);
    }

    const data = await response.json();
    return parseDeepSeekResponse(data, providerId);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`${provider.name} API request timed out (${Math.round((reqConfig.timeoutMs || 45000) / 1000)}s)`);
    }
    throw err;
  }
}

export const callDeepSeekApi = (args) => callModelApi({ ...args, provider: 'deepseek' });

