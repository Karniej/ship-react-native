---
name: validate-skills
description: Validates skills in this repo against agentskills.io conventions and checks the ShipReactNative System manifest, referenced files, and pipeline agreement. Trigger on "validate skills", "check the System manifest", "verify the agent kit", or via /validate-skills.
license: MIT
metadata:
  author: Callstack
  tags: validation, linting, skill-authoring
---

# Validate Skills

Validate all skills in `.agents/skills/` against the agentskills.io spec and Claude Code best
practices. Also run the deterministic ShipReactNative System checks.

## ShipReactNative System check

Run first:

```bash
npm run test:contracts
```

It verifies:

- the Phase 1 skills and `verify-on-device` exist with valid frontmatter and matching directory names
- `.agents/manifest.json` parses and references real skill and documentation files
- every manifest skill declares its job, inputs, and outputs
- the manifest points to the MIT `LICENSE`
- the pipeline is exactly `Idea → Validate → Spec → Design → Setup → Build → Verify → Device-proof → Store-prep` in
  `AGENTS.md`, the manifest, and `ship-system`
- the pinned agent-device package and lockfile versions agree, and the structured Device-proof
  contract passes positive and negative semantic fixtures
- `AGENTS.md` stays below 150 lines

## Validation Checklist

For each skill directory, verify:

### Spec Compliance (agentskills.io)

| Check                    | Rule                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `name` format            | 1-64 chars, lowercase alphanumeric + hyphens, no leading/trailing/consecutive hyphens |
| `name` matches directory | Directory name must equal `name` field                                                |
| `description` length     | 1-1024 characters, non-empty                                                          |
| Optional fields valid    | `license`, `metadata`, `compatibility` if present                                     |

### Best Practices (Claude Code)

| Check                     | Rule                                         |
| ------------------------- | -------------------------------------------- |
| Description format        | Third person, describes what + when to use   |
| Body length               | Under 500 lines                              |
| References one-level deep | No nested reference chains                   |
| Links are markdown        | Use `[text](path)` not bare filenames        |
| No redundancy             | Don't repeat description in body             |
| Concise                   | Only add context Claude doesn't already have |

## How to Run

1. Find all skill directories:

   ```bash
   rg --files .agents/skills -g 'SKILL.md'
   ```

2. For each skill, read `SKILL.md` and check against the rules above

3. Report issues in this format:

   ```
   ## Validation Results

   ### skills/example-skill
   - [PASS] name format valid
   - [FAIL] name "example" doesn't match directory "example-skill"
   - [PASS] description length OK (156 chars)
   ```

## References

- [agentskills.io spec](https://agentskills.io/specification)
- [Claude Code best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
