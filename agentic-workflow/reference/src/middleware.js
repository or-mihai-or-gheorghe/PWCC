// The path is read when the request arrives: a router mounted later rewrites req.url while it runs,
// and originalUrl carries the query string, which must not reach the log (SEC-10).
// The monotonic clock keeps the duration non-negative.
function createRequestLogger(log) {
  return (req, res, next) => {
    const startedAt = process.hrtime.bigint();
    const path = req.path;
    res.on("finish", () => {
      const durationMs = Math.round(Number(process.hrtime.bigint() - startedAt) / 1e6);
      log(`${new Date().toISOString()} ${req.method} ${path} ${res.statusCode} ${durationMs}ms`);
    });
    next();
  };
}

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} does not exist` });
}

// Express recognizes an error handler by its four parameters, so all four stay.
// The stack goes to the log only; the response carries no detail of a server error (API-6).
function createErrorHandler(log) {
  return (error, req, res, next) => {
    const hasValidStatus = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599;
    const status = hasValidStatus ? error.status : 500;
    if (status >= 500) {
      log(error.stack ?? String(error));
    }
    if (res.headersSent) {
      return next(error);
    }
    res.status(status).json({ error: status >= 500 ? "Internal server error" : error.message });
  };
}

module.exports = { createRequestLogger, notFound, createErrorHandler };
