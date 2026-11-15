const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { validateDeviceProofContract } = require("./device-proof-contract.cjs");
const { invalidDeviceProofContracts } = require("./device-proof-contract.fixtures.cjs");

const contractPath = path.resolve(__dirname, "../../../device-proof.contract.json");
const validContract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

test("accepts the normative Device-proof contract", () => {
  assert.deepEqual(validateDeviceProofContract(validContract), []);
});

for (const fixture of invalidDeviceProofContracts) {
  test("rejects " + fixture.name, () => {
    const errors = validateDeviceProofContract(fixture.contractFor(validContract));
    assert.ok(
      errors.some((error) => error.includes(fixture.expected)),
      "expected an error containing " + fixture.expected + ", received: " + errors.join("; ")
    );
  });
}
