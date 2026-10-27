const express = require("express");
const { createRequestLogger, notFound, createErrorHandler } = require("./middleware");

function createApp(config) {
  const app = express();

  app.disable("x-powered-by");
  // First, so that parser errors and unknown routes are logged too.
  app.use(createRequestLogger(config.log));

  // TODO(TD-app-foundation-1): mount helmet() here (SEC-7).
  // TODO(TD-app-foundation-2): mount CORS for known origins here, before the body parser (SEC-8).

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use(notFound);
  app.use(createErrorHandler(config.log));

  return app;
}

module.exports = { createApp };
