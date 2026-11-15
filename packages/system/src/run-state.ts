export const SYSTEM_STAGES = [
  "idea",
  "validate",
  "spec",
  "design",
  "setup",
  "build",
  "verify",
  "device-proof",
  "store-prep",
] as const;

export type SystemStage = (typeof SYSTEM_STAGES)[number];

export const STAGE_STATUSES = [
  "pending",
  "running",
  "passed",
  "blocked",
  "retryable-failed",
  "terminal-failed",
  "needs-human",
  "skipped-by-policy",
  "degraded",
] as const;

export type StageStatus = (typeof STAGE_STATUSES)[number];

export const FAILURE_KINDS = [
  "invalid-input",
  "missing-credential",
  "provider-rate-limit",
  "provider-unavailable",
  "network",
  "timeout",
  "tool-missing",
  "tool-failure",
  "quality-gate",
  "artifact-integrity",
  "human-rejection",
  "policy-stop",
] as const;

export type FailureKind = (typeof FAILURE_KINDS)[number];

export type RetryPolicy = {
  maxAttempts: number;
  backoffSeconds: readonly number[];
};

export type StageFailure = {
  kind: FailureKind;
  message: string;
  occurredAt: string;
  evidencePaths: string[];
  safeNextActions: string[];
  humanDecisionRequired?: string;
  branchBackTo?: SystemStage;
};

export type StageCheckpoint = {
  stage: SystemStage;
  attempt: number;
  status: StageStatus;
  startedAt: string;
  completedAt?: string;
  inputHash: string;
  outputHash?: string;
  toolVersions: Record<string, string>;
  artifactPaths: string[];
  failure?: StageFailure;
  humanDecision?: string;
  idempotencyKey?: string;
  externalResultId?: string;
  compensation?: string;
  invalidatedAt?: string;
  invalidationReason?: string;
};

export type SystemRunState = {
  schemaVersion: 1;
  slug: string;
  createdAt: string;
  updatedAt: string;
  currentStage: SystemStage;
  checkpoints: Partial<Record<SystemStage, StageCheckpoint[]>>;
};

export type RecoveryDecision =
  | { action: "continue"; stage: SystemStage; reason: string }
  | { action: "retry"; stage: SystemStage; delaySeconds: number; reason: string }
  | { action: "branch-back"; stage: SystemStage; reason: string }
  | { action: "await-human"; stage: SystemStage; reason: string }
  | { action: "stop"; stage: SystemStage; reason: string }
  | { action: "complete"; stage: SystemStage; reason: string };

export const DEFAULT_RETRY_POLICIES: Record<FailureKind, RetryPolicy> = {
  "invalid-input": { maxAttempts: 1, backoffSeconds: [] },
  "missing-credential": { maxAttempts: 1, backoffSeconds: [] },
  "provider-rate-limit": { maxAttempts: 3, backoffSeconds: [30, 120] },
  "provider-unavailable": { maxAttempts: 3, backoffSeconds: [15, 60] },
  network: { maxAttempts: 3, backoffSeconds: [5, 30] },
  timeout: { maxAttempts: 2, backoffSeconds: [15] },
  "tool-missing": { maxAttempts: 1, backoffSeconds: [] },
  "tool-failure": { maxAttempts: 2, backoffSeconds: [10] },
  "quality-gate": { maxAttempts: 1, backoffSeconds: [] },
  "artifact-integrity": { maxAttempts: 1, backoffSeconds: [] },
  "human-rejection": { maxAttempts: 1, backoffSeconds: [] },
  "policy-stop": { maxAttempts: 1, backoffSeconds: [] },
};

const ALLOWED_STATUS_TRANSITIONS: Record<StageStatus, readonly StageStatus[]> = {
  pending: ["running", "skipped-by-policy"],
  running: ["passed", "blocked", "retryable-failed", "terminal-failed", "needs-human", "degraded"],
  passed: [],
  blocked: ["running", "needs-human", "terminal-failed"],
  "retryable-failed": ["running", "terminal-failed"],
  "terminal-failed": [],
  "needs-human": ["running", "passed", "terminal-failed"],
  "skipped-by-policy": [],
  degraded: ["running", "passed", "terminal-failed"],
};

