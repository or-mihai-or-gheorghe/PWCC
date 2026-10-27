const { test } = require("node:test");
const assert = require("node:assert/strict");
const { loadConfig } = require("../src/config");

test("loadConfig without PORT uses port 3000", () => {
  assert.deepEqual(loadConfig({}), { port: 3000 });
});

test("loadConfig with PORT=8080 uses port 8080", () => {
  assert.deepEqual(loadConfig({ PORT: "8080" }), { port: 8080 });
});

test("loadConfig with a PORT that is not an integer from 1 to 65535 throws an error that names PORT", () => {
  for (const value of ["abc", "0", "70000"]) {
    assert.throws(() => loadConfig({ PORT: value }), { message: /PORT/ }, `PORT=${value}`);
  }
});
