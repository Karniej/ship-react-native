#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { validateDeviceProofContract } = require("./device-proof-contract.cjs");

const root = path.resolve(__dirname, "../../../..");
const PINNED_AGENT_DEVICE_VERSION = "0.20.6";
const expectedPipeline = [
  "Idea",
  "Validate",
  "Spec",
  "Design",
  "Setup",
  "Build",
  "Verify",
  "Device-proof",
  "Store-prep",
];
const requiredSkills = [
  "ship-system",
  "validate-idea",
  "design-screens",
  "create-spec",
  "verify-on-device",
];
const errors = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`missing referenced file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function parseFrontmatter(relativePath) {
  const content = read(relativePath);
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    errors.push(`missing YAML frontmatter: ${relativePath}`);
    return {};
  }

  const result = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    result[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return result;
}

for (const skill of requiredSkills) {
  const relativePath = `.agents/skills/${skill}/SKILL.md`;
  const frontmatter = parseFrontmatter(relativePath);
  if (frontmatter.name !== skill) {
    errors.push(`${relativePath}: name must match directory (${skill})`);
  }
  if (!frontmatter.description) {
    errors.push(`${relativePath}: description is required`);
  }
}

const manifestText = read(".agents/manifest.json");
let manifest;
try {
  manifest = JSON.parse(manifestText);
} catch (error) {
  errors.push(`invalid .agents/manifest.json: ${error.message}`);
}

if (manifest) {
  if (manifest.product !== "ShipReactNative System") {
    errors.push("manifest product must be ShipReactNative System");
  }

  const stages = manifest.pipeline?.map((stage) => stage.stage);
  if (JSON.stringify(stages) !== JSON.stringify(expectedPipeline)) {
    errors.push(`manifest pipeline must be: ${expectedPipeline.join(" → ")}`);
  }

  if (!Array.isArray(manifest.skills)) {
    errors.push("manifest skills must be an array");
  } else {
    for (const skill of manifest.skills) {
      if (
        !skill.name ||
        !skill.job ||
        !Array.isArray(skill.inputs) ||
        !Array.isArray(skill.outputs)
      ) {
        errors.push("every manifest skill needs name, job, inputs, and outputs");
        continue;
      }
      read(`.agents/skills/${skill.name}/SKILL.md`);
    }
  }

  if (!Array.isArray(manifest.docs)) {
    errors.push("manifest docs must be an array");
  } else {
    for (const doc of manifest.docs) read(doc.path);
  }

  const license = manifest.license;
  if (
    license?.source !== "LICENSE" ||
    license?.type !== "MIT" ||
    typeof license?.summary !== "string"
  ) {
    errors.push("manifest license must describe the MIT LICENSE");
  } else if (!/^MIT License/.test(read(license.source))) {
    errors.push("LICENSE must be the MIT License");
  }
}

const pipelineText = expectedPipeline.join(" → ");
for (const relativePath of ["AGENTS.md", ".agents/skills/ship-system/SKILL.md"]) {
  const content = read(relativePath);
  if (!content.includes(pipelineText)) {
    errors.push(`${relativePath}: pipeline must be exactly ${pipelineText}`);
  }
}

const mcpText = read(".mcp.json");
let mcpConfig;
try {
  mcpConfig = JSON.parse(mcpText);
} catch (error) {
  errors.push(`invalid .mcp.json: ${error.message}`);
}

const claudeDesign = mcpConfig?.mcpServers?.["claude-design"];
if (
  claudeDesign?.type !== "http" ||
  claudeDesign?.url !== "https://api.anthropic.com/v1/design/mcp"
) {
  errors.push(".mcp.json must configure Anthropic's official claude-design HTTP MCP");
}

const maestro = mcpConfig?.mcpServers?.maestro;
if (maestro?.command !== "maestro" || JSON.stringify(maestro?.args) !== JSON.stringify(["mcp"])) {
  errors.push(".mcp.json must start the official Maestro MCP with maestro mcp");
}

const agentDevice = mcpConfig?.mcpServers?.["agent-device"];
if (
  agentDevice?.command !== "npx" ||
  JSON.stringify(agentDevice?.args) !== JSON.stringify(["--no-install", "agent-device", "mcp"])
) {
  errors.push(".mcp.json must start the pinned local agent-device MCP");
}

const packageText = read("package.json");
let packageJson;
try {
  packageJson = JSON.parse(packageText);
} catch (error) {
  errors.push(`invalid package.json: ${error.message}`);
}
if (packageJson) {
  if (packageJson.devDependencies?.["agent-device"] !== PINNED_AGENT_DEVICE_VERSION) {
    errors.push("package.json must pin agent-device to " + PINNED_AGENT_DEVICE_VERSION);
  }
  if (packageJson.scripts?.["device:help"] !== "agent-device help workflow") {
    errors.push("package.json must expose the version-matched agent-device workflow help");
  }
  if (packageJson.scripts?.["device:version"] !== "agent-device --version") {
    errors.push("package.json must expose the pinned agent-device version command");
  }
}

const packageLockPath = path.join(root, "package-lock.json");
if (fs.existsSync(packageLockPath)) {
  let packageLock;
  try {
    packageLock = JSON.parse(fs.readFileSync(packageLockPath, "utf8"));
  } catch (error) {
    errors.push("invalid package-lock.json: " + error.message);
  }
  if (
    packageLock &&
    packageLock.packages?.[""]?.devDependencies?.["agent-device"] !== PINNED_AGENT_DEVICE_VERSION
  ) {
    errors.push("package-lock.json root must pin agent-device to " + PINNED_AGENT_DEVICE_VERSION);
  }
  if (
    packageLock &&
    packageLock.packages?.["node_modules/agent-device"]?.version !== PINNED_AGENT_DEVICE_VERSION
  ) {
    errors.push("package-lock.json resolved agent-device must be " + PINNED_AGENT_DEVICE_VERSION);
  }
}

const deviceContractText = read(".agents/device-proof.contract.json");
let deviceContract;
try {
  deviceContract = JSON.parse(deviceContractText);
} catch (error) {
  errors.push("invalid .agents/device-proof.contract.json: " + error.message);
}
if (deviceContract) {
  for (const error of validateDeviceProofContract(deviceContract)) {
    errors.push("invalid Device-proof contract: " + error);
  }
}

const designSkill = read(".agents/skills/design-screens/SKILL.md");
for (const requirement of [
  "/design-login",
  "/design-sync",
  "design/<slug>/claude-design.md",
  "design/<slug>/claude-design/",
  "markdown-only",
  "STOP",
]) {
  if (!designSkill.includes(requirement)) {
    errors.push(`design-screens must enforce Claude Design requirement: ${requirement}`);
  }
}

const buildSkill = read(".agents/skills/build-idea/SKILL.md");
for (const requirement of ["design/<slug>/claude-design.md", "design/<slug>/claude-design/"]) {
  if (!buildSkill.includes(requirement)) {
    errors.push(`build-idea must require Claude Design handoff: ${requirement}`);
  }
}

for (const relativePath of [
  ".agents/manifest.json",
  ".agents/skills/design-screens/SKILL.md",
  ".agents/skills/ship-system/SKILL.md",
  ".agents/skills/build-idea/SKILL.md",
  "AGENTS.md",
  "START_HERE.md",
  "README.md",
  "docs/CLAUDE_DESIGN.md",
  "docs/CODEBASE_ANALYSIS.md",
]) {
  if (/mobbin/i.test(read(relativePath))) {
    errors.push(`${relativePath}: Mobbin must not remain in the active Claude Design contract`);
  }
}

const validationSkill = read(".agents/skills/validate-idea/SKILL.md");
for (const requirement of [
  "validation/<slug>/evidence.json",
  "fetched-at",
  "unvalidated",
  "30 days",
  "never estimate",
]) {
  if (!validationSkill.toLowerCase().includes(requirement)) {
    errors.push("validate-idea must enforce evidence requirement: " + requirement);
  }
}

const recoveryDoc = read("docs/RECOVERY_CONTRACT.md");
for (const requirement of [
  "retryable-failed",
  "terminal-failed",
  "needs-human",
  "inputhash",
  "outputhash",
  "branchbackto",
  "idempotency",
]) {
  if (!recoveryDoc.toLowerCase().includes(requirement)) {
    errors.push("recovery contract must include: " + requirement);
  }
}

const sourceSpecs = path.join(root, "opportunity-data/100appideas/specs");
if (fs.existsSync(sourceSpecs)) {
  const ideaSpecs = fs
    .readdirSync(sourceSpecs)
    .filter((name) => name.endsWith(".md") && name !== "INDEX.md");
  if (ideaSpecs.length !== 76) {
    errors.push("100AppIdeas snapshot must contain 76 idea specs (found " + ideaSpecs.length + ")");
  }
} else {
  errors.push("missing 100AppIdeas spec snapshot");
}

const systemPackageText = read("packages/system/package.json");
let systemPackage;
try {
  systemPackage = JSON.parse(systemPackageText);
} catch (error) {
  errors.push("invalid packages/system/package.json: " + error.message);
}
for (const entry of ["./opportunity", "./run-state"]) {
  if (!systemPackage?.exports?.[entry]) {
    errors.push("system package must export " + entry);
  }
}

const agentsLines = read("AGENTS.md").split("\n").length;
if (agentsLines > 150) errors.push(`AGENTS.md must stay under 150 lines (found ${agentsLines})`);

if (errors.length) {
  console.error("ShipReactNative System validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("ShipReactNative System validation passed.");
console.log(`Pipeline: ${pipelineText}`);
console.log(`New skills: ${requiredSkills.join(", ")}`);