const BRANCH_BACK_STAGE: Partial<Record<SystemStage, SystemStage>> = {
  validate: "idea",
  spec: "validate",
  design: "design",
  setup: "setup",
  build: "build",
  verify: "build",
  "device-proof": "build",
  "store-prep": "build",
};

function latestCheckpoint(state: SystemRunState, stage: SystemStage): StageCheckpoint | undefined {
  const attempts = state.checkpoints[stage];
  return attempts?.[attempts.length - 1];
}

function nextStage(stage: SystemStage): SystemStage | undefined {
  const index = SYSTEM_STAGES.indexOf(stage);
  return SYSTEM_STAGES[index + 1];
}

export function isRetryableFailure(kind: FailureKind): boolean {
  return DEFAULT_RETRY_POLICIES[kind].maxAttempts > 1;
}

export function canTransitionStageStatus(from: StageStatus, to: StageStatus): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}

export function createSystemRunState(
  slug: string,
  inputHash: string,
  now = new Date().toISOString()
): SystemRunState {
  if (!slug.trim()) throw new Error("Run slug is required");
  if (!inputHash.trim()) throw new Error("Initial input hash is required");

  return {
    schemaVersion: 1,
    slug,
    createdAt: now,
    updatedAt: now,
    currentStage: "idea",
    checkpoints: {
      idea: [
        {
          stage: "idea",
          attempt: 0,
          status: "pending",
          startedAt: now,
          inputHash,
          toolVersions: {},
          artifactPaths: [],
        },
      ],
    },
  };
}

export function startStage(
  state: SystemRunState,
  stage: SystemStage,
  inputHash: string,
  toolVersions: Record<string, string> = {},
  now = new Date().toISOString(),
  idempotencyKey?: string
): SystemRunState {
  if (!inputHash.trim()) throw new Error("Stage input hash is required");
  const activeStage = SYSTEM_STAGES.find((candidate) => {
    const checkpoint = latestCheckpoint(state, candidate);
    return checkpoint?.status === "running" && !checkpoint.invalidatedAt;
  });
  if (activeStage && activeStage !== stage) {
    throw new Error("Cannot start " + stage + ": " + activeStage + " is already running");
  }

  const previous = latestCheckpoint(state, stage);
  if (
    previous &&
    !previous.invalidatedAt &&
    !canTransitionStageStatus(previous.status, "running")
  ) {
    throw new Error(`Cannot start ${stage} from ${previous.status}`);
  }

  const attempt: StageCheckpoint = {
    stage,
    attempt: (previous?.attempt ?? 0) + 1,
    status: "running",
    startedAt: now,
    inputHash,
    toolVersions,
    artifactPaths: [],
    idempotencyKey,
  };

  return {
    ...state,
    updatedAt: now,
    currentStage: stage,
    checkpoints: {
      ...state.checkpoints,
      [stage]: [...(state.checkpoints[stage] ?? []), attempt],
    },
  };
}

export function finishStage(
  state: SystemRunState,
  stage: SystemStage,
  result: {
    status: Exclude<StageStatus, "pending" | "running">;
    outputHash?: string;
    artifactPaths?: string[];
    failure?: StageFailure;
    humanDecision?: string;
    externalResultId?: string;
    compensation?: string;
  },
  now = new Date().toISOString()
): SystemRunState {
  const attempts = state.checkpoints[stage];
  const current = attempts?.[attempts.length - 1];
  if (!attempts || !current || current.status !== "running") {
    throw new Error(`Cannot finish ${stage}: no running attempt`);
  }
  if (!canTransitionStageStatus("running", result.status)) {
    throw new Error(`Cannot finish ${stage} as ${result.status}`);
  }
  if (
    ["blocked", "retryable-failed", "terminal-failed"].includes(result.status) &&
    !result.failure
  ) {
    throw new Error(`${result.status} requires failure evidence`);
  }
  if (result.status === "needs-human" && !result.failure && !result.humanDecision) {
    throw new Error("needs-human requires failure evidence or a recorded decision");
  }
  if (result.status === "skipped-by-policy" && !result.humanDecision) {
    throw new Error("skipped-by-policy requires a recorded policy decision");
  }
  if (result.status === "passed" && !result.outputHash) {
    throw new Error("Passed stages require an output hash");
  }

  const completed: StageCheckpoint = {
    ...current,
    status: result.status,
    completedAt: now,
    outputHash: result.outputHash,
    artifactPaths: result.artifactPaths ?? [],
    failure: result.failure,
    humanDecision: result.humanDecision,
    externalResultId: result.externalResultId,
    compensation: result.compensation,
  };

  return {
    ...state,
    updatedAt: now,
    checkpoints: {
      ...state.checkpoints,
      [stage]: [...attempts.slice(0, -1), completed],
    },
  };
}

