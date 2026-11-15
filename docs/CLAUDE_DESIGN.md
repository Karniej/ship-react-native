# Claude Design Integration

ShipReactNative System uses Anthropic's official Claude Design MCP for the Design stage. It creates
an interactive prototype before application code is changed. There is no markdown-only fallback.

## Requirements

- Claude Code with access to Claude Design beta
- a Claude account authorized for Claude Design
- a browser available for the one-time OAuth flow
- this repository opened as a trusted Claude Code project

Claude Design currently runs in Claude on the web or Desktop. The repository integration is the
handoff between its visual canvas and Claude Code.

## Project setup

The project-scoped MCP is committed in `.mcp.json`:

```json
{
  "mcpServers": {
    "claude-design": {
      "type": "http",
      "url": "https://api.anthropic.com/v1/design/mcp"
    }
  }
}
```

When Claude Code opens the repository, approve the project MCP after reviewing `.mcp.json`. Then:

1. Run `/design-login` and complete the browser sign-in.
2. Run `/design-sync` to import or refresh the repository's components, tokens, and design system.
3. Ask Claude Code to run the `design-screens` skill for the approved spec.

For a user-scoped installation outside this repository, Anthropic documents:

```bash
claude mcp add --scope user --transport http claude-design https://api.anthropic.com/v1/design/mcp
```

The committed project configuration means ShipReactNative users should not need that extra command.

## Required output

The Design stage is complete only when all of these exist:

- an interactive Claude Design project covering every MVP screen and primary flow
- `design/<slug>/claude-design.md` with project, sync, and handoff provenance
- an inspectable export or code handoff under `design/<slug>/claude-design/`
- the screen, flow, style, and per-screen implementation contract
- an explicit human review decision in `system-runs/<slug>/run.md`

A share URL alone is not durable user evidence. Keep an export or handoff in the repository, but
never commit OAuth tokens, account data, or private session files.

## Troubleshooting

- **Server is not listed:** restart Claude Code in the repository and review `.mcp.json`.
- **Authentication required:** run `/design-login` again.
- **Components or tokens are stale:** run `/design-sync` before editing the prototype.
- **Claude Design unavailable:** record the blocked stage and stop. Do not continue to Setup or Build.
- **MCP interface changed:** use the tools the `claude-design` server currently exposes; do not guess
  command or tool names.

Official references:

- [Get started with Claude Design](https://support.claude.com/en/articles/14604416-get-started-with-claude-design)
- [Claude Design](https://claude.com/product/design)
