const { loadConfig } = require("./config");
const { createApp } = require("./app");

// Failures set process.exitCode instead of calling process.exit(): the message is written first,
// and the process then ends by itself, as nothing else is running.
function main() {
  let config;
  try {
    config = loadConfig(process.env);
  } catch (error) {
    console.error(`Invalid configuration: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  // Express 5 passes startup errors such as EADDRINUSE to the callback instead of throwing.
  createApp({ ...config, log: console.log }).listen(config.port, (error) => {
    if (error) {
      console.error(`Cannot listen on port ${config.port}: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Task API listening on port ${config.port}`);
  });
}

main();
