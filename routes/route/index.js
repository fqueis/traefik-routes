"use strict";

const fileHelper = require("./../../utils/file-helper");

/**
 * Defines the schema for the /add route's body.
 * Ensures 'subdomain' and 'targetIp' are present and are strings.
 */
const addRouteSchema = {
  body: {
    type: "object",
    required: ["subdomain", "targetIp"],
    properties: {
      subdomain: { type: "string" },
      targetIp: { type: "string" },
    },
  },
};

/**
 * Defines the schema for the /delete route's body.
 * Ensures 'subdomain' is present and is a string.
 */
const deleteRouteSchema = {
  body: {
    type: "object",
    required: ["subdomain"],
    properties: {
      subdomain: { type: "string" },
    },
  },
};

/**
 * Fastify plugin for managing routes.
 * @type {import('fastify').FastifyPluginAsync}
 */
module.exports = async function (fastify, opts) {
  const routeOptions = {
    onRequest: [fastify.verifyApiKey],
  };

  // Route to add a new subdomain configuration
  fastify.post(
    "/add",
    {
      ...routeOptions,
      schema: addRouteSchema,
    },
    /**
     * Handles the logic for adding a new route.
     * @param {import('fastify').FastifyRequest} request The Fastify request object
     * @param {import('fastify').FastifyReply} reply The Fastify reply object
     */
    async function (request, reply) {
      try {
        const { subdomain, targetIp } = request.body;

        await fileHelper.writeRouteFile(subdomain, targetIp);

        return reply.status(201).send({ message: "Route added successfully" });
      } catch (error) {
        request.log.error(
          { err: error, subdomain: request.body.subdomain },
          "Failed to write route file"
        );
        return reply
          .status(500)
          .send({ message: "Failed to add route due to a server error" });
      }
    }
  );

  // Route to delete a subdomain configuration
  fastify.post(
    "/delete",
    {
      ...routeOptions,
      schema: deleteRouteSchema,
    },
    /**
     * Handles the logic for deleting a route.
     * @param {import('fastify').FastifyRequest} request The Fastify request object
     * @param {import('fastify').FastifyReply} reply The Fastify reply object
     */
    async function (request, reply) {
      try {
        const { subdomain } = request.body;

        const result = await fileHelper.removeRouteFile(subdomain);

        if (!result) {
          return reply
            .status(404)
            .send({ message: `Route for subdomain '${subdomain}' not found` });
        }

        return reply
          .status(200)
          .send({ message: "Route deleted successfully" });
      } catch (error) {
        request.log.error(
          { err: error, subdomain: request.body.subdomain },
          "Failed to remove route file"
        );
        return reply
          .status(500)
          .send({ message: "Failed to delete route due to a server error" });
      }
    }
  );
};
