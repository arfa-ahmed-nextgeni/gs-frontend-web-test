"use strict";

const enabled =
  process.env.NEW_RELIC_ENABLED !== "false" &&
  !!process.env.NEW_RELIC_LICENSE_KEY;

exports.config = {
  enabled: enabled,
  app_name: [process.env.NEW_RELIC_APP_NAME || "goldenscent-web"],
  application_logging: {
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
  },
  attributes: {
    exclude: [
      "request.headers.cookie",
      "request.headers.authorization",
      "request.headers.proxyAuthorization",
      "request.headers.setCookie*",
      "request.headers.x*",
      "response.headers.cookie",
      "response.headers.authorization",
      "response.headers.proxyAuthorization",
      "response.headers.setCookie*",
    ],
  },
  distributed_tracing: {
    enabled: true,
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404, 400, 401, 403],
  },
  license_key: process.env.NEW_RELIC_LICENSE_KEY || "",
  logging: {
    filepath: "stdout",
    level: process.env.NEW_RELIC_LOG_LEVEL || "info",
  },
  transaction_tracer: {
    enabled: true,
    record_sql: "obfuscated",
  },

  utilization: {
    detect_aws: true,
  },
};
