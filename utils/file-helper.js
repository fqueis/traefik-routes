"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const TRAEFIK_ROUTES_PATH = process.env.TRAEFIK_ROUTES_PATH;

const writeRouteFile = (subdomain, targetIp) => {
  const config = {
    http: {
      routers: {
        [`${subdomain}-router`]: {
          rule: `Host(\`${subdomain}.session.lyk0z.click\`)`,
          entryPoints: ["websecure"],
          service: `${subdomain}-service`,
          tls: { certResolver: "letsencrypt" },
        },
      },
      services: {
        [`${subdomain}-service`]: {
          loadBalancer: {
            servers: [{ url: `https://${targetIp}:8443` }],
            passHostHeader: true,
            serversTransport: "insecureTransport",
          },
        },
      },
      serversTransports: {
        insecureTransport: {
          insecureSkipVerify: true,
        },
      },
    },
  };

  const yamlStr = yaml.dump(config);
  const filePath = path.join(TRAEFIK_ROUTES_PATH, `${subdomain}.yml`);

  return fs.promises.writeFile(filePath, yamlStr);
};

const removeRouteFile = async (subdomain) => {
  const filePath = path.join(TRAEFIK_ROUTES_PATH, `${subdomain}.yml`);

  if (fs.existsSync(filePath)) {
    await fs.promises.unlink(filePath);
    return true;
  }

  return false;
};

module.exports = { writeRouteFile, removeRouteFile };
