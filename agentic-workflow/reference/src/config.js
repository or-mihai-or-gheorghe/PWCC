const DEFAULT_PORT = 3000;
const MIN_PORT = 1;
const MAX_PORT = 65535;

function parsePort(value) {
  if (value === undefined) {
    return DEFAULT_PORT;
  }
  // Digits only: Number() would also accept "", " 80", "8e3" and "0x50".
  const port = /^\d+$/.test(value) ? Number(value) : NaN;
  if (!Number.isInteger(port) || port < MIN_PORT || port > MAX_PORT) {
    throw new Error("PORT must be an integer from 1 to 65535");
  }
  return port;
}

function loadConfig(env) {
  return { port: parsePort(env.PORT) };
}

module.exports = { loadConfig };
