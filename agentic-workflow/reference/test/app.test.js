const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createApp } = require("../src/app");

const lines = [];
const log = (line) => lines.push(line);

// <ISO timestamp> <method> <path> <status> <duration>ms
const LOG_LINE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z (\S+) (\S+) (\d{3}) \d+ms$/;

let server;
let baseUrl;

before(async () => {
  server = createApp({ log }).listen(0);
  await once(server, "listening");
  baseUrl = `http://localhost:${server.address().port}`;
});

beforeEach(() => {
  lines.length = 0;
});

after(() => server.close());

// fetch sends text/plain for a string body, so the JSON content type is set explicitly.
function postJson(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

test("GET /health returns 200 and exactly { status: ok } as JSON", async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^application\/json/);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("a request with a malformed JSON body returns 400 with only an error text", async () => {
  const response = await postJson("/health", '{"title":');
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.equal(typeof body.error, "string");
  assert.notEqual(body.error, "");
});

test("a JSON body over 100 kb returns 413 with only an error text", async () => {
  const response = await postJson("/health", JSON.stringify({ data: "x".repeat(150_000) }));
  const body = await response.json();

  assert.equal(response.status, 413);
  assert.deepEqual(Object.keys(body), ["error"]);
  assert.equal(typeof body.error, "string");
  assert.notEqual(body.error, "");
});

test("GET /nope?x=1 returns 404 naming the method and the path without the query", async () => {
  const response = await fetch(`${baseUrl}/nope?x=1`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Route GET /nope does not exist" });
});

test("DELETE /health returns 404 because only GET is defined", async () => {
  const response = await fetch(`${baseUrl}/health`, { method: "DELETE" });

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: "Route DELETE /health does not exist" });
});

test("responses to a known and an unknown route carry no X-Powered-By header", async () => {
  const known = await fetch(`${baseUrl}/health`);
  const unknown = await fetch(`${baseUrl}/nope`);

  assert.equal(known.headers.get("x-powered-by"), null);
  assert.equal(unknown.headers.get("x-powered-by"), null);
});

test("GET /health?token=abc is logged once with method, path, status and duration, without the query", async () => {
  const response = await fetch(`${baseUrl}/health?token=abc`);
  await response.json();

  assert.equal(lines.length, 1);
  const match = LOG_LINE.exec(lines[0]);
  assert.ok(match, `unexpected log line: ${lines[0]}`);
  assert.deepEqual(match.slice(1, 4), ["GET", "/health", "200"]);
  assert.ok(!lines[0].includes("token"));
});

test("GET /nope is logged with status 404", async () => {
  const response = await fetch(`${baseUrl}/nope`);
  await response.json();

  assert.equal(lines.length, 1);
  const match = LOG_LINE.exec(lines[0]);
  assert.ok(match, `unexpected log line: ${lines[0]}`);
  assert.deepEqual(match.slice(1, 4), ["GET", "/nope", "404"]);
});
