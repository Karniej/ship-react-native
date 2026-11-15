function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const invalidDeviceProofContracts = [
  {
    name: "missing observed target class",
    expected: "requiredReportFields",
    mutate(contract) {
      contract.requiredReportFields = contract.requiredReportFields.filter(
        (field) => field !== "observedTargetClass"
      );
    },
  },
  {
    name: "negated report backlink",
    expected: "link bidirectionally",
    mutate(contract) {
      contract.bidirectionalLinks.reportLinksRunLog = false;
    },
  },
  {
    name: "missing advertised MCP tool names",
    expected: "advertised tool names",
    mutate(contract) {
      contract.toolEvidence.maestro.requiresAdvertisedToolNames = false;
    },
  },
  {
    name: "artifact inventory without sizes",
    expected: "file sizes",
    mutate(contract) {
      contract.artifactInventory.requiredFields = ["path", "sha256"];
    },
  },
  {
    name: "unconditional replay requirement",
    expected: "not-applicable",
    mutate(contract) {
      contract.statuses["simulator-passed"].adReplayPath = "required";
    },
  },
].map((fixture) => ({
  name: fixture.name,
  expected: fixture.expected,
  contractFor(validContract) {
    const contract = clone(validContract);
    fixture.mutate(contract);
    return contract;
  },
}));

module.exports = { invalidDeviceProofContracts };
