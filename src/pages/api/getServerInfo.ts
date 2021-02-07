import { NextApiHandler } from "next";
import os from "os";
import * as cluster from "cluster";

export type ServerInfoType = {
  clusters: number;
  cpus: number;
  policy: string;
};

const index: NextApiHandler = async (_, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify(
      {
        clusters: Number(process.env.CLUSTERS) ?? 1,
        cpus: os.cpus().length,
        policy: cluster.schedulingPolicy === cluster.SCHED_NONE ? "NONE" : "RR",
      },
      undefined,
      "  "
    )
  );
};
export default index;
