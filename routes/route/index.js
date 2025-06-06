"use strict";

const fileHelper = require("./../../utils/file-helper");

/**  @type {import('fastify').FastifyPluginAsync<{ optionA: boolean, optionB: string }>} */
module.exports = async (fastify, opts) => {
  fastify.post("/add", async function (request, reply) {
    try {
      const { subdomain, targetIp } = request.body;

      if (!subdomain || !targetIp) {
        return reply
          .status(400)
          .send({ error: "Missing subdomain or target IP" });
      }

      await fileHelper.writeRouteFile(subdomain, targetIp);

      return reply.status(201).send({ message: "ok" });
    } catch (error) {
      console.error(`Error deleting route for subdomain ${subdomain}:`, error);

      return reply.status(500).json({ error: "Failed to delete route" });
    }
  });

  fastify.post("/delete", async function (request, reply) {
    try {
      const { subdomain } = request.body;

      if (!subdomain) {
        return reply.status(400).send({ error: "Missing subdomain" });
      }

      const result = await fileHelper.removeRouteFile(subdomain);

      return reply
        .status(result ? 200 : 404)
        .send({ message: result ? "ok" : "not found" });
    } catch (error) {
      console.error(`Error deleting route for subdomain ${subdomain}:`, error);

      return reply.status(500).json({ error: "Failed to delete route" });
    }
  });
};
