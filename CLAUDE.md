# Claude Code Instructions

**Read `AGENTS.md` first** — it contains the architecture map, commands, conventions, constraints, and the docs index. This file only adds the commit format.

## Commit Message Format

This project uses conventional commits. All commit messages MUST follow this format:

```
<type>: <subject>

[optional body]

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

### Allowed types:

- `feat` - new feature
- `fix` - bug fix
- `docs` - documentation only
- `style` - code style (formatting, etc)
- `refactor` - code refactoring
- `perf` - performance improvement
- `test` - adding tests
- `chore` - maintenance tasks
- `ci` - CI/CD changes
- `build` - build system changes
- `revert` - revert previous commit

### Rules:

- Subject must be lowercase
- Subject must not be empty
- Subject must not end with a period
- Header max length: 72 characters
- Body line max length: 100 characters

### Examples:

- `docs: update readme with setup instructions`
- `feat: add user authentication`
- `fix: resolve login button crash`
- `chore: update dependencies`
