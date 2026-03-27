# Claude Code: CLAUDE.md & /init — Complete Guide

## What is `/init`?

`/init` is a slash command that **auto-generates a starter CLAUDE.md** by analyzing your codebase. It detects build systems, test frameworks, package managers, and code patterns, then writes a foundation file you can refine.

**When to use it:**
- At the start of a new project (after some code/config exists)
- To refresh an outdated CLAUDE.md
- It won't overwrite an existing CLAUDE.md — it suggests improvements instead

**Usage:** Type `/init` in a Claude Code session.

---

## What is CLAUDE.md?

CLAUDE.md is a markdown file that gives Claude **persistent instructions loaded at the start of every session**. Unlike conversation history (which resets), CLAUDE.md is always available.

Think of it as your project's long-term memory for Claude.

| What it is | What it isn't |
|------------|---------------|
| Persistent behavioral instructions | A config file Claude enforces mechanically |
| Project conventions Claude can't infer | A replacement for comments/docs in code |
| Rules that survive across sessions | A place for frequently changing info |

---

## Where CLAUDE.md Lives (Scope Hierarchy)

Files load from broadest to most specific — more specific locations override broader ones.

| Scope | Location | Shared Via |
|-------|----------|------------|
| Organization policy | `/etc/claude-code/CLAUDE.md` (Linux) | IT-managed |
| User/personal | `~/.claude/CLAUDE.md` | Just you, all projects |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Git (team) |
| Subdirectory | `./src/components/CLAUDE.md` | Git, loaded on demand |

**Load order (last wins on conflicts):**
1. Managed policy
2. User-level `~/.claude/CLAUDE.md`
3. Ancestor directories (root → your cwd)
4. `.claude/rules/` files without path filters
5. `.claude/rules/` files with matching `paths:` frontmatter
6. Subdirectory CLAUDE.md files (on-demand, as Claude reads those dirs)

---

## Best Practices

### The Golden Rules

**1. Keep it under 200 lines**
Longer files paradoxically cause worse adherence. Claude reads it like a human — long walls of text get missed. If you're over 200 lines, move sections to `.claude/rules/`.

**2. Be specific and verifiable**

| Bad (vague) | Good (specific) |
|-------------|-----------------|
| "Format code properly" | "Use 2-space indentation, single quotes" |
| "Test your changes" | "Run `npm test` before committing" |
| "Follow best practices" | "Never use `any` type in TypeScript" |

**3. Only include what Claude can't infer**
Don't list standard language conventions. Don't describe what's obvious from the code. Only add things that would cause mistakes if absent.

**4. Use `IMPORTANT:` for rules Claude keeps missing**
```markdown
IMPORTANT: Never use `any` type — use `unknown` with type narrowing.
IMPORTANT: Always run tests before suggesting a commit.
```

**5. Prune regularly**
Review CLAUDE.md when Claude ignores a rule. Either the rule is vague (rewrite it) or it's already obvious from the code (delete it).

**6. Fix contradictions immediately**
If two rules conflict, Claude picks one arbitrarily. Audit for conflicts whenever you add new rules.

### What to Include vs. Exclude

**Include:**
- Build, test, lint commands Claude can't guess
- Code style rules that differ from language defaults
- Repository conventions (branch naming, PR format, commit style)
- Architecture: where things live, non-obvious structures
- Required environment variables and setup steps
- Common gotchas and known failure modes

**Exclude:**
- Anything derivable by reading the code
- Standard language conventions
- Detailed API docs (link to them instead)
- Information that changes frequently
- Self-evident practices ("write clean code")
- Long explanations or tutorials

---

## Recommended CLAUDE.md Structure

```markdown
# Project Overview
One-sentence description if not obvious from README.

# Build & Commands
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Dev: `npm run dev` (port 3000)

# Code Style
- 2-space indentation
- Single quotes for strings
- ES modules (import/export), not CommonJS

# Architecture
- API handlers: `src/api/handlers/`
- Components: `src/components/`
- Utilities: `src/utils/`

# Workflow
- Feature branches from `main`: `feat/`, `fix/` prefixes
- Run tests before committing
- Type-check after large changes: `npm run typecheck`

# Testing
- Unit tests: `npm test`
- E2E requires local DB running: see README
- Tests live in `__tests__/` next to source files

# Environment Setup
- Node 18+ required
- Copy `.env.example` to `.env.local`
- Required vars: `DATABASE_URL`, `API_KEY`

# Common Issues
- Port conflict: `npm run dev -- --port 3001`
- Stale types after pull: delete `node_modules/.cache`
```

---

## Splitting Large CLAUDE.md with `.claude/rules/`

When CLAUDE.md grows past 200 lines, split it:

```
.claude/
├── CLAUDE.md              # Core project info only (<100 lines)
└── rules/
    ├── code-style.md      # Formatting and naming rules
    ├── testing.md         # Test conventions
    ├── security.md        # Security requirements
    └── frontend.md        # React/UI-specific rules
```

**Path-specific rules** (only load when Claude is working in matching files):
```markdown
---
paths:
  - "src/components/**/*.tsx"
---
# React Component Rules
- Use functional components with hooks only
- No class components
- Props interfaces named `[ComponentName]Props`
```

---

## CLAUDE.md vs. Other Claude Code Features

| Need | Use |
|------|-----|
| Persistent behavioral instructions | CLAUDE.md |
| Zero-exception automation (always lint, always test) | Hooks in `.claude/settings.json` |
| Tool permissions | `.claude/settings.json` permissions |
| Repeatable task workflows | Skills (`.claude/skills/`) |
| Personal preferences across all projects | `~/.claude/CLAUDE.md` |
| Team-enforced policies | Managed policy CLAUDE.md |

**Hooks example** (runs lint after every file edit — can't be skipped):
```json
{
  "hooks": {
    "PostToolUse": {
      "handlers": [{ "handler": "command", "command": "npm run lint --fix" }]
    }
  }
}
```

---

## Monorepo Setup

```
monorepo/
├── CLAUDE.md                    # Shared: build tools, common conventions
├── apps/
│   ├── web/
│   │   └── CLAUDE.md           # Frontend-specific rules
│   └── api/
│       └── CLAUDE.md           # Backend-specific rules
```

To exclude irrelevant team CLAUDE.md files, add to `.claude/settings.local.json`:
```json
{
  "claudeMdExcludes": ["**/other-team/.claude/rules/**"]
}
```

---

## Quick-Start Checklist

- [ ] Run `/init` to generate a starter (works best when code exists)
- [ ] Keep the file under 200 lines
- [ ] Add actual build/test commands (copy-paste ready)
- [ ] Add style rules that differ from language defaults
- [ ] Add architecture: where things live
- [ ] Add common gotchas you've hit before
- [ ] Commit to git so the team uses the same rules
- [ ] Run `/memory` in a session to verify it's being loaded
- [ ] Review and prune every few weeks

---

## Verifying CLAUDE.md is Loaded

Run `/memory` in any Claude Code session. Your CLAUDE.md files should appear in the loaded context list. If a file isn't listed, check:
- Is it in the right location?
- Is its path excluded in `claudeMdExcludes`?
- Is the file path above or below your working directory?
