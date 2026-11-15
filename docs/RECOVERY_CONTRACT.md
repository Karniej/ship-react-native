# Recoverable System execution

`system-runs/<slug>/run-state.json` is the machine state. `run.md` remains the human-readable paper
trail. Every stage attempt records its status, timestamps, `inputHash`/`outputHash`, tool versions,
artifacts, failure evidence, and human decisions.

## Statuses

- `pending`: not started
- `running`: one active attempt
- `passed`: output exists, is hashed, and satisfied the stage gate
- `blocked`: a missing prerequisite prevents safe progress
- `retryable-failed`: a transient failure may be retried within budget
- `terminal-failed`: retrying the same inputs is unsafe or pointless
- `needs-human`: an explicit decision is required
- `skipped-by-policy`: intentionally omitted under a recorded rule
- `degraded`: partial output exists but cannot satisfy the full gate

Never use `passed` for partial, skipped, unavailable, or unverified work.

## Failure taxonomy and retry budget

| Failure                                         | Default behavior                                     |
| ----------------------------------------------- | ---------------------------------------------------- |
| provider rate limit                             | up to 3 attempts; 30s then 120s                      |
| provider unavailable                            | up to 3 attempts; 15s then 60s                       |
| network                                         | up to 3 attempts; 5s then 30s                        |
| timeout                                         | up to 2 attempts; 15s                                |
| tool failure                                    | up to 2 attempts; 10s                                |
| invalid input, missing credential, tool missing | block or stop; do not loop                           |
| quality gate, artifact integrity                | branch back to the owning stage                      |
| human rejection, policy stop                    | terminal until a new human decision or changed input |

Retry only the failed stage. Preserve every attempt. Before retrying, confirm that external side
effects did not already succeed.

## Resume and branch-back

- Validate failure returns to Idea refinement and records `branchBackTo: "idea"`.
- Spec failure returns to Validate.
- Design rejection remains in Design.
- Setup failure remains in Setup and uses its existing rollback/apply records.
- Build failure remains in Build.
- Verify or Device-proof quality failure returns to Build.
- Store-prep failure returns to the stage that owns the missing code, evidence, metadata, or asset.

Resume from the latest valid checkpoint. A changed input hash invalidates downstream checkpoints;
keep them for history, but do not reuse them.

## Idempotency and compensation

Before a mutating action, record the intended target and an idempotency key derived from run, stage,
attempt, and input hash. Afterward, record the external result identifier. Never repeat payments,
messages, uploads, releases, store submissions, destructive configuration, or production writes
without checking that identifier and obtaining any required approval.

Each mutating skill must name its compensation or state that no safe automatic rollback exists.
Approved specs and designs are immutable inputs; a revision creates a new version.

## Escalation packet

When stopping, report:

- stage, attempt, status, and failure kind
- exact failed check and redacted evidence
- input/output hashes and preserved artifact paths
- attempts used and retry budget remaining
- whether an external side effect may have occurred
- safe next actions
- the exact human decision or credential required

Never hide a failed stage by continuing with placeholders.
