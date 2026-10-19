# AGENTS.md — Entry Point for AI Coding Agents

Welcome to **PulseX**! This repository follows the **ContextZen Methodology**.

Before making any code changes, reading specs, or executing tasks, you MUST read the context files in `context/` in the following order:

## Context Read Order

1. **[project-overview.md](file:///context/project-overview.md)** — Product scope, core user flows, goals, and success criteria.
2. **[architecture.md](file:///context/architecture.md)** — Manifest V3 architecture, system boundaries, storage model, and non-negotiable invariants.
3. **[code-standards.md](file:///context/code-standards.md)** — Chrome MV3 rules, classic content script requirements, API patterns, and file organization.
4. **[ui-context.md](file:///context/ui-context.md)** — Obsidian Emerald design system, color tokens, typography, Shadow DOM encapsulation, and layout patterns.
5. **[ai-workflow-rules.md](file:///context/ai-workflow-rules.md)** — Scoping, verification checklist, protected files, and anti-slop rules.
6. **[progress-tracker.md](file:///context/progress-tracker.md)** — Active phase, build units, completed milestones, and session notes.

## Critical Instructions for Agents
- **Sync Rule**: Always update `context/progress-tracker.md` after completing a build unit or feature step.
- **Invariants Rule**: Never break the invariants documented in `context/architecture.md` (e.g., zero build steps for content scripts, Draft.js React state synchronization, no top-level ES imports in content scripts).
- **Scope Rule**: Implement tasks one build unit at a time. Do not modify files outside the current unit scope.
- **Verification Rule**: Run `npm test` and verify all tests pass before completing any task.
