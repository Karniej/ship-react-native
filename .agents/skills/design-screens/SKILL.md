---
name: design-screens
description: Use when designing a ShipReactNative app from an approved idea spec in Claude Design before implementation. Trigger on "design the screens", "create a Claude Design prototype", "create a design pack", "plan the app flow", or when ShipReactNative System reaches the Design stage.
---

# ShipReactNative System — Design Screens in Claude Design

Turn an approved `specs/<slug>.md` into a real interactive Claude Design prototype and its
implementation contract at `design/<slug>/`. Design must finish and receive human approval before
Setup or Build begins. A markdown-only pack is not a successful Design stage.

## Step 0 — Verify Claude Design

This repository configures Anthropic's official `claude-design` remote MCP in `.mcp.json`.

1. Confirm Claude Code has loaded the project-scoped `claude-design` server and the user has trusted
   this repository's MCP configuration.
2. If authentication is required, tell the user to run `/design-login` in Claude Code and complete
   the browser sign-in.
3. Confirm the Claude Design tools are available before creating any design output.

If the server is missing, unavailable, or unauthenticated, **STOP** and point to
`docs/CLAUDE_DESIGN.md`. Record the blocker in `system-runs/<slug>/run.md`. Do not substitute a
markdown-only design, claim a prototype exists, or continue to Setup or Build.

## Step 1 — Read and sync the sources

Read the complete idea spec, then inspect the current project patterns:

- `src/app/` for route and navigation structure
- `src/components/ui/` for reusable components
- `src/constants/brand.ts` and `src/constants/theme.ts` for tokens
- `docs/DESIGN_SYSTEM.md` and `docs/COMPONENTS.md` for conventions

Run `/design-sync` in Claude Code to import or update the repository's design system in Claude
Design. Use the tools exposed by the `claude-design` MCP to create or update the project; do not
invent tool names if the server interface changes.

List every MVP feature. Assign exactly one primary screen to each feature; shared navigation and
support screens may be added but must not replace that mapping.

## Step 2 — Build the interactive prototype

Create a Claude Design project for the app and build a connected mobile prototype covering:

- every MVP screen and primary user flow
- first-run, empty, loading, error, success, and premium states where applicable
- light and dark modes using the synced repository tokens and components
- realistic content without fabricated market facts or unsupported product claims
- accessibility: text scaling, contrast, touch targets, focus order, and reduced motion

Iterate in Claude Design until the prototype, screen names, routes, and flow agree with the spec.
Export or hand off the implementation artifact into `design/<slug>/claude-design/`. The artifact may
be the HTML/ZIP export or the code handoff produced by Claude Design, but it must be inspectable from
the repository. Never commit credentials, private session data, or inaccessible temporary files.

## Step 3 — Create the implementation contract

Create `design/<slug>/` with all of these files:

### `design/<slug>/claude-design.md`

- Claude Design project name and project/share URL or stable project identifier
- confirmation that `/design-sync` was run and which repository sources were synced
- exported artifact or handoff path under `design/<slug>/claude-design/`
- prototype screen coverage and interaction coverage
- generation/sync date and any unresolved TODOs

Do not record a private URL as sufficient evidence. The repository artifact is required.

### `screens.md`

- table: MVP feature → primary screen file → prototype screen → route → purpose → free/premium
- shared navigation and support screens listed separately
- explicit coverage check showing every MVP feature appears once

### `flow.md`

- entry points and first-run path
- main success path between named screens
- back/cancel/retry behavior
- premium gate placement when relevant
- Mermaid flowchart using the same screen names as the prototype and `screens.md`

### `style.md`

- semantic colors mapped to existing theme tokens; no raw implementation colors unless proposing a
  change to `src/constants/brand.ts`
- typography, spacing, radius, icon, motion, and accessibility rules
- light and dark mode behavior
- Claude Design sync and export provenance

### `screen-<name>.md` for every screen

Use lowercase hyphenated names. Each file must contain:

1. purpose and mapped MVP feature
2. route and entry/exit actions
3. layout hierarchy from top to bottom
4. matching Claude Design frame/screen name
5. existing components to reuse and any new component required
6. data and interaction behavior
7. empty, loading, error, and success states
8. free/premium behavior
9. accessibility and dark-mode notes
10. acceptance checklist

## Step 4 — Cross-check and stop

- Claude Design project is reachable by the operator and the repository contains its export/handoff.
- Every MVP feature maps to exactly one primary screen.
- Every screen named in `screens.md` has a matching screen file and prototype screen.
- Flow names, routes, and actions agree across the prototype and all files.
- Proposed UI uses the synced repository theme and component system.
- Missing data, assets, or research are TODOs, not invented facts.

Present the Claude Design project, repository artifact path, and short screen list, then **STOP for
human design review**. Record the person's decision verbatim. Do not run `setup-ship-rn`, edit
`ship.config.ts`, or implement screens until approval is explicit.
