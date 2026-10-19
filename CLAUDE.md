# CLAUDE.md — Instructions for Claude / Anthropic Agents

This repository follows the **ContextZen Methodology**.

## Context Read Order
Before making changes, review the context files in `context/`:
1. `context/project-overview.md` — Product scope, core user flows, goals.
2. `context/architecture.md` — Manifest V3 architecture, system boundaries, invariants.
3. `context/code-standards.md` — Chrome MV3 rules, ES module background vs. classic content script.
4. `context/ui-context.md` — Obsidian Emerald cyber glass design system & Shadow DOM tokens.
5. `context/ai-workflow-rules.md` — Scoping, anti-slop rules, verification checklist.
6. `context/progress-tracker.md` — Active phase, build plan, and session logs.

## Commands
- **Test:** `npm test` (Runs Node 24 native test runner on `tests/*.test.js`)
- **Generate Icons:** `npm run generate-icons` (Regenerates 16/48/128 PNG icons)

## Critical Constraints
- `extension/content/content_script.js` MUST remain a classic self-contained script with no top-level `import` or `export` statements.
- Never write text directly to Twitter's Draft.js editor using `.innerText` or `.textContent` — use `document.execCommand('selectAll')` + `document.execCommand('insertText')`.
- All injected UI must be encapsulated in Shadow DOM using the Obsidian Emerald palette.
