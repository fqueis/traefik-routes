"use strict";

const fp = require("fastify-plugin");

module.exports = fp(function (fastify, opts) {
  const verifyApiKey = (request, reply, done) => {
    const apiKey = request.headers["x-api-key"];

    if (!apiKey) return reply.status(401).send({ message: "Unauthorized" });

    if (apiKey !== process.env.API_KEY) {
      return reply.status(403).send({ message: "Forbidden" });
    }

    done();
  };

  fastify.decorate("verifyApiKey", verifyApiKey);
});
