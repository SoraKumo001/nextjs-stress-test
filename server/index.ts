import next from "next";
import * as os from "os";
import * as cluster from "cluster";
import { parse } from "url";
import fastify from "fastify";

const dev = process.env.NODE_ENV !== "production";
const clusterSize = process.env.CLUSTERS || os.cpus().length;
const port_number = 3000;
const app = next({ dev });
const handle = app.getRequestHandler();
if (cluster.isMaster) {
  for (let i = 0; i < clusterSize; i++) {
    cluster.fork();
  }
} else {
  const server = fastify();
  server.register(require("fastify-compress"), { global: false });
  app.prepare().then(() => {
    server.all("*", (req, res) => {
      return handle(req.raw, res.raw, parse(req.url, true));
    });
    server.listen(port_number).then(() => {
      console.log(
        `[${cluster.worker?.id ?? 0}]:http://localhost:${port_number}`
      );
    });
  });
}
