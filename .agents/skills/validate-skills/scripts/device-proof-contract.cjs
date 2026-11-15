const EXPECTED_STATUSES = [
  "blocked",
  "simulator-passed",
  "real-device-passed",
  "device-unavailable",
  "failed",
];

const REQUIRED_REPORT_FIELDS = [
  "finalStatus",
  "platform",
  "timestamp",
  "requestedTarget",
  "observedTargetClass",
  "anonymizedDevice",
  "appIdentifier",
  "testIntent",
  "maestroFlowPath",
  "adReplayPath",
  "redactedCommandTemplates",
  "maestroVersion",
  "agentDeviceVersion",
  "maestroMcpToolNames",
  "agentDeviceMcpToolNames",
  "simulatorResult",
  "physicalDeviceResult",
  "artifactInventory",
  "failures",
  "retries",
  "selectorRepairs",
  "runLogLink",
];

function includesAll(actual, expected) {
  return Array.isArray(actual) && expected.every((value) => actual.includes(value));
}

function validateDeviceProofContract(contract) {
  const errors = [];
  if (contract?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (contract?.reportPath !== "system-runs/<slug>/device-proof/report.md") {
    errors.push("reportPath must point to the canonical report.md");
  }
  if (contract?.runLogPath !== "system-runs/<slug>/run.md") {
    errors.push("runLogPath must point to the canonical run.md");
  }
  if (!includesAll(contract?.requiredReportFields, REQUIRED_REPORT_FIELDS)) {
    errors.push(
      "requiredReportFields must include target class, MCP tool names, inventory, and backlink"
    );
  }
  if (
    contract?.bidirectionalLinks?.runLogLinksReport !== true ||
    contract?.bidirectionalLinks?.reportLinksRunLog !== true
  ) {
    errors.push("report and run log must link bidirectionally");
  }
  if (
    contract?.toolEvidence?.maestro?.mcpCommand !== "maestro mcp" ||
    contract?.toolEvidence?.maestro?.requiresAdvertisedToolNames !== true
  ) {
    errors.push("Maestro MCP command and advertised tool names are required");
  }
  if (
    contract?.toolEvidence?.agentDevice?.mcpCommand !== "npx --no-install agent-device mcp" ||
    contract?.toolEvidence?.agentDevice?.requiresAdvertisedToolNames !== true
  ) {
    errors.push("agent-device MCP command and advertised tool names are required");
  }
  if (contract?.policies?.maestroCloudMayProvePhysicalDevice !== false) {
    errors.push("Maestro Cloud must not prove a physical-device claim");
  }
  if (
    !includesAll(contract?.policies?.iosPhysicalPrerequisites, [
      "xcode-signing",
      "provisioning",
      "pairing",
      "developer-mode",
    ])
  ) {
    errors.push("iOS physical-device prerequisites are incomplete");
  }
  if (
    !includesAll(contract?.policies?.redactedValues, [
      "credentials",
      "signing-data",
      "replay-values",
      "device-identifiers",
      "expo-dev-client-urls",
    ])
  ) {
    errors.push("sensitive Device-proof values must be redacted");
  }
  if (
    !includesAll(contract?.artifactInventory?.requiredFields, ["path", "sizeBytes", "sha256"]) ||
    contract?.artifactInventory?.requireNonEmptyFor !== "real-device-passed"
  ) {
    errors.push(
      "artifact inventory must record paths, file sizes, hashes, and physical-pass non-emptiness"
    );
  }

  const statuses = contract?.statuses ?? {};
  if (!includesAll(Object.keys(statuses), EXPECTED_STATUSES)) {
    errors.push("all canonical Device-proof statuses are required");
  }
  const physicalPass = statuses["real-device-passed"];
  if (
    physicalPass?.adReplayPath !== "required" ||
    !includesAll(physicalPass?.requiredArtifacts, [".ad", "mp4", "screenshot", "log"])
  ) {
    errors.push("real-device-passed requires replay, video, screenshot, and log artifacts");
  }
  for (const status of EXPECTED_STATUSES.filter((value) => value !== "real-device-passed")) {
    if (statuses[status]?.adReplayPath !== "not-applicable") {
      errors.push(status + " must mark the .ad replay path not-applicable");
    }
    if (
      !Array.isArray(statuses[status]?.requiredArtifacts) ||
      statuses[status].requiredArtifacts.length
    ) {
      errors.push(status + " must not require physical-device artifacts");
    }
  }
  return errors;
}

module.exports = { validateDeviceProofContract };
