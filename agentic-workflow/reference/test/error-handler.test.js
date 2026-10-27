const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const express = require("express");
const { createErrorHandler } = require("../src/middleware");

const lines = [];
const log = (line) => lines.push(line);

let server;
let baseUrl;

before(async () => {
  // createApp has no throwing route, so the handler is mounted on a small app of its own.
  const app = express();
  app.get("/throws", () => {
    throw new Error("secret detail");
  });
  app.get("/rejects", async () => {
    throw new Error("secret detail");
  });
  app.get("/bad-input", (req, res, next) => {
    next(Object.assign(new Error("Bad input"), { status: 400 }));
  });
  app.get("/bad-status", (req, res, next) => {
    next(Object.assign(new Error("Not an error status"), { status: 200 }));
  });
  app.use(createErrorHandler(log));

  server = app.listen(0);
  await once(server, "listening");
  baseUrl = `http://localhost:${server.address().port}`;
});

beforeEach(() => {
  lines.length = 0;
});

after(() => server.close());

for (const path of ["/throws", "/rejects"]) {
  test(`GET ${path} with a failing handler returns 500 without the error details and logs the stack`, async () => {
    const response = await fetch(`${baseUrl}${path}`);
    const body = await response.json();

    assert.equal(response.status, 500);
    assert.deepEqual(body, { error: "Internal server error" });
    assert.equal(lines.length, 1);
    assert.match(lines[0], /secret detail/);
    assert.ok(lines[0].includes("\n    at "), "the logged entry holds a stack frame");
  });
}

test("GET /bad-input with an error that has status 400 returns 400 and its message", async () => {
  const response = await fetch(`${baseUrl}/bad-input`);
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, { error: "Bad input" });
});

test("GET /bad-status with an error whose status is not an error status returns 500", async () => {
  const response = await fetch(`${baseUrl}/bad-status`);
  const body = await response.json();

  assert.equal(response.status, 500);
  assert.deepEqual(body, { error: "Internal server error" });
});
