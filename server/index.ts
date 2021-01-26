import next from "next";
import * as os from "os";
import * as cluster from "cluster";
import { parse } from "url";
import fastify from "fastify";

const dev = process.env.NODE_ENV !== "production";
const clusterSize = Math.min(os.cpus().length, 4);
const port_number = 3000;
if (cluster.isMaster) {
  const workers: cluster.Worker[] = [];

  const createWorker = (clusterSize: number) => {
    for (let i = 0; i < clusterSize; i++) {
      const worker = cluster.fork({ INDEX: i, CLUSTERS: clusterSize });
      workers.push(worker);
      worker.addListener("message", (params) => {
        try {
          const command = JSON.parse(params) as { [key: string]: unknown };
          const clusters = Number(command.clusters);
          if (clusters && clusters !== clusterSize) {
            workers.forEach((worker) => {
              worker.disconnect();
              worker.disconnect();
            });
            createWorker(clusters);
          }
        } catch (e) {
          //
        }
      });
    }
  };
  createWorker(Number(clusterSize));
} else {
  const app = next({ dev });
  const handle = app.getRequestHandler();
  const server = fastify();
  server.register(require("fastify-compress"), { global: false });
  app.prepare().then(() => {
    server.all("/set/:COUNT", async (req, res) => {
      res.raw.statusCode = 200;
      res.raw.setHeader("Content-Type", "application/json");
      res.raw.end('{ result: "ok" }');
      res.raw.once("close", () => {
        const count = Number((<{ [key: string]: string }>req.params)["COUNT"]);
        count && cluster.worker.send(JSON.stringify({ clusters: count }));
      });
    });
    server.all("*", (req, res) => {
      return handle(req.raw, res.raw, parse(req.url, true));
    });
    server.listen(port_number).then(() => {
      console.log(
        `[${process.env.INDEX ?? 0}]:http://localhost:${port_number}`
      );
      cluster.worker.on("disconnect", () => {
        (app as typeof app & { close: () => void }).close();
        server.close();
      });
    });
  });
}