export function getRecoveryDecision(state: SystemRunState): RecoveryDecision {
  const checkpoint = latestCheckpoint(state, state.currentStage);
  if (!checkpoint) {
    return {
      action: "stop",
      stage: state.currentStage,
      reason: "Current stage has no checkpoint",
    };
  }

  if (checkpoint.invalidatedAt) {
    return {
      action: "continue",
      stage: checkpoint.stage,
      reason: checkpoint.invalidationReason ?? "Checkpoint was invalidated",
    };
  }

  if (checkpoint.status === "pending" || checkpoint.status === "running") {
    return {
      action: "continue",
      stage: checkpoint.stage,
      reason: `Stage is ${checkpoint.status}`,
    };
  }

  if (checkpoint.status === "passed" || checkpoint.status === "skipped-by-policy") {
    const following = nextStage(checkpoint.stage);
    return following
      ? { action: "continue", stage: following, reason: "Previous stage completed" }
      : { action: "complete", stage: checkpoint.stage, reason: "Pipeline completed" };
  }

  if (checkpoint.status === "blocked" || checkpoint.status === "needs-human") {
    return {
      action: "await-human",
      stage: checkpoint.stage,
      reason:
        checkpoint.failure?.humanDecisionRequired ??
        checkpoint.failure?.message ??
        "A human decision or missing prerequisite is required",
    };
  }

  if (checkpoint.status === "retryable-failed" && checkpoint.failure) {
    const policy = DEFAULT_RETRY_POLICIES[checkpoint.failure.kind];
    if (checkpoint.attempt < policy.maxAttempts) {
      return {
        action: "retry",
        stage: checkpoint.stage,
        delaySeconds: policy.backoffSeconds[checkpoint.attempt - 1] ?? 0,
        reason: checkpoint.failure.message,
      };
    }
  }

  const branchStage = checkpoint.failure?.branchBackTo ?? BRANCH_BACK_STAGE[checkpoint.stage];
  if (
    branchStage &&
    (checkpoint.failure?.kind === "quality-gate" ||
      checkpoint.failure?.kind === "artifact-integrity")
  ) {
    return {
      action: "branch-back",
      stage: branchStage,
      reason: checkpoint.failure.message,
    };
  }

  return {
    action: "stop",
    stage: checkpoint.stage,
    reason: checkpoint.failure?.message ?? `Stage ended as ${checkpoint.status}`,
  };
}

export function invalidateFromStage(
  state: SystemRunState,
  stage: SystemStage,
  reason: string,
  now = new Date().toISOString()
): SystemRunState {
  if (!reason.trim()) throw new Error("Invalidation reason is required");
  const startIndex = SYSTEM_STAGES.indexOf(stage);
  const checkpoints = { ...state.checkpoints };

  for (const affectedStage of SYSTEM_STAGES.slice(startIndex)) {
    const attempts = checkpoints[affectedStage];
    if (!attempts?.length) continue;
    checkpoints[affectedStage] = attempts.map((attempt, index) =>
      index === attempts.length - 1
        ? { ...attempt, invalidatedAt: now, invalidationReason: reason }
        : attempt
    );
  }

  return { ...state, updatedAt: now, currentStage: stage, checkpoints };
}

export function getResumeStage(state: SystemRunState): SystemStage {
  for (const stage of SYSTEM_STAGES) {
    const checkpoint = latestCheckpoint(state, stage);
    if (!checkpoint || checkpoint.invalidatedAt) return stage;
    if (checkpoint.status === "passed" || checkpoint.status === "skipped-by-policy") continue;
    return getRecoveryDecision({ ...state, currentStage: stage }).stage;
  }
  return "store-prep";
}
