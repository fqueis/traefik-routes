"use strict";

require("dotenv").config();

const envToLogger = {
  development: {
    level: "debug",
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: { level: "warn" },
  test: false,
};

const fastify = require("fastify")({
  logger: envToLogger[process.env.NODE_ENV] ?? true,
});

const autoload = require("@fastify/autoload");
const path = require("path");

const run = async () => {
  if (!process.env.TRAEFIK_ROUTES_PATH) {
    console.error(
      "Error: TRAEFIK_ROUTES_PATH environment variable is not set."
    );
    process.exit(1);
  }

  fastify.listen(
    { host: "0.0.0.0", port: process.env.FASTIFY_PORT || 3000 },
    (err) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
    }
  );

  fastify.register(autoload, {
    dir: path.join(__dirname, "routes"),
    options: { prefix: "/api/v1" },
  });
};

run().catch(console.error);
