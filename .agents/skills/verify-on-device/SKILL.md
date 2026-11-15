---
name: verify-on-device
description: Use after app verification to author a Maestro end-to-end flow, run it on a local simulator or emulator, and optionally capture honest physical-device evidence with agent-device. Trigger on "verify on device", "record the app on a phone", "run mobile e2e", or "capture device proof".
---

# Verify on Device

Produce reproducible mobile end-to-end evidence without confusing simulator output with physical-device proof.

## Required inputs

- Read `system-runs/<slug>/run.md` before preflight. Require it to record an approved Claude Design
  prototype and implementation handoff plus a passed Verify stage. When either prerequisite is
  absent, first create `system-runs/<slug>/device-proof/report.md` with final status `blocked`,
  the missing prerequisite, requested/observed target classes, tool and artifact fields marked
  `not-applicable`, and a link back to `system-runs/<slug>/run.md`. Add the report link to
  `run.md`, mark Device-proof `blocked`, and stop.
- `platform`: `ios` or `android`
- `intent`: the plain-English journey and success condition
- `target`: `local-sim` or `local-device`
- the run slug and installed app identifier or an explicit Expo/dev-client URL

Create `system-runs/<slug>/device-proof/` and keep all reports, screenshots, video, logs, and replay files below it. Link the final report from `system-runs/<slug>/run.md`. Never put secrets, signing credentials, or full device identifiers in committed artifacts.

## Preflight

1. Read `docs/DEVICE_PROOF.md`.
2. Run `maestro --version`, confirm its project MCP (`maestro mcp`) starts, and record the exact
   version and advertised tool names. Use the tools actually advertised by the server; current
   versions may name them `cheat_sheet`, `inspect_screen`, `take_screenshot`, and `run`, or expose
   equivalents such as `inspect_view_hierarchy` and `run_flow`.
3. Run `npm run device:version` and `npm run device:help`. Record the pinned `agent-device` version
   and its advertised MCP tool names. The installed CLI's help is the source of truth for exact
   commands.
4. Discover the selected target. Do not infer that an emulator, simulator, or phone exists.
5. For iOS physical devices, require Xcode signing/provisioning, pairing, and Developer Mode. Stop honestly when any prerequisite is unmet. Android physical devices use ADB.

## Tier 1 — Maestro simulator flow

1. Start or select a local emulator/simulator and launch the running build.
2. Inspect the screen through the Maestro MCP and author or update `system-runs/<slug>/device-proof/maestro/<journey>.yaml` with durable IDs or visible labels.
3. Validate and run the YAML with `maestro test` on the selected local emulator/simulator. Capture the command, target, exit status, assertions, and a screenshot.
4. Set the evidence class to `local-sim`. A simulator or emulator result is never real-device evidence.

If the required local simulator or emulator cannot be discovered, started, or reached, record
`failed` with the reason and stop. Do not run Store-prep.

Maestro Cloud is not a physical-device service. Never use a Maestro Cloud run to support a real-device claim.

## Tier 2 — physical-device capture

Only run this tier when `target` is `local-device` and discovery confirms a physical device.

1. Read `agent-device help workflow` and the relevant command help. Open the installed app on the explicit physical target.
2. Use accessibility snapshots and stable selectors to replay the same intent. Record a reusable `.ad` journey with `--save-script`; replace sensitive input with named replay variables.
3. Start an MP4 recording with `agent-device record start`, exercise and verify the journey, capture screenshots and logs, then stop recording and close the session even after failure.
4. Run the saved `.ad` journey with `agent-device test` or `replay` as documented by the installed version. Preserve its result, replay script, timing, diagnostics, and test artifacts.
5. Write `report.md`, inventory and hash the evidence, and link the report from `run.md`. Claim
   `real-device-passed` only after discovery identifies a physical target, assertions pass, the
   `.ad`, MP4, screenshot, and log artifacts are non-empty, SHA-256 hashes are recorded for every
   artifact, and the report and run log link to each other.

If no phone is attached, record `device-unavailable`, retain the simulator tier, and stop. Do not label the stage or pipeline real-device verified. If the requested target is `local-sim`, record `simulator-passed` and continue without a real-device claim.

## Report contract

The normative machine-readable contract is `.agents/device-proof.contract.json`; this skill and
`docs/DEVICE_PROOF.md` explain how to produce it.

Write `system-runs/<slug>/device-proof/report.md` with:

- platform, requested target, observed target class, anonymized device model/OS, app identifier, and timestamp
- test intent, Maestro flow path, and redacted command templates with placeholders
- `.ad` replay path when `local-device` reaches `real-device-passed`; otherwise the explicit
  value `not-applicable`
- Maestro version, pinned `agent-device` version, and the exact MCP tool names advertised by each server
- simulator result and physical-device result as separate fields
- artifact inventory with file sizes and SHA-256 hashes
- failures, unavailable prerequisites, retries, and selector repairs
- final status: `blocked`, `simulator-passed`, `real-device-passed`, `device-unavailable`, or
  `failed`

Every status requires bidirectional links: `run.md` links `device-proof/report.md`, and the report
links back to its run log. A report is incomplete if it omits either link, the observed target
class, or if its evidence label exceeds what was actually run.

Redact Expo/dev-client URLs, credentials, signing data, replay values, UDIDs, serial numbers, and
full device identifiers from command templates. Never write their raw values below the run directory.

## Hard stops

- No connected physical device for a `local-device` request: preserve simulator artifacts, mark `device-unavailable`, and stop.
- iOS physical signing, provisioning, pairing, or Developer Mode missing: stop.
- Maestro flow fails: do not record a physical-device pass.
- Required local simulator or emulator cannot be discovered or launched: record `failed`, name the
  reason, and stop before Store-prep.
- Missing or empty MP4, screenshot, log, or `.ad` artifact: do not claim `real-device-passed`.
- Never execute Store-prep after a required device-proof stage is blocked or failed.
