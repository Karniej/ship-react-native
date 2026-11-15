# Device proof

`verify-on-device` adds an evidence-producing stage between software verification and store
preparation. It uses Maestro for the fast emulator/simulator check and the pinned Callstack
`agent-device` package for a replayable physical-device journey, MP4, screenshots, and diagnostics.

## Tooling

- Install the Maestro CLI from its official documentation. The CLI includes its MCP server; the
  project configuration starts it with `maestro mcp`.
- The repository pins `agent-device` to `0.20.6` and starts its MCP through the local dependency with
  `npx --no-install agent-device mcp`. Node 22.12 or newer is required.
- Read `npm run device:help` before authoring commands. The installed CLI's version-matched help is
  authoritative because the project intentionally does not copy a changing command manual.
- Record `maestro --version`, `npm run device:version`, and the exact MCP tool names advertised by
  both connected servers in every device-proof report.

Official references:

- Maestro React Native support: <https://docs.maestro.dev/get-started/supported-platform/react-native>
- Maestro MCP: <https://docs.maestro.dev/getting-started/maestro-mcp>
- agent-device repository: <https://github.com/callstack/agent-device>
- agent-device installation: <https://oss.callstack.com/agent-device/docs/installation>
- agent-device agent setup: <https://oss.callstack.com/agent-device/docs/agent-setup>
- agent-device replay and E2E: <https://oss.callstack.com/agent-device/docs/replay-e2e>

## Inputs and target classes

The skill requires `platform` (`ios` or `android`), a plain-English intent, and `target`
(`local-sim` or `local-device`). The observed target class is written independently of what was
requested. An emulator or simulator remains `local-sim`, even when it is selected through a cloud
or remote interface.

Maestro Cloud uses virtual devices. Its results must not be described as physical-device or
real-device evidence.

## Host prerequisites

| Target           | Requirements                                                                      |
| ---------------- | --------------------------------------------------------------------------------- |
| Android emulator | Maestro, Android SDK, booted emulator, installed build                            |
| iOS simulator    | macOS, Xcode, Maestro, booted simulator, installed build                          |
| Android device   | USB/Wi-Fi debugging, ADB authorization, installed build                           |
| iOS device       | macOS, paired device, Developer Mode, Xcode signing/provisioning, installed build |

Device discovery is mandatory. A missing phone is an evidence outcome, not permission to relabel a
simulator recording. iOS physical automation rides on XCTest and stops when signing or provisioning
is unavailable.

## Artifact contract

The normative machine-readable rules are in `.agents/device-proof.contract.json`. They define
report fields, statuses, bidirectional links, tool evidence, and conditional artifacts.

Every run writes `report.md` and Maestro artifacts below `system-runs/<slug>/device-proof/`:

```text
device-proof/
├── report.md
└── maestro/
    ├── <journey>.yaml
    └── simulator.png
```

A prerequisite block still writes the report before returning. Its status is `blocked`; it names
the missing Design/handoff or Verify gate, records requested and observed target classes, uses
`not-applicable` for tool, replay, and artifact fields that were not reached, links back to
`run.md`, and is linked from that run log.

A `local-device` run that reaches `real-device-passed` also writes:

```text
device-proof/
└── agent-device/
    ├── <journey>.ad
    ├── <journey>.mp4
    ├── screenshot.png
    ├── logs.txt
    └── test-artifacts/
```

The report records redacted command templates and exit results, requested and observed target
classes, anonymized model/OS details, assertions, Maestro version, pinned `agent-device` version,
advertised MCP tool names, file sizes, and SHA-256 hashes. The top-level run log links the report,
and the report links back to the run log. Never commit credentials, replay values, Expo/dev-client
URLs, signing data, UDIDs, serial numbers, full device identifiers, or raw environment dumps.
The `.ad` replay path is required only for `real-device-passed`; every other status records
`not-applicable`.

## Verdicts

- `blocked`: approved Design/handoff or passed Verify is missing. Write and mutually link the
  minimal report before stopping.
- `simulator-passed`: Maestro assertions passed on a local emulator/simulator. No real-device claim.
- `real-device-passed`: a discovered physical target passed assertions and produced a non-empty MP4,
  screenshot, log, and `.ad` replay artifact.
- `device-unavailable`: the requested physical target or iOS signing prerequisites were absent. Keep
  any simulator proof and stop the required physical-device stage.
- `failed`: a flow, assertion, replay, capture, or artifact-integrity check failed.

Store preparation may follow a selected `local-sim` pass, but not a failed or blocked
`local-device` request. Store submission remains a separate human gate.

## Operator sequence

1. Start the app on the chosen simulator/emulator.
2. Use the Maestro MCP to inspect the live hierarchy, author YAML, capture a screenshot, and run the
   flow. Also run `maestro test <flow>` so the report has a reproducible CLI result.
3. For `local-device`, discover and select the physical device with `agent-device`. Android may use
   USB or Wi-Fi debugging; iOS may use a paired device. Read `agent-device help workflow` and
   command-specific help, then open the installed app.
4. Record the journey using `--save-script`, start/stop MP4 recording, capture screenshots and logs,
   verify named expectations, and close the session even after failure.
5. Replay or test the saved `.ad` script, inventory and hash the artifacts, write `report.md`, and
   link it from the run log.

This repository can validate the contract without mobile hardware. Only a live run on an explicitly
discovered target can create execution evidence.
