import { describe, expect, it } from "vitest";

import {
  createSystemRunState,
  finishStage,
  getRecoveryDecision,
  getResumeStage,
  invalidateFromStage,
  startStage,
  type StageFailure,
} from "./run-state";

const NOW = "2026-08-08T09:00:00.000Z";

function failure(kind: StageFailure["kind"], message = "stage failed"): StageFailure {
  return {
    kind,
    message,
    occurredAt: NOW,
    evidencePaths: ["system-runs/test/failure.md"],
    safeNextActions: ["inspect the evidence"],
  };
}

describe("recoverable System run state", () => {
  it("checkpoints a passed stage and continues to the next stage", () => {
    const initial = createSystemRunState("test", "idea-input", NOW);
    const running = startStage(initial, "idea", "idea-input", {}, NOW);
    const passed = finishStage(
      running,
      "idea",
      { status: "passed", outputHash: "idea-output" },
      NOW
    );

    expect(passed.checkpoints.idea?.[1]).toMatchObject({
      attempt: 1,
      status: "passed",
      inputHash: "idea-input",
      outputHash: "idea-output",
    });
    expect(getRecoveryDecision(passed)).toEqual({
      action: "continue",
      stage: "validate",
      reason: "Previous stage completed",
    });
  });

  it("retries only transient failures within the bounded budget", () => {
    const running = startStage(
      createSystemRunState("test", "idea-input", NOW),
      "validate",
      "validation-input",
      { research: "1.0.0" },
      NOW
    );
    const failed = finishStage(
      running,
      "validate",
      { status: "retryable-failed", failure: failure("provider-rate-limit") },
      NOW
    );

    expect(getRecoveryDecision(failed)).toEqual({
      action: "retry",
      stage: "validate",
      delaySeconds: 30,
      reason: "stage failed",
    });
  });

  it("branches a quality-gate failure back to its owning stage", () => {
    const running = startStage(
      createSystemRunState("test", "idea-input", NOW),
      "verify",
      "build-output",
      {},
      NOW
    );
    const failed = finishStage(
      running,
      "verify",
      { status: "terminal-failed", failure: failure("quality-gate", "tests failed") },
      NOW
    );

    expect(getRecoveryDecision(failed)).toEqual({
      action: "branch-back",
      stage: "build",
      reason: "tests failed",
    });
  });

  it("waits for a human when credentials or a decision block progress", () => {
    const running = startStage(
      createSystemRunState("test", "idea-input", NOW),
      "design",
      "spec-output",
      {},
      NOW
    );
    const blocked = finishStage(
      running,
      "design",
      {
        status: "blocked",
        failure: {
          ...failure("missing-credential", "Claude Design login required"),
          humanDecisionRequired: "Authenticate Claude Design",
        },
      },
      NOW
    );

    expect(getRecoveryDecision(blocked)).toEqual({
      action: "await-human",
      stage: "design",
      reason: "Authenticate Claude Design",
    });
  });

  it("invalidates changed inputs and resumes at the earliest affected stage", () => {
    let state = createSystemRunState("test", "idea-v1", NOW);
    state = finishStage(
      startStage(state, "idea", "idea-v1", {}, NOW),
      "idea",
      {
        status: "passed",
        outputHash: "idea-output-v1",
      },
      NOW
    );
    state = finishStage(
      startStage(state, "validate", "idea-output-v1", {}, NOW),
      "validate",
      {
        status: "passed",
        outputHash: "validation-output-v1",
      },
      NOW
    );

    const invalidated = invalidateFromStage(state, "idea", "idea changed", NOW);

    expect(getResumeStage(invalidated)).toBe("idea");
    expect(invalidated.checkpoints.validate?.[0]).toMatchObject({
      invalidationReason: "idea changed",
    });
    expect(() => startStage(invalidated, "idea", "idea-v2", {}, NOW)).not.toThrow();
  });

  it("rejects passed stages without an output hash", () => {
    const running = startStage(
      createSystemRunState("test", "idea-input", NOW),
      "spec",
      "validation-output",
      {},
      NOW
    );

    expect(() => finishStage(running, "spec", { status: "passed" }, NOW)).toThrow(
      "Passed stages require an output hash"
    );
  });
});
